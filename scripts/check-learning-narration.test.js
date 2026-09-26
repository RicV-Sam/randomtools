const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { checkCourse, CONFIG } = require('./check-learning-narration');
const ROOT = path.resolve(__dirname, '..');
const course = CONFIG.courses['first-conversation'];

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spinnit-narration-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved).toLowerCase(), fs.realpathSync(os.tmpdir()).toLowerCase());
    assert(path.basename(resolved).startsWith('spinnit-narration-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, course.manifest), 'utf8'));
  const files = [course.source, course.manifest, ...course.templates, ...Object.values(manifest.clips).map(clip => 'src' + clip.src)];
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), path.join(root, file));
  }
  return { root, manifest };
}
function changeJson(root, file, change) {
  const value = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  change(value);
  fs.writeFileSync(path.join(root, file), JSON.stringify(value));
}
test('all production recordings and review markers verify', () => {
  for (const item of Object.values(CONFIG.courses)) assert.deepEqual(checkCourse(ROOT, item).errors, []);
});
test('a changed transcript fails until its recording is regenerated', t => {
  const { root } = fixture(t);
  changeJson(root, course.source, data => { data.steps[0].narration += ' A changed instruction.'; });
  assert(checkCourse(root, course).errors.some(error => error.includes('missing or stale narration')));
});
test('changed lesson text is caught even when narration is unchanged', t => {
  const { root } = fixture(t);
  changeJson(root, course.source, data => { data.steps[0].paragraphs[0] += ' A changed instruction.'; });
  assert(checkCourse(root, course).errors.some(error => error.includes('content needs narration review')));
});
test('a changed HTML template requires explicit review', t => {
  const { root } = fixture(t);
  fs.appendFileSync(path.join(root, course.templates[0]), '\n<p>New lesson text.</p>');
  assert(checkCourse(root, course).errors.some(error => error.includes('template needs narration review')));
});
test('missing and corrupted recordings fail the build check', t => {
  const { root, manifest } = fixture(t);
  const clips = Object.values(manifest.clips);
  fs.unlinkSync(path.join(root, 'src' + clips[0].src));
  fs.appendFileSync(path.join(root, 'src' + clips[1].src), 'corrupt');
  const errors = checkCourse(root, course).errors;
  assert(errors.some(error => error.includes('missing or invalid audio path')));
  assert(errors.some(error => error.includes('recording integrity check failed')));
});
test('Windows and Unix template newlines have identical review hashes', t => {
  const { root } = fixture(t);
  for (const file of course.templates) {
    const text = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
    fs.writeFileSync(path.join(root, file), text.replace(/\n/g, '\r\n'));
  }
  assert.deepEqual(checkCourse(root, course).errors, []);
});
test('unexpected narration settings fail validation', t => {
  const { root } = fixture(t);
  changeJson(root, course.manifest, data => { data.voiceId = 'unexpected'; });
  assert(checkCourse(root, course).errors.some(error => error.includes('Unexpected audio setting')));
});
