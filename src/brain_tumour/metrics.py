import numpy as np

from .config import REGIONS


def dice(pred: np.ndarray, ref: np.ndarray) -> float:
    """Dice = 2|A∩B| / (|A|+|B|). Both empty -> 1.0 (documented choice);
    one empty and the other not -> 0.0."""
    a, b = pred.astype(bool), ref.astype(bool)
    s = a.sum() + b.sum()
    if s == 0:
        return 1.0
    return float(2 * np.logical_and(a, b).sum() / s)


def region_dice(pred_labels: np.ndarray, ref_labels: np.ndarray) -> dict[str, float]:
    """Dice for WT/TC/ET, each computed separately on its own (nested) mask."""
    return {name: dice(np.isin(pred_labels, ids), np.isin(ref_labels, ids))
            for name, ids in REGIONS.items()}
