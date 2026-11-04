# Results: 2D U-Net on MSD Task01 BrainTumour (starter subset)

> Educational prototype on de-identified research data. These are segmentation overlap measurements against supplied annotations, **not clinical performance**. Not a medical device.

## Cohort and method

| Item | Value |
|---|---|
| Dataset | Medical Segmentation Decathlon, Task01 BrainTumour (484 labeled cases available), CC BY-SA 4.0 |
| Patients used | 30 of 484: **21 train / 4 validation / 5 test**, split by patient, seed 42 (`splits.csv`) |
| Test patients | BRATS_102, BRATS_215, BRATS_333, BRATS_360, BRATS_367 |
| Model | MONAI `UNet`, `spatial_dims=2`, 4 in / 4 out channels, channels (16, 32, 64, 128), strides (2, 2, 2), 2 residual units, **403,157 parameters**, random initialization, no pretrained weights |
| This is a **2D** model | It sees one axial slice at a time; it is not a true 3D network |
| Loss / optimizer | `DiceCELoss(softmax)`, AdamW, lr 1e-3, batch size 8 |
| Training | 15 epochs on CPU (about 22 minutes), `--epochs 15 --batch-size 8` |
| Preprocessing | Channels FLAIR, T1w, T1gd, T2w (order verified in `dataset.json`); per-channel z-score on non-zero voxels; no resampling; flip augmentation on train only; empty slices subsampled (20 %) |
| Checkpoint | Chosen on **validation** mean Dice: epoch 9 (WT 0.913, TC 0.778, ET 0.662) |
| Software | torch 2.14.1 (CPU), monai 1.6.1, nibabel 5.4.2 |

Note: `dataset.json` reports `release: 2.0 04/05/2018`, while the guide describes the data as BraTS 2017. Subject-level overlap with other BraTS releases is unresolved, so no claim of independence from external data is made.

## Held-out test (evaluated once, after choices were frozen)

Dice computed separately for each nested region (WT = labels 1/2/3, TC = 2/3, ET = 3), per patient on all slices. Both-empty counts as 1, one-empty as 0.

| Patient | WT | TC | ET |
|---|---|---|---|
| BRATS_102 | 0.832 | 0.698 | 0.713 |
| BRATS_215 | 0.806 | 0.795 | 0.771 |
| BRATS_333 | 0.841 | 0.743 | 0.806 |
| BRATS_360 | 0.707 | 0.756 | 0.723 |
| BRATS_367 | 0.876 | 0.891 | 0.758 |
| **Mean ± std (n=5)** | **0.813 ± 0.057** | **0.777 ± 0.065** | **0.754 ± 0.033** |

Raw numbers: `test_results.json`, `training_history.json`.

## Figures

| File | What it shows |
|---|---|
| `figures/training_curves.png` | Train/validation loss and validation Dice per epoch; checkpoint epoch marked |
| `figures/test_dice_per_patient.png` | Test Dice per patient and region |
| `figures/overlays_good_typical_difficult.png` | FLAIR slice with reference vs model overlay. BRATS_367 (best WT/TC), BRATS_215 (typical), BRATS_360 (lowest WT) |
| `figures/BRATS_*_slices.gif` | Axial scroll through tumour slices, reference vs model |
| `figures/BRATS_*_3d_rotation.gif` | Rotating 3D label cloud, reference vs model (display-downsampled ×3) |

## What the results show

- The full pipeline works end to end: patient-level split, from-scratch training, validation-based checkpointing, single held-out evaluation, export, viewer.
- Whole tumour (WT) is the easiest region on average; enhancing tumour (ET) is the hardest and the most variable on validation (0.60 to 0.68 across epochs after the first one).
- On the displayed slices the model's boundaries follow the reference closely for BRATS_367 and BRATS_360. On BRATS_215 the prediction finds the enhancing and non-enhancing core but misses a thin oedema streak and is more compact than the reference.
- In 3D the model produces small isolated false-positive fragments away from the main lesion (visible in the rotation GIFs), expected from a slice-by-slice 2D model with no volumetric context.
- BRATS_360 has the lowest WT (0.707) although its displayed slice looks close; the shortfall comes from slices not shown. The cause was not investigated.

## Limitations

- **Only 5 test patients** (and 4 validation patients): the means above are noisy and cannot be taken as representative of other patients. For example, ET is higher on test (0.754) than on validation (about 0.66), while WT is lower on test (0.813) than on validation (about 0.91). With groups this small, this is most likely sampling noise.
- **Validation and test are computed differently**: validation Dice pools the slices of all validation patients (with empty slices subsampled), whereas the test Dice is per patient on all slices. The two series are not directly comparable.
- 30 of 484 labeled cases used; a 2D model; 15 epochs on CPU; no hyperparameter search.
- The test set has now been used. Any further tuning would require a new held-out set.
- The viewer renders the voxel grid and does not reorient from the NIfTI affine; alignment was not independently checked in 3D Slicer.
- Ground-truth annotations can contain uncertainty. These scores are not clinical accuracy.

## Report paragraph

I trained a randomly initialized 2D U-Net on 21 MSD Task01 BrainTumour patients (4 validation and 5 test patients, split by patient, seed 42; 30 of 484 labeled cases). On the 5 held-out test patients, mean Dice was 0.813 for WT, 0.777 for TC and 0.754 for ET (standard deviations 0.057, 0.065 and 0.033). The main limitations were the very small test cohort, the 2D architecture (isolated false-positive fragments in 3D), the short CPU training, and that these are research-dataset segmentation comparisons, not clinical performance.

## Reproduce

```
python -m brain_tumour.split
python -m brain_tumour.train --epochs 15 --batch-size 8
python -m brain_tumour.evaluate          # once
python -m brain_tumour.export BRATS_367 BRATS_215 BRATS_360
python -m brain_tumour.report BRATS_367 BRATS_215 BRATS_360
```

Data: Medical Segmentation Decathlon, Task01 BrainTumour, CC BY-SA 4.0. Figures show slices derived from this dataset (z-score normalized, annotated overlays); see `ATTRIBUTION.md`.
