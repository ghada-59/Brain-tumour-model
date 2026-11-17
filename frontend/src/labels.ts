export const CHANNEL_NAMES = ["FLAIR", "T1w", "T1gd (contrast-enhanced T1)", "T2w"];

// Display-only overlay colors aligned with the Editorial & Neuroscience palette.
// Segmentation label IDs and voxel values remain unchanged.
export const LABELS: Record<number, { name: string; color: [number, number, number] }> = {
  1: { name: "Oedema", color: [138, 181, 167] }, // Chinese Jade
  2: { name: "Non-enhancing tumour", color: [85, 70, 117] }, // Cyber Grape
  3: { name: "Enhancing tumour", color: [189, 89, 95] }, // Pastel Blood
};
