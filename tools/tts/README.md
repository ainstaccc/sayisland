# 預錄語音（微軟台灣語音 曉臻）使用說明

目前只有「聲音試聽」這一關（10 題選擇題）用預錄音檔，其他舊關卡完全不動，仍是手機語音。

## 一、運作方式
- 題目要唸的句子 → 對照 `audio/manifest.js` → 有音檔就播 `audio/sp/xxxx.mp3`，沒有或播放失敗就自動退回手機語音。
- 每題 2 句：①題目句（空格唸成「什麼」）②答對後的完整句。共 20 句。
- 音檔檔名 = 句子文字的 sha1 前 10 碼，句子改了就會變成新檔名（舊檔變成「多餘音檔」）。

## 二、Stacy 在自己電腦上產音檔
1. 電腦要有 Python 3.9 以上（安裝時勾 Add Python to PATH）、要能上網。
2. 解壓縮整個資料夾，雙擊 `start.bat`（第一次會自動裝 edge-tts，約 1 分鐘）。
3. 跑完會多出 `audio` 資料夾（內有 `sp` 與 `manifest.js`）。
4. 把 `audio` 資料夾壓成 zip，丟回 Claude 對話，Claude 會放進 repo 並推上 GitHub。
- 已有的音檔會略過，失敗的下次再按一次會補。想全部重產：刪掉 `audio\sp` 再執行。
- 聲音：曉臻（zh-TW-HsiaoChenNeural），語速 -5%，音調 0。要改在 `gen_audio.py` 最上面的設定。

## 三、檔案
| 檔案 | 用途 |
|---|---|
| `items.json` | 要產的 20 句（由 `build_manifest.js` 從 `index.html` 的 SPK 區段產生） |
| `build_manifest.js` | 重建 `items.json` 與 `audio/manifest.js`；`--check` 檢查音檔是否齊全、有無多餘 |
| `gen_audio.py` | 在 PC 上呼叫微軟語音產 mp3 |
| `start.bat` | 雙擊啟動器 |

## 四、改題目後怎麼做
1. 改 `index.html` 的 `SPK` 區段。
2. `node tools/tts/build_manifest.js` 更新 `items.json`。
3. 重新給 Stacy 產音檔（只會補新句子）。
4. 推上去前：`node tools/tts/build_manifest.js --check` 要顯示「manifest 一致」。

## 五、發現唸錯怎麼辦
預錄音檔是整句生成，唸錯的字要在 `gen_audio.py` 產之前先處理：在 `index.html` 的 `FIX` 加同音字替換（跟手機語音同一套），重新產該句。已知待確認：「長高」「還給」「音樂」「髮」「背著」「倒進」「種玉米」「暑假」「睡著」「銀行」都是易錯破音字，聽完請回報。

## 六、限制
- 雲端連不到微軟語音服務，所以一定要在 Stacy 電腦產。
- 微軟語音為非官方介接，日後可能變更。
- 目前沒有家豪（TTSMaker 專屬）。
