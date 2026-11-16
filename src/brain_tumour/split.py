"""Reproducible patient-level train/validation/test splitting.

Split patients before deriving 2D slices. By default, use every paired labelled
case with a deterministic 70/15/15 split. Explicit counts are available for
small smoke-test runs; never use those starter runs as final evidence.
"""
import argparse
import csv
import hashlib
import random
from pathlib import Path

from .config import DATA_ROOT, SEED, SPLITS_CSV


def list_cases(root: Path = DATA_ROOT) -> list[str]:
    """Return case IDs present in BOTH imagesTr and labelsTr."""
    imgs = {p.name.removesuffix(".nii.gz") for p in (root / "imagesTr").glob("*.nii.gz")
            if not p.name.startswith("._")}
    labs = {p.name.removesuffix(".nii.gz") for p in (root / "labelsTr").glob("*.nii.gz")
            if not p.name.startswith("._")}
    if imgs != labs:
        print(f"WARNING unpaired: images-only={sorted(imgs - labs)} labels-only={sorted(labs - imgs)}")
    return sorted(imgs & labs)


def make_split(cases: list[str], n_train: int, n_val: int, n_test: int,
               seed: int = SEED) -> dict[str, str]:
    """Assign unique patient IDs to mutually exclusive groups."""
    counts = (n_train, n_val, n_test)
    if any(not isinstance(n, int) or n < 0 for n in counts):
        raise ValueError("Split sizes must be non-negative integers.")
    if len(set(cases)) != len(cases):
        raise ValueError("Patient IDs must be unique.")
    if sum(counts) == 0:
        raise ValueError("At least one patient must be assigned.")
    if sum(counts) > len(cases):
        raise ValueError("Requested more patients than available.")
    rng = random.Random(seed)
    chosen = rng.sample(sorted(cases), sum(counts))
    train_end, val_end = n_train, n_train + n_val
    return {
        case: ("train" if i < train_end else "val" if i < val_end else "test")
        for i, case in enumerate(chosen)
    }


def save_split(split: dict[str, str], path: Path = SPLITS_CSV) -> None:
    invalid = set(split.values()) - {"train", "val", "test"}
    if invalid:
        raise ValueError(f"Unknown split groups: {sorted(invalid)}")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["case_id", "group"])
        for case_id, group in sorted(split.items()):
            w.writerow([case_id, group])


def load_split(path: Path = SPLITS_CSV) -> dict[str, str]:
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    split = {r["case_id"]: r["group"] for r in rows}
    if len(split) != len(rows):
        raise ValueError(f"Duplicate patient IDs in {path}")
    invalid = set(split.values()) - {"train", "val", "test"}
    if invalid:
        raise ValueError(f"Unknown split groups: {sorted(invalid)}")
    return split


def split_hash(path: Path = SPLITS_CSV) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()[:12]


def cases_in(split: dict[str, str], group: str) -> list[str]:
    return sorted(c for c, g in split.items() if g == group)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a deterministic patient-level split.")
    parser.add_argument("--train", type=int, help="Explicit number of training patients.")
    parser.add_argument("--val", type=int, help="Explicit number of validation patients.")
    parser.add_argument("--test", type=int, help="Explicit number of test patients.")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()

    cases = list_cases()
    explicit = (args.train, args.val, args.test)
    if any(value is not None for value in explicit):
        if any(value is None for value in explicit):
            parser.error("Specify --train, --val and --test together.")
        n_train, n_val, n_test = explicit
    else:
        if len(cases) < 3:
            parser.error("At least 3 paired labelled patients are required.")
        n_train = int(len(cases) * 0.70)
        n_val = int(len(cases) * 0.15)
        n_test = len(cases) - n_train - n_val

    split = make_split(cases, n_train, n_val, n_test, seed=args.seed)
    save_split(split)
    print({"available": len(cases), "assigned": len(split),
           **{g: len(cases_in(split, g)) for g in ("train", "val", "test")},
           "seed": args.seed, "hash": split_hash()})


if __name__ == "__main__":
    main()
