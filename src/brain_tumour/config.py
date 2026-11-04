from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_ROOT = ROOT / "data" / "raw" / "Task01_BrainTumour"
SPLITS_CSV = ROOT / "splits.csv"
MODELS_DIR = ROOT / "models"
RUNS_DIR = ROOT / "reports" / "runs"

# Verify against dataset.json of YOUR copy; do not infer from filenames.
CHANNELS = ["FLAIR", "T1w", "T1gd", "T2w"]
LABELS = {0: "background", 1: "oedema", 2: "non-enhancing tumour", 3: "enhancing tumour"}

# Nested tumour regions (never add their volumes together).
REGIONS = {"WT": (1, 2, 3), "TC": (2, 3), "ET": (3,)}

SEED = 42
URL = "https://msd-for-monai.s3.us-west-2.amazonaws.com/Task01_BrainTumour.tar"
