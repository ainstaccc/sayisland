/* 說說島｜預錄語音清單產生器（在 repo 根目錄執行：node tools/tts/build_manifest.js）
 * 1. 用 Playwright 開 index.html（臨時副本，只多露出內部函式，不改正式檔），
 *    用 App 自己的 qSpoken／qFull／forSpeech 算出「各關會唸的每一句」＋套用發音修正後實際要合成的字，
 *    寫到 tools/tts/items.json（gen_audio.py 讀它）。
 * 2. 掃 audio/sp/ 已有的 mp3，寫 audio/manifest.js（App 啟動時載入；沒檔的句子自動用手機語音）。
 * 參數：--check 只檢查 manifest／音檔是否一致與缺檔數（不寫檔）；有多餘檔或 manifest 不一致時以非 0 結束。
 *       --missing 只列出缺檔句數（給排程看）。
 * 不預錄（每次內容不同）：老師上傳課文、改寫／造句的作答。（排詞成句 sj 的 o 以「提示句＋每個詞塊」分段預錄；看圖說話 t 的提示分段預錄。）
 */
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { chromium } = require('playwright');

// 會被 say() 唸的字串規則（要和 index.html 一致；改 index.html 的唸法時，這裡要跟著改，E2E 會驗）
const ENUM = () => {
  const I = window.__INT, out = new Map();
  const add = (cat, t) => { if (t && typeof t === 'string' && !out.has(t)) out.set(t, cat); };
  for (const k of Object.keys(I.CATS)) {
    for (const q of (I.D[k] || [])) {
      if (['q', 'v', 'a'].includes(k)) { add(k, q.t.replace('＿＿', '，什麼，')); add(k, I.qFull(q)); }
      else if (k === 'e') { add(k, q.scene); add(k, I.sentenceOf(q) + '。'); }
      else if (k === 'm') add(k, `因為${q.c}，所以${q.f}。`);
      else if (k === 'z') add(k, q.w + '的' + q.ch);
      else if (k === 't') { add(k, q.model); add(k, '看看圖，說說看。'); Object.values(I.ELQ).forEach(e => add(k, e.replace(/（.*?）/g, ''))); }
      else if (k === 'sj') {
        if (q.k === 's') { add(k, q.t.replace('＿＿', '，什麼，')); add(k, q.t.replace('＿＿', q.right) + '。'); }
        else if (q.k === 'o') { add(k, q.sent); add(k, '把這些詞排成一句話。'); Object.values(q.ch).forEach(c => add(k, c)); }
        else if (q.k === 'x') add(k, '照樣造句：' + q.word.replace(/…/g, '，') + '。例如：' + q.demo + '。' + q.hint);
        else if (q.k === 'r') add(k, '把這個句子改寫：' + q.orig + '。' + q.ins);
        else if (q.word) add(k, '請用「' + q.word.replace(/…/g, '，') + '」造一個句子。' + q.hint);
      }
      else if (k === 'h') { /* 好好說話：情境、「誰可以怎麼說」、第幾種、每個選項各自預錄（對應 index.html 的 hParts） */
        add(k, q.t); add(k, (q.who === '我' ? '我' : q.who) + '可以怎麼說比較好？'); add(k, '第一種。'); add(k, '第二種。'); add(k, '第三種。');
        q.opts.forEach(o => add(k, o));
      }
      else if (k === 'u') { /* 動態，不預錄 */ }
      else { add(k, I.qSpoken(q)); add(k, I.qFull(q)); }
    }
  }
  /* 首頁小豬／提示文字（固定句，不含名字） */
  const PT = I.PETS, PA = I.PAT;
  const heroAll = (P, pst) => I.heroParts(P, pst, true).forEach(t => add('hero', t));
  heroAll(null, 0); heroAll({ done: true, sp: 'chick', sex: 'f' }, 4); heroAll({ done: true, sp: 'chick', sex: 'm' }, 4);
  for (const sp of Object.keys(PT)) { heroAll({ done: true, sp, sex: 'f' }, 4);
    for (let st = 0; st < 4; st++) { const lo = [0].concat(PA)[st], need = PA[st] - lo;
      for (let n = 0; n < need; n++) for (const sex of ['f', 'm']) heroAll({ sp, sex, ap: lo + n }, st); } }
  for (const egg of ['egg', 'embryo']) for (let n = 0; n < PA[0]; n++) for (const pl of [true, false]) I.heroParts({ sp: null, egg, ap: n }, 0, pl).forEach(t => add('hero', t));
  return [...out].map(([key, cat]) => ({ cat, key, speak: I.forSpeech(key) }));
};

