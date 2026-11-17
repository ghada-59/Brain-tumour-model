export const HISTORICAL_LABEL =
  "Historical reported baseline — not reproduced or rerun by this dashboard redesign.";

export const TEST_PATIENTS = ["BRATS_102", "BRATS_215", "BRATS_333", "BRATS_360", "BRATS_367"];

export const SUMMARY = [
  { region: "Whole Tumor (WT)", desc: "labels 1+2+3 — complete tumour extent", mean: 0.813, std: 0.057 },
  { region: "Tumor Core (TC)", desc: "labels 2+3 — tumour without oedema", mean: 0.777, std: 0.065 },
  { region: "Enhancing Tumor (ET)", desc: "label 3 — active enhancing tissue", mean: 0.754, std: 0.033 },
];

export const PER_PATIENT: Record<string, { WT: number; TC: number; ET: number }> = {
  BRATS_102: { WT: 0.832, TC: 0.698, ET: 0.713 },
  BRATS_215: { WT: 0.806, TC: 0.795, ET: 0.771 },
  BRATS_333: { WT: 0.841, TC: 0.743, ET: 0.806 },
  BRATS_360: { WT: 0.707, TC: 0.756, ET: 0.723 },
  BRATS_367: { WT: 0.876, TC: 0.891, ET: 0.758 },
};

export interface EpochRecord {
  epoch: number;
  train_loss: number;
  val_loss: number;
  val_dice_WT: number;
  val_dice_TC: number;
  val_dice_ET: number;
}
