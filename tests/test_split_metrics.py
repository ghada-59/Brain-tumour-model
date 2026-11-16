import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from brain_tumour.metrics import dice, region_dice  # noqa: E402
from brain_tumour.split import load_split, make_split, save_split  # noqa: E402


def test_split_is_disjoint_and_sized():
    cases = [f"BRATS_{i:03d}" for i in range(100)]
    s = make_split(cases, 21, 4, 5, seed=1)
    groups = list(s.values())
    assert len(s) == 30
    assert (groups.count("train"), groups.count("val"), groups.count("test")) == (21, 4, 5)


def test_split_reproducible_and_uses_all_requested_cases():
    cases = [f"BRATS_{i:03d}" for i in range(100)]
    first = make_split(cases, 70, 15, 15, seed=7)
    assert first == make_split(cases, 70, 15, 15, seed=7)
    assert set(first) == set(cases)


@pytest.mark.parametrize("counts", [(-1, 2, 2), (1, -1, 2), (1, 2, -1), (0, 0, 0)])
def test_split_rejects_invalid_counts(counts):
    with pytest.raises(ValueError):
        make_split(["a", "b", "c"], *counts)


def test_split_rejects_duplicate_patient_ids():
    with pytest.raises(ValueError, match="unique"):
        make_split(["a", "a", "b"], 1, 1, 1)


def test_split_rejects_too_many_patients():
    with pytest.raises(ValueError, match="more patients"):
        make_split(["a", "b"], 1, 1, 1)


def test_split_round_trip_and_duplicate_validation(tmp_path):
    path = tmp_path / "nested" / "splits.csv"
    original = {"case-a": "train", "case-b": "val", "case-c": "test"}
    save_split(original, path)
    assert load_split(path) == original
    path.write_text("case_id,group\ncase-a,train\ncase-a,val\n", encoding="utf-8")
    with pytest.raises(ValueError, match="Duplicate"):
        load_split(path)


def test_dice_basics():
    a = np.array([1, 1, 0, 0]); b = np.array([1, 0, 0, 0])
    assert abs(dice(a, b) - 2 / 3) < 1e-9
    assert dice(np.zeros(4), np.zeros(4)) == 1.0
    assert dice(np.ones(4), np.zeros(4)) == 0.0


def test_regions_are_nested():
    ref = np.array([0, 1, 2, 3])
    r = region_dice(ref, ref)
    assert r == {"WT": 1.0, "TC": 1.0, "ET": 1.0}
    r = region_dice(np.array([0, 0, 0, 3]), ref)
    assert r["ET"] == 1.0 and r["WT"] < 1.0 and r["TC"] < 1.0
