# Attribution and scope

- **Dataset**: Medical Segmentation Decathlon (MSD), Task01 BrainTumour. License: CC BY-SA 4.0. Credit the MSD and its contributors; describe any changes you made (z-score normalization, 2D slicing, display downsampling).
- **Code/libraries**: PyTorch, MONAI, NiBabel, React, Three.js, nifti-reader-js. Cite versions used.
- **Optional pretrained MONAI bundle** (comparison only): if you use it, credit MONAI and its model/data sources separately. Never call those weights your own training. It was trained on BraTS 2018; this project uses MSD Task01 (BraTS 2017); subject-level overlap is unresolved.
- **Atlas** (if you add region names): a template atlas is not a patient-specific segmentation.

## Scope and safety
Student learning prototype using de-identified research data. Not a medical device, not clinically validated, must not be used to diagnose, treat or make health decisions.

## Report paragraph (fill from YOUR measurements; do not invent values)
I trained a randomly initialized 2D U-Net on [N] MSD Task01 BrainTumour patients. The patients were split [counts] using seed [seed]. On the held-out test patients, mean Dice was [value] for WT, [value] for TC and [value] for ET. The main limitations were [limitations]. These are research-dataset segmentation comparisons, not clinical performance.

## AI use log
| Date | Step | What I asked | What I changed / verified |
|------|------|--------------|---------------------------|
