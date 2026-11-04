# Attribution and scope

- **Dataset**: Medical Segmentation Decathlon (MSD), Task01 BrainTumour. License: CC BY-SA 4.0. Credit the MSD and its contributors; describe any changes you made (z-score normalization, 2D slicing, display downsampling).
- **Code/libraries**: PyTorch, MONAI, NiBabel, React, Three.js, nifti-reader-js. Cite versions used.
- **Optional pretrained MONAI bundle** (comparison only): if you use it, credit MONAI and its model/data sources separately. Never call those weights your own training. It was trained on BraTS 2018; this project uses MSD Task01 (BraTS 2017); subject-level overlap is unresolved.
- **Atlas** (if you add region names): a template atlas is not a patient-specific segmentation.

## Scope and safety
Student learning prototype using de-identified research data. Not a medical device, not clinically validated, must not be used to diagnose, treat or make health decisions.

## Report paragraph
See [RESULTS.md](RESULTS.md) for the full results, figures and limitations. Summary: I trained a randomly initialized 2D U-Net on 21 MSD Task01 BrainTumour patients (4 validation and 5 test patients, split by patient, seed 42; 30 of 484 labeled cases). On the 5 held-out test patients, mean Dice was 0.813 for WT, 0.777 for TC and 0.754 for ET. The main limitations were the very small test cohort, the 2D architecture, and the short CPU training. These are research-dataset segmentation comparisons, not clinical performance.

Figures and GIFs in `figures/` show slices and labels derived from the MSD dataset (CC BY-SA 4.0): z-score normalized FLAIR with annotation/prediction overlays.

## AI use log
| Date | Step | What I asked | What I changed / verified |
|------|------|--------------|---------------------------|
