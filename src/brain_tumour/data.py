"""Loading, normalization and 2D slice dataset (built from patient IDs only)."""
import random

import nibabel as nib
import numpy as np
import torch
from torch.utils.data import Dataset

from .config import DATA_ROOT


def load_case(case_id: str, root=DATA_ROOT):
    """Return image (4,H,W,D) float32, label (H,W,D) int64, and the image affine."""
    img = nib.load(root / "imagesTr" / f"{case_id}.nii.gz")
    lab = nib.load(root / "labelsTr" / f"{case_id}.nii.gz")
    x = np.asarray(img.dataobj, dtype=np.float32)  # (H,W,D,4)
    x = np.moveaxis(x, -1, 0)
    y = np.asarray(lab.dataobj).astype(np.int64)
    assert x.shape[1:] == y.shape, f"{case_id}: image/label shape mismatch"
    return x, y, img.affine


def normalize(x: np.ndarray) -> np.ndarray:
    """Per-channel z-score over non-zero (brain) voxels; background stays 0."""
    out = np.zeros_like(x)
    for c in range(x.shape[0]):
        m = x[c] != 0
        if m.any():
            mu, sd = x[c][m].mean(), x[c][m].std() + 1e-8
            out[c][m] = (x[c][m] - mu) / sd
    return out


class SliceDataset(Dataset):
    """Axial 2D slices from the given patients. Tumour-positive slices are kept;
    empty slices are subsampled so batches are not dominated by background."""

    def __init__(self, case_ids, empty_fraction=0.2, augment=False, seed=0, root=DATA_ROOT):
        self.augment = augment
        self.items = []  # (case_idx, z)
        self.vols = []
        rng = random.Random(seed)
        for ci, cid in enumerate(case_ids):
            x, y, _ = load_case(cid, root)
            self.vols.append((normalize(x), y))
            for z in range(y.shape[-1]):
                if y[..., z].any() or rng.random() < empty_fraction:
                    self.items.append((ci, z))

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        ci, z = self.items[i]
        x, y = self.vols[ci]
        xs, ys = x[..., z].copy(), y[..., z].copy()
        if self.augment and random.random() < 0.5:  # same flip for all channels + label
            xs, ys = xs[:, ::-1].copy(), ys[::-1].copy()
        return torch.from_numpy(xs), torch.from_numpy(ys).unsqueeze(0)  # label (1,H,W)
