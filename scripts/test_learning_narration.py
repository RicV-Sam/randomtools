"""Review-marker regressions; no model, network, or generated media required."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("narration", Path(__file__).with_name("generate-learning-narration.py"))
narration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(narration)


class ReviewMarkers(unittest.TestCase):
    def setUp(self):
        self.course = narration.CONFIG["courses"]["first-conversation"]
        self.rows = json.loads((narration.ROOT / self.course["source"]).read_text(encoding="utf-8"))["steps"]
        self.manifest = json.loads((narration.ROOT / self.course["manifest"]).read_text(encoding="utf-8"))

    def test_reviewing_one_step_does_not_approve_an_unrelated_change(self):
        old_hash = self.manifest["stepSourceHashes"]["welcome"]
        self.rows[0]["paragraphs"][0] += " Changed instruction."
        narration.apply_reviews(narration.ROOT, self.course, self.manifest, self.rows, ["first-message"], False)
        self.assertEqual(self.manifest["stepSourceHashes"]["welcome"], old_hash)
        with self.assertRaisesRegex(ValueError, "welcome: visible content"):
            narration.verify(narration.ROOT, self.course, self.manifest, self.rows)

    def test_generating_without_review_flags_preserves_all_markers(self):
        old = copy.deepcopy(self.manifest)
        self.rows[0]["paragraphs"][0] += " Changed instruction."
        narration.apply_reviews(narration.ROOT, self.course, self.manifest, self.rows, [], False)
        self.assertEqual(self.manifest, old)

    def test_missing_recording_cannot_be_approved(self):
        del self.manifest["clips"]["welcome"]
        with self.assertRaisesRegex(ValueError, "missing or stale"):
            narration.apply_reviews(narration.ROOT, self.course, self.manifest, self.rows, ["welcome"], False)

    def test_a_changed_transcript_cannot_be_approved_before_generation(self):
        self.rows[0]["narration"] += " Changed speech."
        with self.assertRaisesRegex(ValueError, "missing or stale"):
            narration.apply_reviews(narration.ROOT, self.course, self.manifest, self.rows, ["welcome"], False)


if __name__ == "__main__":
    unittest.main()