async function enumerate() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sayenum-'));
  for (const f of ['index.html', 'bank.js', 'island.js', 'three.min.js', 'manifest.json']) if (fs.existsSync(f)) fs.copyFileSync(f, path.join(tmp, f));
  let h = fs.readFileSync(path.join(tmp, 'index.html'), 'utf8');
  const i = h.lastIndexOf('})();');
  if (i < 0) throw new Error('index.html 找不到結尾 })();');
  h = h.slice(0, i) + "window.__INT={ELQ,D,CATS,qSpoken,qFull,sentenceOf,forSpeech,PETS,PAT,heroParts};\n" + h.slice(i);
  fs.writeFileSync(path.join(tmp, 'index.html'), h);
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(tmp, 'index.html')); await p.waitForTimeout(800);
  const items = await p.evaluate(ENUM);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  if (errs.length) throw new Error('頁面錯誤：' + errs[0]);
  if (!items.length) throw new Error('沒有盤點到任何句子');
  return items;
}

(async () => {
  const seen = new Set(), items = [];
  for (const x of await enumerate()) {
    if (seen.has(x.key)) continue; seen.add(x.key);
    x.file = 'audio/sp/' + crypto.createHash('sha1').update(x.key).digest('hex').slice(0, 10) + '.mp3';
    items.push(x);
  }
  const have = items.filter(x => fs.existsSync(x.file));
  const names = new Set(items.map(x => path.basename(x.file)));
  const extra = fs.existsSync('audio/sp') ? fs.readdirSync('audio/sp').filter(f => f.endsWith('.mp3') && !names.has(f)) : [];
  const man = 'window.PREAUD=' + JSON.stringify(Object.fromEntries(have.map(x => [x.key, x.file]))) + ';\n';
  const byCat = {}; items.forEach(x => { const c = byCat[x.cat] = byCat[x.cat] || [0, 0]; c[0]++; if (fs.existsSync(x.file)) c[1]++; });
  const sum = Object.entries(byCat).map(([k, v]) => k + ' ' + v[1] + '/' + v[0]).join('，');

  if (process.argv.includes('--check') || process.argv.includes('--missing')) {
    const onDisk = fs.existsSync('audio/manifest.js') ? fs.readFileSync('audio/manifest.js', 'utf8') : '';
    const ok = onDisk === man;
    console.log('應有 ' + items.length + ' 句；已有音檔 ' + have.length + ' 個；缺 ' + (items.length - have.length) + ' 句；多餘音檔 ' + extra.length + ' 個；manifest ' + (ok ? '一致' : '需要重建'));
    console.log('各關（有/應有）：' + sum);
    if (extra.length) console.log('多餘：' + extra.slice(0, 20).join(' ') + (extra.length > 20 ? ' …' : ''));
    process.exitCode = process.argv.includes('--missing') ? 0 : (ok && !extra.length ? 0 : 1);
  } else {
    fs.mkdirSync('audio/sp', { recursive: true });
    fs.writeFileSync('tools/tts/items.json', JSON.stringify(items, null, 1) + '\n');
    fs.writeFileSync('audio/manifest.js', man);
    console.log('items.json：' + items.length + ' 句；audio/manifest.js：' + have.length + ' 句有音檔' + (extra.length ? '；多餘音檔 ' + extra.length + ' 個' : ''));
    console.log('各關（有/應有）：' + sum);
  }
})().catch(e => { console.error(e.message); process.exit(2); });
