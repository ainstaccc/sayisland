# 說說島｜每晚修發音作業說明（給自動排程的 Claude 看）

目標：每晚掃題庫裡的破音字，查字典確認，**只修確定會唸錯的**，驗證通過才推上 main。無人在線，不要提問，不確定就列進「待人工確認」，不要自己猜。

## 背景（先搞懂再動手）
- App 目前的朗讀是**手機內建的「中文（台灣）」語音**，不是預錄音檔。所以「修發音」＝在 `index.html` 的 `FIX` 清單加「同音字替換」（只改唸法，不改畫面）。
- 預錄音檔（微軟台灣語音）是 Stacy 在自己電腦上產的，雲端連不到微軟，**不在這個排程範圍**。

## 能動／不能動
- 只能改：① `index.html` 的 `FIX`（只追加）② `tools/pron-ok.txt`（只追加）③ `README.md` 版本與更新紀錄 ④ `tools/pron-log.md`。
- **絕對不要動**：題庫（`index.html` 內題目陣列、`bank.js`）、存檔格式（`DB`／`S` 欄位）、Firebase 設定、既有元素 id、判定邏輯、舊的 `FIX` 項目。

## 步驟
1. `git clone https://github.com/ainstaccc/sayisland`（已存在就 `git pull --rebase origin main`）。先讀 `README.md` 的「2.4 破音字與發音修正」與 `tools/pron-log.md`（看前幾晚做到哪）。
2. 取今晚要審的題：
   - 先跑 `node tools/check_poly.js --bank-only --json --limit=60`（夜間新增的題優先）。
   - 不足 60 筆，再跑 `node tools/check_poly.js --json --limit=60`，補到 60 筆為止（去掉重複）。
   - 輸出的 `total` 是還沒審完的總數，回報時要寫。
3. 逐筆判斷「這個詞在這句話裡正確唸法是什麼」：
   - 詞取 2～3 字（例如「長著」「還我」「種菜」），看 `text` 整句的意思決定。
   - 查證：教育部《重編國語辭典修訂本》（https://dict.revised.moe.edu.tw/）。Stacy 習慣用「波波注音」確認，連得到就一併看；連不到就只用教育部辭典。兩邊都查不到或意見不一致 → 列「待人工確認」。
4. 決定要不要修（保守原則）：
   - 該詞是**常見、字典第一個讀音**（例如「覺得」「還是」「音樂」「乾淨」「操場」）→ 手機語音通常唸得對 → 記進 `tools/pron-ok.txt`，不修。
   - 該詞是**非預設讀音**（例如「長著」ㄓㄤˇ、「種菜」ㄓㄨㄥˋ、「重畫」ㄔㄨㄥˊ、「還我」ㄏㄨㄢˊ、「背書包」ㄅㄟ）→ 要修。
   - 同一個詞在不同題讀音不同（例如「長」）→ 只能用「含上下文的整個詞」來修；分不開就列「待人工確認」。
5. 修法（沿用現有 `FIX` 做法）：
   - 找一個**同音字**，讓整個詞唸出正確讀音；替換字本身**必須只有一個讀音**（查字典確認它不是破音字）。
   - 原詞要夠具體，避免誤傷別的詞（不要只寫單字）。先在 `index.html` 搜尋該詞，確認替換後不會影響畫面（`FIX` 只用在朗讀，不改畫面）。
   - 格式：在現有最後一條 `FIX.push([...])` 的**下一行**新增 `FIX.push(['原詞','改唸詞'],…);`，不要改舊項目。
6. 判斷完「沒問題」的詞，去重後追加到 `tools/pron-ok.txt`（一行一詞）。
7. 驗證（任何一項失敗就 `git checkout .` 還原，不要 push）：
   - `node tools/check.js` 印出 `ALL OK`。
   - `node tools/check_poly.js` 跑得起來（exit code 0）。
   - Playwright（chromium 參數 `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --allow-file-access-from-files`）：開 `file://.../index.html`，輸入暱稱進首頁、進任一關卡出題，全程無 `pageerror`；`section[id^=v-]` 中 offsetHeight>0 的只有首頁 `#v-home`（**不可注入 `[hidden]{display:none!important}`**，要測真正的 index.html）。
   - 每個新增的修正都跑 `node tools/check_poly.js --speak="含原詞的一句話"`，確認輸出裡原詞已換成「改唸詞」（頁面全域抓不到 `forSpeech`，不要用 `page.evaluate` 測）。
8. 版本號：首頁底部 `說說島 vX.Y.Z` 的 Z 加 1（所有出現處同步）；`README.md` 最上方版本與「更新紀錄」表追加一行（日期、版本、「發音修正 +N」）。
9. 在 `tools/pron-log.md` 最上面追加：日期、審了幾筆、新增哪些修正（原詞→改唸詞＋正確讀音）、免修幾個、待人工確認清單與原因、`total` 剩幾筆。
10. `git pull --rebase origin main`（每晚還有題庫機器人和 UI 機器人會 commit）→ `git add -A && git commit && git push origin main`。commit 訊息：`pron: YYYY-MM-DD 發音修正 +N`，結尾加排程給的 Co-Authored-By 與 Claude-Session 行。
11. 回報（用 `SendUserMessage`，繁體中文、台灣口語、條列）：
    - 今晚審了幾筆、剩幾筆沒審（`total`）
    - 新增的修正：原詞 → 改唸詞（正確讀音）
    - 確認免修幾個
    - **待人工確認**：詞、整句、為什麼不確定
    - push 是否成功

## 若今晚沒有任何要修的
照樣更新 `pron-ok.txt` 與 `pron-log.md` 並 push（版本號可不加），回報寫「今晚 0 筆需要修」。

## 已知限制
- 家長區「發音修正」存在各人手機的瀏覽器裡，這個排程看不到；它只管 `index.html` 的 `FIX`。
- 同音字替換是土法，無法保證每個詞都對；正式版建議預錄音檔（見 README 第 6 節）。
