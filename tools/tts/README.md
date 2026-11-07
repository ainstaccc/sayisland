# 預錄語音（微軟台灣語音 曉臻）使用說明

全部固定題目都有預錄音檔（3,287 句、約 80 MB）；老師上傳課文、好好說話、排詞成句題目句、孩子自己寫的句子沒有預錄，維持手機語音。

## 一、運作方式
- 題目要唸的句子 → 對照 `audio/manifest.js` → 有音檔就播 `audio/sp/xxxx.mp3`，沒有或播放失敗就自動退回手機語音。
- 每題通常 2 句：①題目句（空格唸成「什麼」）②答對後的完整句；配對、看圖等關卡依各自唸法（見 `build_manifest.js` 的 ENUM）。
- 音檔檔名 = 句子文字的 sha1 前 10 碼，句子改了就會變成新檔名（舊檔變成「多餘音檔」）。

## 二、Stacy 在自己電腦上產音檔
1. 電腦要有 Python 3.9 以上（安裝時勾 Add Python to PATH）、要能上網。
2. 解壓縮整個資料夾，雙擊 `start.bat`（第一次會自動裝 edge-tts，約 1 分鐘）。
3. 跑完會多出 `audio` 資料夾（內有 `sp` 與 `manifest.js`）。
4. 把 `audio` 資料夾壓成 zip，丟回 Claude 對話，Claude 會放進 repo 並推上 GitHub。
- 已有的音檔會略過，失敗的下次再按一次會補。想全部重產：刪掉 `audio\sp` 再執行。
- 聲音：曉臻（zh-TW-HsiaoChenNeural），語速 -5%，音調 0。要改在 `gen_audio.py` 最上面的設定。

## 二之二、雲端自動產（2026-11-07 起）
- 前提：claude.ai 設定 > 功能 > 網域許可清單，額外允許 `speech.platform.bing.com`（已加）。
- 雲端環境的網路要走代理，`gen_audio.py` 會自動讀 `HTTPS_PROXY`，不用另外設定。
- 指令（在 repo 根目錄）：`pip install edge-tts --break-system-packages`、`node tools/tts/build_manifest.js`、`python3 tools/tts/gen_audio.py`、`node tools/tts/build_manifest.js --check`。
- 已實測：雲端用曉臻產出 mp3 成功。

## 三、檔案
| 檔案 | 用途 |
|---|---|
| `items.json` | 要產的全部句子（cat 關卡代號、key 原句、speak 套用發音修正後實際合成的字、file 檔名），由 `build_manifest.js` 產生 |
| `build_manifest.js` | 用 Playwright 開 App 盤點所有關卡的句子，重建 `items.json` 與 `audio/manifest.js`；`--check` 檢查是否齊全（缺檔、多餘檔、manifest 不一致），`--missing` 只列缺檔數 |
| `gen_audio.py` | 在 PC 上呼叫微軟語音產 mp3 |
| `start.bat` | 雙擊啟動器 |

## 四、新增／改題目後怎麼做（雲端或 PC 都一樣）
1. `node tools/tts/build_manifest.js`：盤點，列出各關「有/應有」。
2. `python3 tools/tts/gen_audio.py --workers 6`：只補缺的（約 3,000 句 15 分鐘；新增幾十句不到 1 分鐘）。
3. `node tools/tts/build_manifest.js --check`：要顯示「缺 0 句、多餘 0 個、manifest 一致」。
4. 句子改了舊檔會變成「多餘音檔」：刪掉 `audio/sp/` 裡多餘的檔再重建 manifest。
5. 改了 `index.html` 裡某關的唸法（`qSpoken`／`qFull` 等），要同步改 `build_manifest.js` 的 ENUM，並用 Playwright 驗證（見疑難排解）。
6. 單關重產：`gen_audio.py --force --only q`（q、v、a、e、m、z、zb、zo、r、y、cy、pw、sj、t、sp）。

## 五、發現唸錯怎麼辦
預錄音檔是整句生成，唸錯的字要在 `gen_audio.py` 產之前先處理：在 `index.html` 的 `FIX` 加同音字替換（跟手機語音同一套），重新產該句。已知待確認：「長高」「還給」「音樂」「髮」「背著」「倒進」「種玉米」「暑假」「睡著」「銀行」都是易錯破音字，聽完請回報。

## 五之二、驗證
- 開 App（`python3 -m http.server`），攔截 `window.Audio` 與 `speechSynthesis.speak`：進各關，lv1 會自動唸題目，`#qlisten` 是「唸題目」，`.fe` 是填空關的圖示，答對後 `#qsay`。要求：有播 `audio/sp/*.mp3`、手機語音 0 次。
- 2026-11-07 驗證結果：q、v、a、r、y、zb、zo、m、cy、pw、sj、e、sp 皆播預錄；t（看圖說話示範句）與 z 未實測。

## 六、限制
- 雲端要先允許 `speech.platform.bing.com` 才連得到；沒允許時只能在 Stacy 電腦產。
- 疑難：雲端出現 `Cannot connect to host speech.platform.bing.com ... Name or service not known` = 沒走代理（舊版 gen_audio.py）；`403 CONNECT tunnel failed` = 網域沒允許。
- 微軟語音為非官方介接，日後可能變更。
- 目前沒有家豪（TTSMaker 專屬）。
- 容量：約 80 MB；新增題目每晚幾十句，一年約增加幾十 MB。若超過 500 MB 要考慮降位元率或只留常用關卡。
- 預錄是整句合成，破音字唸錯要改 `FIX` 再重產該句。
