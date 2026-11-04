"""Generate report figures and animations from saved results (no retraining).

Usage: python -m brain_tumour.report BRATS_367 BRATS_215 BRATS_360
Needs reports/runs/test_results.json, the latest history_*.json and models/best.pt.
Outputs go to reports/figures/.
"""
import json
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.animation import FuncAnimation, PillowWriter  # noqa: E402
from matplotlib.colors import ListedColormap  # noqa: E402

from .config import LABELS, RUNS_DIR, ROOT  # noqa: E402
from .data import load_case  # noqa: E402
from .predict import load_model, predict_case  # noqa: E402

FIG = ROOT / "reports" / "figures"
CMAP = ListedColormap([(0, 0, 0, 0), (1.0, 0.84, 0.04, 1), (0.04, 0.52, 1.0, 1), (1.0, 0.27, 0.23, 1)])
LEG = [plt.Rectangle((0, 0), 1, 1, color=CMAP(i)) for i in (1, 2, 3)]
LEG_N = [f"{i} {LABELS[i]}" for i in (1, 2, 3)]


def latest_history():
    hs = sorted(RUNS_DIR.glob("history_*.json"), key=lambda p: len(json.loads(p.read_text())))
    return json.loads(hs[-1].read_text())  # the longest run


def training_curves():
    h = latest_history()
    ep = [r["epoch"] for r in h]
    fig, ax = plt.subplots(1, 2, figsize=(11, 4))
    ax[0].plot(ep, [r["train_loss"] for r in h], label="train loss")
    ax[0].plot(ep, [r["val_loss"] for r in h], label="validation loss")
    ax[0].set(xlabel="epoch", ylabel="Dice+CE loss", title="Loss"); ax[0].legend()
    for k in ("WT", "TC", "ET"):
        ax[1].plot(ep, [r[f"val_dice_{k}"] for r in h], label=k)
    mean = [np.mean([r[f"val_dice_{k}"] for k in ("WT", "TC", "ET")]) for r in h]
    best = int(np.argmax(mean))
    ax[1].axvline(best, ls="--", c="gray"); ax[1].text(best + 0.1, 0.46, f"best val ckpt (epoch {best})", fontsize=8)
    ax[1].set(xlabel="epoch", ylabel="Dice", title="Validation Dice (4 patients)", ylim=(0.4, 1)); ax[1].legend()
    fig.tight_layout(); fig.savefig(FIG / "training_curves.png", dpi=140); plt.close(fig)


def dice_per_patient():
    r = json.loads((RUNS_DIR / "test_results.json").read_text())
    ids = list(r["per_patient"])
    x = np.arange(len(ids)); w = 0.26
    fig, ax = plt.subplots(figsize=(9, 4))
    for i, k in enumerate(("WT", "TC", "ET")):
        v = [r["per_patient"][c][k] for c in ids]
        ax.bar(x + (i - 1) * w, v, w, label=f"{k} (mean {r['summary'][k]['mean']:.3f} ± {r['summary'][k]['std']:.3f})")
    ax.set_xticks(x, ids); ax.set_ylim(0, 1.18); ax.set_ylabel("Dice")
    ax.set_title(f"Held-out test Dice per patient (n={r['n_test_patients']}, seed {r['seed']})"); ax.legend(loc="upper center", ncol=3, fontsize=8)
    fig.tight_layout(); fig.savefig(FIG / "test_dice_per_patient.png", dpi=140); plt.close(fig)


def best_slice(ref):
    return int(np.argmax((ref > 0).sum(axis=(0, 1))))


