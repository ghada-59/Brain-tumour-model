import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from brain_tumour.metrics import dice, region_dice  # noqa: E402
from brain_tumour.split import make_split  # noqa: E402


def test_split_is_disjoint_and_sized():
    cases = [f"BRATS_{i:03d}" for i in range(100)]
    s = make_split(cases, 21, 4, 5, seed=1)
    groups = list(s.values())
    assert len(s) == 30
    assert (groups.count("train"), groups.count("val"), groups.count("test")) == (21, 4, 5)


def test_split_reproducible():
    cases = [f"BRATS_{i:03d}" for i in range(100)]
    assert make_split(cases, 21, 4, 5, seed=7) == make_split(cases, 21, 4, 5, seed=7)


def test_dice_basics():
    a = np.array([1, 1, 0, 0]); b = np.array([1, 0, 0, 0])
    assert abs(dice(a, b) - 2 / 3) < 1e-9
    assert dice(np.zeros(4), np.zeros(4)) == 1.0
    assert dice(np.ones(4), np.zeros(4)) == 0.0


def test_regions_are_nested():
    ref = np.array([0, 1, 2, 3])
    r = region_dice(ref, ref)
    assert r == {"WT": 1.0, "TC": 1.0, "ET": 1.0}
    # predicting only label 3 -> ET perfect, WT/TC not
    r = region_dice(np.array([0, 0, 0, 3]), ref)
    assert r["ET"] == 1.0 and r["WT"] < 1.0 and r["TC"] < 1.0
