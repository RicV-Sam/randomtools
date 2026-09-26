const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const CONFIG = require('./learning-narration-config.json');
const ROOT = path.resolve(__dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

// Match Python json.dumps(ensure_ascii=False), including spaces and sorted keys.
function serialize(value, sorted = false) {
  if (Array.isArray(value)) return '[' + value.map(item => serialize(item, sorted)).join(', ') + ']';
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (sorted) keys.sort();
    return '{' + keys.map(key => JSON.stringify(key) + ': ' + serialize(value[key], sorted)).join(', ') + '}';
  }
  return JSON.stringify(value);
}
const fingerprint = text => sha(serialize([text, CONFIG.voiceId, CONFIG.speed, CONFIG.fingerprintVersion]));

function checkCourse(root, course) {
  const errors = [];
  const rows = JSON.parse(fs.readFileSync(path.join(root, course.source), 'utf8')).steps;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, course.manifest), 'utf8'));
  for (const key of ['voice', 'engine', 'voiceId', 'speed']) {
    if (manifest[key] !== CONFIG[key]) errors.push('Unexpected audio setting: ' + key);
  }
  let count = 0;
  for (const row of rows) {
    const clips = [[row.id, row.narration], ...(row.quiz?.options || []).map((option, i) => [row.id + '-feedback-' + (i + 1), option.feedback])];
    if (manifest.stepSourceHashes?.[row.id] !== sha(serialize(row, true))) errors.push(row.id + ': content needs narration review');
    for (const [id, text] of clips) {
      count++;
      const entry = manifest.clips?.[id];
      const prefix = '/' + course.assetDir.replace(/^src\//, '') + '/';
      if (typeof text !== 'string' || !text.trim() || !entry || entry.textHash !== fingerprint(text)) {
        errors.push(id + ': missing or stale narration');
        continue;
      }
      const file = path.resolve(root, 'src', '.' + entry.src);
      if (typeof entry.src !== 'string' || !entry.src.startsWith(prefix) || path.dirname(file) !== path.resolve(root, course.assetDir) || !fs.existsSync(file)) {
        errors.push(id + ': missing or invalid audio path');
        continue;
      }
      const bytes = fs.readFileSync(file);
      if (sha(bytes) !== entry.fileHash || bytes.length !== entry.bytes || !Number.isFinite(entry.seconds) || entry.seconds <= 0) errors.push(id + ': recording integrity check failed');
    }
  }
  for (const file of course.templates) {
    const text = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
    if (manifest.sourceFileHashes?.[file] !== sha(text)) errors.push(file + ': template needs narration review');
  }
  return { count, errors };
}

if (require.main === module) {
  let count = 0;
  try {
    const errors = Object.entries(CONFIG.courses).flatMap(([name, course]) => {
      const result = checkCourse(ROOT, course);
      count += result.count;
      return result.errors.map(error => name + ': ' + error);
    });
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Learning narration verified (' + count + ' clips, including content and template review).');
  } catch (error) {
    console.error('Learning narration check failed:\n' + error.message);
    process.exitCode = 1;
  }
}
module.exports = { checkCourse, serialize, fingerprint, sha, CONFIG };
