"""Patient-level train/validation/test split (done BEFORE making 2D slices)."""
import csv
import hashlib
import random
from pathlib import Path

from .config import DATA_ROOT, SEED, SPLITS_CSV


def list_cases(root: Path = DATA_ROOT) -> list[str]:
    """Case IDs present in BOTH imagesTr and labelsTr; reports mismatches."""
    imgs = {p.name.removesuffix(".nii.gz") for p in (root / "imagesTr").glob("*.nii.gz")
            if not p.name.startswith("._")}
    labs = {p.name.removesuffix(".nii.gz") for p in (root / "labelsTr").glob("*.nii.gz")
            if not p.name.startswith("._")}
    if imgs != labs:
        print(f"WARNING unpaired: images-only={sorted(imgs - labs)} labels-only={sorted(labs - imgs)}")
    return sorted(imgs & labs)


def make_split(cases: list[str], n_train: int, n_val: int, n_test: int, seed: int = SEED) -> dict[str, str]:
    if n_train + n_val + n_test > len(cases):
        raise ValueError("Requested more patients than available.")
    rng = random.Random(seed)
    chosen = rng.sample(sorted(cases), n_train + n_val + n_test)
    out = {}
    for i, c in enumerate(chosen):
        out[c] = "train" if i < n_train else "val" if i < n_train + n_val else "test"
    return out


def save_split(split: dict[str, str], path: Path = SPLITS_CSV) -> None:
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["case_id", "group"])
        for c, g in sorted(split.items()):
            w.writerow([c, g])


def load_split(path: Path = SPLITS_CSV) -> dict[str, str]:
    with open(path, newline="") as f:
        return {r["case_id"]: r["group"] for r in csv.DictReader(f)}


def split_hash(path: Path = SPLITS_CSV) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()[:12]


def cases_in(split: dict[str, str], group: str) -> list[str]:
    return sorted(c for c, g in split.items() if g == group)


if __name__ == "__main__":
    # Starter subset of 30: 21 train / 4 val / 5 test.
    cases = list_cases()
    s = make_split(cases, 21, 4, 5)
    save_split(s)
    print({g: len(cases_in(s, g)) for g in ("train", "val", "test")}, "seed", SEED)
