"""Download and extract MSD Task01 BrainTumour (~7.6 GB, needs >= 15 GB free).

Usage: python -m brain_tumour.download
Raw data stays in data/raw/ (git-ignored). Originals are never modified.
"""
import shutil
import tarfile
import urllib.request
from datetime import date

from .config import DATA_ROOT, ROOT, URL


def main() -> None:
    raw = ROOT / "data" / "raw"
    raw.mkdir(parents=True, exist_ok=True)
    free_gb = shutil.disk_usage(raw).free / 1e9
    if free_gb < 15:
        raise SystemExit(f"Only {free_gb:.1f} GB free; need at least 15 GB.")
    archive = raw / "Task01_BrainTumour.tar"
    if not archive.exists():
        print(f"Downloading {URL}")
        urllib.request.urlretrieve(URL, archive)
    if not DATA_ROOT.exists():
        print("Extracting...")
        with tarfile.open(archive) as tar:
            tar.extractall(raw)
    (raw / "PROVENANCE.txt").write_text(
        f"source: {URL}\naccessed: {date.today()}\n"
        "dataset: Medical Segmentation Decathlon, Task01 BrainTumour\n"
        "license: CC BY-SA 4.0\nnotes: originals unchanged; add your own preprocessing notes.\n"
    )
    print("Done. Now read dataset.json and fill in your provenance notes.")


if __name__ == "__main__":
    main()
