import numpy as np
import torch

from .config import MODELS_DIR
from .data import load_case, normalize
from .model import build_model, get_device


def load_model(path=MODELS_DIR / "best.pt"):
    device = get_device()
    ckpt = torch.load(path, map_location=device)
    model = build_model().to(device)
    model.load_state_dict(ckpt["model"])
    model.eval()
    return model, device, ckpt


@torch.no_grad()
def predict_case(model, device, case_id: str, batch: int = 16):
    """Return (pred (H,W,D) int, ref (H,W,D) int, affine) for one patient."""
    x, y, affine = load_case(case_id)
    x = normalize(x)
    depth = x.shape[-1]
    pred = np.zeros(y.shape, dtype=np.uint8)
    for z0 in range(0, depth, batch):
        zs = range(z0, min(z0 + batch, depth))
        xb = torch.from_numpy(np.stack([x[..., z] for z in zs])).to(device)  # (B,4,H,W)
        pb = model(xb).argmax(1).cpu().numpy()  # (B,H,W) class IDs from logits
        for i, z in enumerate(zs):
            pred[..., z] = pb[i]
    return pred, y, affine
