"""Generate static Heart audio using the existing local AI Video Studio runtime.

Generation never approves unrelated content. After reviewing text and narration,
use --review-step ID (repeatable) and --review-templates explicitly.
--verify uses only the Python standard library; builds use the Node validator.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "scripts/learning-narration-config.json").read_text(encoding="utf-8"))


def sha(value):
    return hashlib.sha256(value).hexdigest()


def fingerprint(text):
    return sha(json.dumps([text, CONFIG["voiceId"], CONFIG["speed"], CONFIG["fingerprintVersion"]], ensure_ascii=False).encode())


def step_hash(step):
    return sha(json.dumps(step, sort_keys=True, ensure_ascii=False).encode())


def step_clips(step):
    clips = {step["id"]: step["narration"]}
    for index, option in enumerate(step.get("quiz", {}).get("options", []), 1):
        clips[f'{step["id"]}-feedback-{index}'] = option["feedback"]
    return clips


def valid(root, course, entry, text):
    if not isinstance(entry, dict) or entry.get("textHash") != fingerprint(text):
        return False
    prefix = "/" + course["assetDir"].removeprefix("src/") + "/"
    url = entry.get("src", "")
    if not url.startswith(prefix):
        return False
    path = (root / "src" / url.lstrip("/")).resolve()
    if path.parent != (root / course["assetDir"]).resolve() or not path.is_file():
        return False
    return (sha(path.read_bytes()) == entry.get("fileHash")
            and entry.get("seconds", 0) > 0 and entry.get("bytes") == path.stat().st_size)


def apply_reviews(root, course, manifest, rows, review_steps, review_templates):
    """Only an explicitly named and complete step gets a new review marker."""
    by_id = {step["id"]: step for step in rows}
    reviewed = dict(manifest.get("stepSourceHashes", {}))
    for name in review_steps:
        if name not in by_id:
            raise ValueError("Unknown review step: " + name)
        step = by_id[name]
        if not all(valid(root, course, manifest["clips"].get(key), text) for key, text in step_clips(step).items()):
            raise ValueError("Cannot review a step with missing or stale clips: " + name)
        reviewed[name] = step_hash(step)
    templates = dict(manifest.get("sourceFileHashes", {}))
    if review_templates:
        for name in course["templates"]:
            templates[name] = sha((root / name).read_text(encoding="utf-8").encode())
    manifest["stepSourceHashes"] = reviewed
    manifest["sourceFileHashes"] = templates


def verify(root, course, manifest, rows):
    errors = []
    for key in ("voice", "engine", "voiceId", "speed"):
        if manifest.get(key) != CONFIG[key]:
            errors.append("Unexpected audio setting: " + key)
    clips = {key: text for row in rows for key, text in step_clips(row).items()}
    for name, text in clips.items():
        if not valid(root, course, manifest.get("clips", {}).get(name), text):
            errors.append(name + ": missing or stale recording")
    for step in rows:
        if manifest.get("stepSourceHashes", {}).get(step["id"]) != step_hash(step):
            errors.append(step["id"] + ": visible content needs narration review")
    for name in course["templates"]:
        if manifest.get("sourceFileHashes", {}).get(name) != sha((root / name).read_text(encoding="utf-8").encode()):
            errors.append(name + ": template needs narration review")
    if errors:
        raise ValueError("\n".join(errors))
    return len(clips)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--course", choices=CONFIG["courses"], default="first-conversation")
    parser.add_argument("--studio", type=Path)
    parser.add_argument("--verify", action="store_true")
    parser.add_argument("--only", help="Generate only this clip")
    parser.add_argument("--review-step", action="append", default=[])
    parser.add_argument("--review-templates", action="store_true")
    args = parser.parse_args()
    course = CONFIG["courses"][args.course]
    rows = json.loads((ROOT / course["source"]).read_text(encoding="utf-8"))["steps"]
    clips = {key: text for row in rows for key, text in step_clips(row).items()}
    target_manifest = ROOT / course["manifest"]
    manifest = json.loads(target_manifest.read_text(encoding="utf-8")) if target_manifest.exists() else {}
    entries = manifest.setdefault("clips", {})
    if args.verify:
        print(json.dumps({"verified_clips": verify(ROOT, course, manifest, rows), "course": args.course}))
        return
    manifest.update({key: CONFIG[key] for key in ("voice", "engine", "voiceId", "speed")})
    if args.only and args.only not in clips:
        raise ValueError("Unknown clip: " + args.only)
    unknown = set(args.review_step) - {row["id"] for row in rows}
    if unknown:
        raise ValueError("Unknown review steps: " + ", ".join(sorted(unknown)))
    pending = {name: text for name, text in clips.items()
               if (not args.only or args.only == name) and not valid(ROOT, course, entries.get(name), text)}
    if pending:
        if not args.studio or not (args.studio / "studio/media.py").is_file():
            raise ValueError("Supply --studio with the existing AI Video Studio repository.")
        sys.path.insert(0, str(args.studio.resolve()))
        from studio.models import Scene, Settings
        from studio.media import speak, ffmpeg, run
        from studio.store import asset_path
        dest = ROOT / course["assetDir"]
        dest.mkdir(parents=True, exist_ok=True)
        settings = Settings(engine="kokoro", voice=CONFIG["voiceId"], speed=CONFIG["speed"])
        for name, text in pending.items():
            scene = Scene(title=name, narration=text, on_screen="Spinnit learning narration", image_prompt="", source_note="Reviewed learning text; audio only.")
            speak(scene, settings)
            target = dest / f"{name}-{fingerprint(text)[:12]}.mp3"
            run([ffmpeg(), "-y", "-i", str(asset_path(scene.audio)), "-vn", "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "64k", str(target)])
            run([ffmpeg(), "-v", "error", "-i", str(target), "-f", "null", "-"])
            entries[name] = {"src": "/" + target.relative_to(ROOT / "src").as_posix(), "textHash": fingerprint(text), "fileHash": sha(target.read_bytes()), "seconds": round(scene.audio_seconds, 3), "bytes": target.stat().st_size}
            # Preserve every existing review marker while saving new recordings.
            target_manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
            print(json.dumps({"clip": name, "seconds": scene.audio_seconds}), flush=True)
    apply_reviews(ROOT, course, manifest, rows, args.review_step, args.review_templates)
    target_manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"course": args.course, "generated": len(pending), "reviewed_steps": args.review_step, "reviewed_templates": args.review_templates}))


if __name__ == "__main__":
    main()
