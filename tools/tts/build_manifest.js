/* 說說島｜預錄語音清單產生器
 * 做兩件事（在 repo 根目錄執行：node tools/tts/build_manifest.js）：
 *  1. 讀 index.html 的 SPK（聲音試聽關）題目，算出 App 會「唸出來的每一句」＋套用發音修正後實際要合成的字，
 *     寫到 tools/tts/items.json（給 Stacy 電腦上的 gen_audio.py 產 mp3）。
 *  2. 掃 audio/sp/ 已經有的 mp3，寫 audio/manifest.js（App 啟動時載入；沒有檔的句子會自動用手機語音）。
 * 參數：--check 只檢查 manifest 與音檔是否一致（不寫檔），有缺檔／多餘檔以非 0 結束。
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const H = fs.readFileSync('index.html', 'utf8');

function grabArray(name) {
  const m = H.indexOf('const ' + name + '=[');
  if (m < 0) throw new Error('index.html 找不到 const ' + name);
  let i = H.indexOf('[', m), depth = 0, q = null; const start = i;
  for (; i < H.length; i++) {
    const c = H[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '[') depth++; else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  return new Function('return ' + H.slice(start, i))();
}

// 用 index.html 裡真正的 FIX／ADV／forSpeech 算「實際會唸的字」
const a = H.indexOf('const FIX='), m = /const forSpeech=[\s\S]*?return r\};/.exec(H);
if (a < 0 || !m) throw new Error('找不到 FIX／forSpeech 區段');
const forSpeech = new Function('DB', H.slice(a, m.index + m[0].length) + ';return forSpeech;')({ fix: [] });

// App 實際呼叫 say() 的字串（要跟 index.html 的 qSpoken／qFull 預設分支一致）
const spoken = q => q[1].replace('＿＿', '，什麼，');
const full = q => q[1].replace('＿＿', q[2]);

const SPK = grabArray('SPK');
const seen = new Set(), items = [];
SPK.forEach((r, i) => {
  [['題目', spoken(r)], ['答案句', full(r)]].forEach(([kind, key]) => {
    if (seen.has(key)) return; seen.add(key);
    const file = 'audio/sp/' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 10) + '.mp3';
    items.push({ q: i + 1, kind, key, speak: forSpeech(key), file });
  });
});

const have = items.filter(x => fs.existsSync(x.file));
const extra = fs.existsSync('audio/sp') ? fs.readdirSync('audio/sp').filter(f => f.endsWith('.mp3') && !items.some(x => x.file === 'audio/sp/' + f)) : [];
const man = 'window.PREAUD=' + JSON.stringify(Object.fromEntries(have.map(x => [x.key, x.file])), null, 0) + ';\n';

if (process.argv.includes('--check')) {
  const onDisk = fs.existsSync('audio/manifest.js') ? fs.readFileSync('audio/manifest.js', 'utf8') : '';
  const ok = onDisk === man;
  console.log('題目句 ' + items.length + ' 句；已有音檔 ' + have.length + ' 個；多餘音檔 ' + extra.length + ' 個；manifest ' + (ok ? '一致' : '需要重建'));
  if (extra.length) console.log('多餘：' + extra.join(' '));
  process.exitCode = ok && !extra.length ? 0 : 1;
} else {
  fs.mkdirSync('audio/sp', { recursive: true });
  fs.writeFileSync('tools/tts/items.json', JSON.stringify(items, null, 1) + '\n');
  fs.writeFileSync('audio/manifest.js', man);
  console.log('items.json：' + items.length + ' 句；audio/manifest.js：' + have.length + ' 句有音檔' + (extra.length ? '；多餘音檔 ' + extra.length + ' 個（' + extra.join(' ') + '）' : ''));
}
