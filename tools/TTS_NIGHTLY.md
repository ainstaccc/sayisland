# 每晚補預錄音檔（說說島）

排程「說說島每晚補預錄音檔」每天 05:12（台北）執行，接在「新增題目 02:50」「UI 優化 03:40」「修發音 04:21」之後，把當天新增或改過的句子補上曉臻預錄音檔。完整手冊看 `tools/tts/README.md`。

## 前提
- claude.ai 設定 > 功能 > 網域許可清單已加 `speech.platform.bing.com`（2026-11-07 已加）。沒加或被移除時，步驟 3 會連線失敗：**此時不要硬推、不要改程式，直接回報「連不到微軟語音」**。

## 步驟
1. repo 沒有就 add_repo（ainstaccc/sayisland，access=push）後 clone；有就 `git pull --rebase origin main`。
2. 環境：`pip install edge-tts --break-system-packages`（已有就略過）。Playwright 預裝，不要重裝。
3. `node tools/tts/build_manifest.js --missing`：看「缺 N 句」「多餘音檔」。缺 0 句且無多餘檔、`speak-log.json` 沒有改動需求就回報「今晚沒有新句子」並結束。
4. `python3 tools/tts/gen_audio.py --workers 6`：只補缺的，並重產「發音修正（FIX）讓唸法改變」的句子（speak-log.json 會自動比對）。失敗句數要是 0；有失敗就再跑一次，仍失敗就回報、不推。
5. 刪掉多餘音檔（句子改了才會出現）：`node tools/tts/build_manifest.js --check` 列出多餘檔，用 `git rm`／`rm` 刪掉再重跑 `node tools/tts/build_manifest.js` 重建 manifest。
6. `node tools/tts/build_manifest.js --check` 必須顯示「缺 0 句、多餘 0 個、manifest 一致」。
7. 驗證：`node tools/check.js` 出現 ALL OK；用 Playwright（`python3 -m http.server`）開 App，攔截 `window.Audio` 與 `speechSynthesis.speak`，進「選對字」關（lv1 會自動唸題目）確認有請求 `audio/sp/*.mp3`、無 pageerror。
8. 只能新增／修改：`audio/`、`tools/tts/items.json`、`tools/tts/speak-log.json`、`README.md`（更新紀錄一列）。**絕對不要動 index.html、bank.js、題庫。**
9. commit（音檔多時分批：每批 ≤ 800 個檔，先推音檔、最後推 manifest）→ `git pull --rebase origin main` → push main。
10. 用 SendUserMessage 回報（條列）：新產幾句（依關卡）、重產幾句（發音修正）、刪幾個多餘檔、總檔數與 `du -sh audio` 容量、push 是否成功、失敗或待處理事項。

## 容量警戒
- `du -sh audio` 超過 500 MB 時，回報給 Stacy，不要自己砍檔。