def overlays(cases, preds):
    fig, ax = plt.subplots(len(cases), 3, figsize=(10, 3.4 * len(cases)))
    for row, cid in enumerate(cases):
        x, _, _ = load_case(cid)
        pred, ref = preds[cid]
        z = best_slice(ref)
        for col, (title, m) in enumerate((("FLAIR", None), ("Reference annotation", ref), ("Your model (2D U-Net)", pred))):
            a = ax[row, col]
            a.imshow(x[0, :, :, z].T, cmap="gray", origin="lower")
            if m is not None:
                a.imshow(np.ma.masked_equal(m[:, :, z].T, 0), cmap=CMAP, vmin=0, vmax=3, alpha=0.6, origin="lower", interpolation="nearest")
            a.set_title(f"{cid} z={z} · {title}" if col == 0 else title, fontsize=9); a.axis("off")
    fig.legend(LEG, LEG_N, loc="lower center", ncol=3)
    fig.tight_layout(rect=(0, 0.03, 1, 1)); fig.savefig(FIG / "overlays_good_typical_difficult.png", dpi=130); plt.close(fig)


def scroll_gif(cid, pred, ref):
    x, _, _ = load_case(cid)
    zs = [z for z in range(0, x.shape[-1], 2) if ref[:, :, z].any() or pred[:, :, z].any()]
    fig, ax = plt.subplots(1, 2, figsize=(8, 4.2))
    def draw(i):
        z = zs[i]
        for a, t, m in ((ax[0], "Reference annotation", ref), (ax[1], "Your model", pred)):
            a.clear(); a.imshow(x[0, :, :, z].T, cmap="gray", origin="lower")
            a.imshow(np.ma.masked_equal(m[:, :, z].T, 0), cmap=CMAP, vmin=0, vmax=3, alpha=0.6, origin="lower", interpolation="nearest")
            a.set_title(t, fontsize=10); a.axis("off")
        fig.suptitle(f"{cid} · axial slice {z} · FLAIR", fontsize=10)
    FuncAnimation(fig, draw, frames=len(zs)).save(FIG / f"{cid}_slices.gif", writer=PillowWriter(fps=8), dpi=80)
    plt.close(fig)


def rotate_gif(cid, pred, ref, step=3):
    fig = plt.figure(figsize=(9, 4.6))
    axs = [fig.add_subplot(1, 2, i + 1, projection="3d") for i in (0, 1)]
    pts = []
    for m in (ref, pred):
        s = m[::step, ::step, ::step]
        idx = np.argwhere(s > 0)
        pts.append((idx, s[tuple(idx.T)]))
    both = np.concatenate([p[0] for p in pts])
    lo, hi = both.min(0) - 2, both.max(0) + 2  # zoom on the tumour bounding box
    half = (hi - lo).max() / 2
    mid = (hi + lo) / 2
    def draw(f):
        for a, t, (idx, lab) in zip(axs, ("Reference annotation", "Your model"), pts):
            a.clear()
            a.scatter(idx[:, 0], idx[:, 1], idx[:, 2], c=[CMAP(int(l)) for l in lab], s=22, alpha=0.6, depthshade=True)
            a.set_xlim(mid[0] - half, mid[0] + half); a.set_ylim(mid[1] - half, mid[1] + half)
            a.set_zlim(mid[2] - half, mid[2] + half); a.set_axis_off()
            a.view_init(elev=20, azim=f * 10); a.set_title(t, fontsize=10)
        fig.suptitle(f"{cid} · 3D tumour labels (display-downsampled x{step})", fontsize=10)
    FuncAnimation(fig, draw, frames=36).save(FIG / f"{cid}_3d_rotation.gif", writer=PillowWriter(fps=12), dpi=80)
    plt.close(fig)


def main(cases):
    FIG.mkdir(parents=True, exist_ok=True)
    training_curves(); dice_per_patient()
    model, device, _ = load_model()
    preds = {}
    for cid in cases:
        p, r, _ = predict_case(model, device, cid)
        preds[cid] = (p, r)
    overlays(cases, preds)
    for cid in cases:
        scroll_gif(cid, *preds[cid]); rotate_gif(cid, *preds[cid])
        print("done", cid)


if __name__ == "__main__":
    main(sys.argv[1:] or ["BRATS_367", "BRATS_215", "BRATS_360"])
