"""Train a fresh 2D U-Net on the train patients; checkpoint on VALIDATION Dice only.

Usage: python -m brain_tumour.train --epochs 10 --batch-size 8
"""
import argparse
import json
import time

import numpy as np
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from .config import MODELS_DIR, RUNS_DIR, SEED
from .data import SliceDataset
from .metrics import region_dice
from .model import build_loss, build_model, get_device
from .split import cases_in, load_split, split_hash


@torch.no_grad()
def validate(model, loader, loss_fn, device):
    model.eval()
    losses, preds, refs = [], [], []
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits = model(x)
        losses.append(float(loss_fn(logits, y)))
        preds.append(logits.argmax(1).cpu().numpy())
        refs.append(y[:, 0].cpu().numpy())
    d = region_dice(np.concatenate(preds), np.concatenate(refs))
    return float(np.mean(losses)), d


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=10)
    ap.add_argument("--batch-size", type=int, default=8)
    ap.add_argument("--lr", type=float, default=1e-3)
    a = ap.parse_args()

    torch.manual_seed(SEED)
    split = load_split()
    device = get_device()
    train_ds = SliceDataset(cases_in(split, "train"), augment=True, seed=SEED)
    val_ds = SliceDataset(cases_in(split, "val"), seed=SEED)
    train_dl = DataLoader(train_ds, batch_size=a.batch_size, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=a.batch_size)

    model = build_model().to(device)  # random weights
    loss_fn = build_loss()
    opt = torch.optim.AdamW(model.parameters(), lr=a.lr)
    print("device:", device, "| params:", sum(p.numel() for p in model.parameters()))

    MODELS_DIR.mkdir(exist_ok=True)
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    history, best = [], -1.0
    for epoch in range(a.epochs):
        model.train()
        tl = []
        for x, y in tqdm(train_dl, desc=f"epoch {epoch}"):
            x, y = x.to(device), y.to(device)
            opt.zero_grad(set_to_none=True)
            loss = loss_fn(model(x), y)
            loss.backward()
            opt.step()
            tl.append(float(loss.detach()))
        vloss, vd = validate(model, val_dl, loss_fn, device)
        score = float(np.mean(list(vd.values())))
        history.append({"epoch": epoch, "train_loss": float(np.mean(tl)), "val_loss": vloss, **{f"val_dice_{k}": v for k, v in vd.items()}})
        print(history[-1])
        if score > best:  # choose by validation metric, never by test
            best = score
            torch.save({
                "model": model.state_dict(), "optimizer": opt.state_dict(), "epoch": epoch,
                "config": vars(a), "split_hash": split_hash(), "val_mean_dice": score,
            }, MODELS_DIR / "best.pt")
    (RUNS_DIR / f"history_{int(time.time())}.json").write_text(json.dumps(history, indent=2))


if __name__ == "__main__":
    main()
