export const CHANNEL_NAMES = ["FLAIR", "T1w", "T1gd (contrast-enhanced T1)", "T2w"];

export const LABELS: Record<number, { name: string; color: [number, number, number] }> = {
  1: { name: "Oedema", color: [255, 214, 10] },
  2: { name: "Non-enhancing tumour", color: [10, 132, 255] },
  3: { name: "Enhancing tumour", color: [255, 69, 58] },
};
