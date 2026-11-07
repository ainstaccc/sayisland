/* 說說島｜破音字掃描工具
 * 掃 index.html 內建題庫 + bank.js（每晚新增的題目），列出「還沒有發音修正」的破音字上下文。
 * 「已修正」＝該字落在 FIX 清單某個詞的範圍內（FIX 在 index.html，格式 ['原詞','改唸成']）。
 * 用法（在 repo 根目錄）：
 *   node tools/check_poly.js               人看的摘要
 *   node tools/check_poly.js --json        給排程用：每筆 {char,text,window,src}
 *   node tools/check_poly.js --bank-only   只看 bank.js（夜間新增）的題
 * 注意：家長區「發音修正」存在各人手機的瀏覽器裡，這支工具看不到，只看 index.html 的 FIX。
 */
const fs = require('fs');
const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const BANK_ONLY = args.includes('--bank-only');

const H = fs.readFileSync('index.html', 'utf8');
const B = JSON.parse(fs.readFileSync('bank.js', 'utf8').replace(/^window\.EXTRA=/, '').replace(/;\s*$/, ''));

// 從 index.html 取出 `const NAME=[ ... ]` 的陣列文字（會略過字串裡的括號）
function grabArray(name) {
  const m = H.indexOf('const ' + name + '=[');
  if (m < 0) return null;
  let i = H.indexOf('[', m), depth = 0, q = null;
  const start = i;
  for (; i < H.length; i++) {
    const c = H[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  return new Function('return ' + H.slice(start, i))();
}

const KEYS = [];
for (const p of ['Q', 'V', 'A', 'M', 'E', 'H', 'R', 'Y']) for (const n of [1, 2, 3]) KEYS.push(p + n);
KEYS.push('ZB', 'TS');

const base = {}, problems = [];
for (const k of KEYS) {
  try { base[k] = grabArray(k) || []; if (!base[k].length && !(B[k] || []).length) problems.push(k + '：找不到題庫'); }
  catch (e) { base[k] = []; problems.push(k + '：解析失敗 ' + e.message); }
}

// 每題轉成「會被唸出來的文字」
function texts(k, r) {
  const t = [], p = k[0];
  if ('QVAYR'.includes(p) && k !== 'ZB') t.push(String(r[1]).replace('＿＿', r[2]));
  else if (p === 'M') t.push('因為' + r[1] + '，所以' + r[2]);
  else if (p === 'E') { t.push(r.scene); (r.parts || []).forEach(x => t.push(x[3])); }
  else if (k === 'TS') { t.push(r.model); t.push(r.desc); }
  else if (p === 'H') t.push(r[1], r[3], r[4], r[5]);
  else if (k === 'ZB') t.push(r[1], r[2]);
  return t.filter(x => typeof x === 'string' && x);
}

const all = [];
for (const k of KEYS) {
  const b = base[k] || [], x = B[k] || [];
  (BANK_ONLY ? [] : b).forEach((r, i) => texts(k, r).forEach(s => all.push({ src: k + '#' + i, s })));
  x.forEach((r, i) => texts(k, r).forEach(s => all.push({ src: k + '#bank' + i, s })));
}

// 已有的發音修正
const fixSrc = H.slice(H.indexOf('const FIX='), H.indexOf('const forSpeech='));
const fixed = [...fixSrc.matchAll(/\['([^']+)','[^']*'\]/g)].map(m => m[1]);

// 已人工／查字典確認「TTS 唸得對、不用修」的詞（tools/pron-ok.txt，一行一詞，# 開頭是註解）
const okFile = 'tools/pron-ok.txt';
const okWords = fs.existsSync(okFile)
  ? fs.readFileSync(okFile, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#')) : [];
fixed.push(...okWords);

const POLY = '髮長朝覺行重樂還著得空假便倒乾傳差調曲數背率場種處角解降轉相將少和藏露禁載量切縫扇堡薄殼圈熟號乘模';
const covered = (t, i) => fixed.some(f => { let j = t.indexOf(f); while (j >= 0) { if (j <= i && i < j + f.length) return true; j = t.indexOf(f, j + 1); } return false; });

const hits = [], seen = new Set();
for (const { src, s } of all) for (let i = 0; i < s.length; i++) {
  const c = s[i]; if (!POLY.includes(c) || covered(s, i)) continue;
  const w = s.slice(Math.max(0, i - 2), i + 3), key = c + '|' + w;
  if (seen.has(key)) continue; seen.add(key);
  hits.push({ char: c, text: s, window: w, src });
}

if (problems.length) console.error('⚠ ' + problems.join('；'));
process.exitCode = problems.length ? 2 : 0;   // 不要用 process.exit()：輸出被管線接走時會被截斷

const LIM = (args.find(a => a.startsWith('--limit=')) || '').split('=')[1];
const shown = LIM ? hits.slice(0, +LIM) : hits;
if (JSON_OUT) {
  fs.writeSync(1, JSON.stringify({ total: hits.length, shown: shown.length, hits: shown }, null, 1) + '\n');
} else {
  const by = {};
  hits.forEach(h => (by[h.char] = by[h.char] || []).push(h.window));
  for (const c in by) console.log(c, '(' + by[c].length + ')', by[c].slice(0, 12).join(' | '));
  console.log('\n共 ' + hits.length + ' 筆「還沒有發音修正」的破音字上下文（掃了 ' + all.length + ' 句，FIX 詞 ' + (fixed.length - okWords.length) + ' 個、已確認免修 ' + okWords.length + ' 個）。');
  console.log('請人工或查字典確認哪些會唸錯：要修的加進 index.html 的 FIX，沒問題的加進 tools/pron-ok.txt。');
}
