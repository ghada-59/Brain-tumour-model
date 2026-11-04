"""Export prediction + reference masks (NIfTI, original affine) and a JSON sidecar
to frontend/public/cases/<case>/ for the browser viewer.

Usage: python -m brain_tumour.export BRATS_001 [BRATS_002 ...]
Display assets are NOT downsampled here; if you downsample, document it.
"""
import json
import sys
from datetime import datetime, timezone

import monai
import nibabel as nib
import numpy as np
import torch

from .config import CHANNELS, DATA_ROOT, LABELS, ROOT, SEED
from .predict import load_model, predict_case
from .split import split_hash

OUT = ROOT / "frontend" / "public" / "cases"


def main(case_ids: list[str]) -> None:
    model, device, ckpt = load_model()
    for cid in case_ids:
        pred, ref, affine = predict_case(model, device, cid)
        d = OUT / cid
        d.mkdir(parents=True, exist_ok=True)
        nib.save(nib.Nifti1Image(pred, affine), d / "prediction.nii.gz")
        nib.save(nib.Nifti1Image(ref.astype(np.uint8), affine), d / "reference.nii.gz")
        nib.save(nib.load(DATA_ROOT / "imagesTr" / f"{cid}.nii.gz"), d / "mri.nii.gz")
        (d / "meta.json").write_text(json.dumps({
            "case_id": cid, "channels": CHANNELS, "class_mapping": {str(k): v for k, v in LABELS.items()},
            "checkpoint_epoch": ckpt["epoch"], "split_hash": split_hash(), "seed": SEED,
            "model": "monai UNet 2D, channels=(16,32,64,128), strides=(2,2,2), num_res_units=2, random init",
            "preprocessing": "per-channel z-score on non-zero voxels; axial 2D slices; no resampling",
            "software": {"torch": torch.__version__, "monai": monai.__version__, "nibabel": nib.__version__},
            "predicted_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "Educational prototype. Not a medical device; not clinically validated.",
        }, indent=2))
        print("exported", cid)
    existing = json.loads((OUT / "index.json").read_text()) if (OUT / "index.json").exists() else []
    (OUT / "index.json").write_text(json.dumps(sorted(set(existing) | set(case_ids))))


if __name__ == "__main__":
    main(sys.argv[1:])
