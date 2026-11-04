"""Evaluate the best VALIDATION checkpoint on held-out test patients.
Run ONCE, after all model/preprocessing choices are frozen.

Usage: python -m brain_tumour.evaluate
Empty-region handling: if prediction and reference are both empty, Dice = 1.0;
if only one is empty, Dice = 0.0 (see metrics.dice).
"""
import json

import numpy as np

from .config import RUNS_DIR, SEED
from .metrics import region_dice
from .predict import load_model, predict_case
from .split import cases_in, load_split, split_hash


def main() -> None:
    split = load_split()
    test_ids = cases_in(split, "test")
    model, device, ckpt = load_model()
    rows = {}
    for cid in test_ids:
        pred, ref, _ = predict_case(model, device, cid)
        rows[cid] = region_dice(pred, ref)
        print(cid, rows[cid])
    summary = {
        r: {"mean": float(np.mean([v[r] for v in rows.values()])),
            "std": float(np.std([v[r] for v in rows.values()]))}
        for r in ("WT", "TC", "ET")
    }
    out = {"n_test_patients": len(test_ids), "seed": SEED, "split_hash": split_hash(),
           "checkpoint_epoch": ckpt["epoch"], "per_patient": rows, "summary": summary,
           "note": "Research-dataset segmentation comparison, not clinical performance."}
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    (RUNS_DIR / "test_results.json").write_text(json.dumps(out, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
