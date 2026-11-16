# Results: 2D U-Net on MSD Task01 BrainTumour

> Educational research prototype. These are segmentation-overlap measurements against supplied research annotations, **not clinical performance**. Not a medical device.

## Historical starter experiment

The existing baseline used a small 30-patient subset: 21 training, 4 validation and 5 test patients (seed 42). It trained a randomly initialized MONAI 2D U-Net for 15 CPU epochs. The model processes one axial slice at a time; it is not a volumetric 3D network.

| Region | Mean test Dice | Standard deviation | Test patients |
|---|---:|---:|---:|
| Whole tumour (WT) | 0.813 | 0.057 | 5 |
| Tumour core (TC) | 0.777 | 0.065 | 5 |
| Enhancing tumour (ET) | 0.754 | 0.033 | 5 |

These values are retained as historical baseline results. They have not been independently reproduced as part of the repository documentation update. Five test patients are far too few to establish reliable generalization or clinical performance.

## Method details recorded for that run

- Dataset: Medical Segmentation Decathlon, Task01 BrainTumour; 30 of 484 labelled cases.
- Split: patient-level, 21/4/5, seed 42.
- Architecture: MONAI `UNet`, `spatial_dims=2`, four MRI input channels and four label outputs, random initialization.
- Loss/optimizer: Dice + cross-entropy loss and AdamW.
- Training: 15 epochs, batch size 8, CPU.
- Preprocessing: per-channel z-score normalization over non-zero voxels; no resampling; horizontal flip augmentation on training slices; empty training slices subsampled.
- Reported test Dice was computed per patient over the complete volume.

## Interpretation

The reported scores suggest that the prototype learned a non-trivial mapping on this small held-out subset. They do not show that the model generalizes to other institutions, scanners, patient populations or clinical workflows. The observed isolated false-positive fragments in 3D are consistent with the lack of volumetric context in a slice-wise 2D model.

## Important methodological caveats

1. **Small cohort:** only five test patients and four validation patients. Means and standard deviations are unstable.
2. **Validation/test mismatch:** the original training validation metric pooled sampled 2D slices, with empty slices subsampled, whereas test evaluation was computed per patient over full volumes. Those values are not directly comparable. This should be corrected before a new experiment is used to select models.
3. **Test-set reuse:** the five historical test cases have already been inspected in reports and visualizations. They are no longer a pristine test set for future tuning.
4. **No external validation:** no independent external dataset or site-level validation has been performed.
5. **2D architecture:** no through-plane context; a 3D viewer does not change the model's dimensionality.
6. **No clinical validation:** annotations and Dice scores do not establish clinical safety, diagnostic utility or patient benefit.
7. **Dataset provenance:** verify the exact dataset release and any overlap with other BraTS releases before making claims about independent cohorts.

## Recommended next experiment

- Generate a deterministic patient-level split across all paired labelled cases (the splitter now defaults to all available cases at 70/15/15).
- Make validation and test aggregation consistent: compute metrics per patient on full volumes, then report patient-level distributions.
- Keep the test set untouched during model selection. Because the historical five-patient test cohort has been inspected, use a newly defined test cohort for a fresh full-cohort study.
- Compare the 2D baseline against a justified 2.5D/3D approach and a strong established baseline (for example nnU-Net), using the same patient split and preprocessing protocol.
- Report WT/TC/ET Dice, HD95, per-patient results, failure cases, confidence intervals where appropriate, multiple seeds if feasible, compute/memory and inference time.
- Add ablations only when they test a stated hypothesis; do not imply that an architecture is better without controlled evidence.

## Reproducibility

```bash
python -m brain_tumour.split --seed 42
python -m brain_tumour.train --epochs 15 --batch-size 8
python -m brain_tumour.evaluate
```

The command sequence above defines a new experiment; its outputs must replace neither historical results nor their provenance silently. Record the generated split, software versions, hardware, training arguments and checkpoint identifier with every run.
