# Brain Tumour MRI Segmentation — 2D U-Net Research Prototype

A reproducible, patient-level MRI segmentation pipeline built with MONAI/PyTorch, plus a React/TypeScript/Three.js viewer for axial, coronal and sagittal inspection.

> **Scope:** educational research prototype on the Medical Segmentation Decathlon (MSD) Task01 BrainTumour dataset. It is **not a medical device**, is not clinically validated, and must not be used for diagnosis, treatment planning or patient-care decisions.

## What this project demonstrates

- Multi-modal MRI loading (FLAIR, T1w, T1gd, T2w) and per-channel non-zero-voxel normalization.
- Patient-level train/validation/test partitioning **before** 2D slice extraction.
- A from-scratch 2D MONAI U-Net baseline (four input modalities; four output labels).
- WT/TC/ET Dice evaluation and per-patient result reporting.
- NIfTI prediction export and a local multi-planar/3D visualization interface.

This is a 2D slice-wise model. The 3D viewer visualizes its output; it does not make the neural network a 3D model.

## Repository structure

| Path | Purpose |
|---|---|
| `src/brain_tumour/` | Data loading, splitting, model, training, inference and metrics |
| `tests/` | Unit tests for split integrity and segmentation metrics |
| `notebooks/` | Dataset exploration |
| `reports/RESULTS.md` | Baseline results, cohort details and limitations |
| `reports/ATTRIBUTION.md` | Dataset and asset attribution |
| `frontend/` | React/TypeScript/Three.js viewer |
| `splits.csv` | Generated patient-level split (do not hand-edit) |

## Setup

Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
# Install a compatible PyTorch build using the official PyTorch selector first.
python -m pip install -r requirements.txt
$env:PYTHONPATH = "src"
python -m pytest tests
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
# Install a compatible PyTorch build using the official PyTorch selector first.
python -m pip install -r requirements.txt
export PYTHONPATH=src
python -m pytest tests
```

## Reproduce the pipeline

1. Download and inspect the dataset. The archive is large; ensure sufficient disk space.
2. Review the dataset's own `dataset.json`, record the exact release/version and source in your local provenance notes, and verify image/label pairing.
3. Generate the split. By default, **all paired labelled patients** are assigned deterministically using 70% train / 15% validation / 15% test:

   ```bash
   python -m brain_tumour.download
   python -m brain_tumour.split --seed 42
   ```

   For a small software smoke test only, an explicit subset can be requested:

   ```bash
   python -m brain_tumour.split --train 21 --val 4 --test 5 --seed 42
   ```

   The generated `splits.csv` is the source of truth. Preserve it with the experiment and record its SHA-256-derived identifier. Never create slices first and split them afterward.
4. Train using only the training patients; choose checkpoints using validation data:

   ```bash
   python -m brain_tumour.train --epochs 15 --batch-size 8
   ```

5. Evaluate the selected checkpoint on the held-out test patients only after model and preprocessing choices are frozen:

   ```bash
   python -m brain_tumour.evaluate
   ```

6. Export selected predictions and run the viewer (see below).

**Important:** the published baseline below used only 30 patients. Its test set has already been inspected. Do not tune that baseline against those same five patients and continue calling them an untouched test set. A new full-cohort experiment needs a newly generated split, a fresh run, and a newly held-out test cohort.

## Baseline results

The initial 30-patient starter experiment reported mean test Dice of WT 0.813, TC 0.777 and ET 0.754 (five test patients). These are historical baseline measurements, **not independently reproduced in this update** and not estimates of clinical performance. The cohort is too small to support a generalization claim. See [the detailed results and limitations](reports/RESULTS.md).

## Viewer

```bash
cd frontend
npm install
npm run dev
```

The viewer provides linked multi-planar slice navigation, modality selection, reference-versus-prediction selection and a 3D mask view. It currently visualizes the voxel grid and does not fully reorient data using the NIfTI affine. Verify orientation/alignment in a dedicated medical-image viewer before interpreting overlays.

## Current limitations and next research steps

- The initial experiment used 30/484 labelled patients, with only five test patients.
- The model is a 2D U-Net with no volumetric context; isolated 3D false-positive fragments were observed.
- The initial validation and test aggregation procedures differ; their reported Dice values are not directly comparable.
- No independent external cohort, multi-seed study, confidence intervals, calibration analysis or clinical workflow validation has been completed.
- No claim is made that the viewer or model is suitable for clinical use.

Next experiments should use patient-level splits across the full labelled cohort, report patient-wise metrics and uncertainty, compare a transparent 2D baseline with a volumetric/2.5D approach and a strong established reference such as nnU-Net, and document preprocessing, seeds, compute, failure cases and ablations. The test cohort must remain untouched until final evaluation.

## Data and attribution

The MSD Task01 BrainTumour dataset is distributed under CC BY-SA 4.0 according to its dataset documentation. Review `reports/ATTRIBUTION.md` and the dataset's own terms before redistributing data-derived assets. Do not commit the raw dataset, patient data, model checkpoints or secrets.
