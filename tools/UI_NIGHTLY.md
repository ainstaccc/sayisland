# 說說島｜每日 UI／造型優化作業說明（給自動排程的 Claude 看）

目標：每天做「一小批」視覺優化（約 3～6 處），保證不壞功能，驗證通過才推上 main。

## 每日主題輪替（依「今天日期的第幾天 ÷ 7 的餘數」）
0 首頁與地圖：間距、字級、按鈕質感、圖示一致性
1 遊戲畫面（選擇題／擴句／配對／注音）：卡片、回饋動畫、答對答錯的視覺
2 結果頁與徽章、週挑戰：慶祝動畫、圖示、對比
3 我的島 UI：商店／背包／圖鑑／盲盒面板、按鈕、抽卡演出
4 島的 3D 造型（island.js）：挑 2～3 個道具加細節（例如屋頂瓦片、窗框、花瓣、樹葉層次、動物表情、人物配件）與小動畫
5 好友團與排行榜、家長區：版面、圖示、對比
6 深色模式與小螢幕（320px）全面檢查：對比不足、文字斷行、溢出

## 步驟
1. `git clone https://github.com/ainstaccc/sayisland`（已存在就 `git pull --rebase`）。
2. 先讀 README 的「已知限制」與 `tools/ui-log.md`（避免重複做同樣的事）。
3. 依今天主題挑 3～6 處小改動，只改 CSS、SVG 圖示、版面標記、`island.js` 的造型。
4. 規則：
   - 文字不可在字中間斷行（用 white-space:nowrap 或調整寬度）；字體不能太小（內文 ≥16px，按鈕 ≥18px）。
   - 不用 emoji 當 UI 圖示（題目配圖 emoji 除外，那是內容）；用內嵌 SVG。
   - 深色模式、320px 寬都必須可讀、不橫向溢出。
   - 不要大改版：一天只做小步優化，風格維持現有可愛、圓潤、高對比。
5. 絕對不要動：題庫（`index.html` 內題目陣列順序、`bank.js`）、存檔格式（`DB`／`S` 欄位名稱）、Firebase 設定、既有元素 id 與 data- 屬性、遊戲判定邏輯。
6. 驗證（任何一項失敗就 `git checkout .` 還原，不要 push）：
   - `node tools/check.js` 印出 `ALL OK`。
   - **不可以注入 `[hidden]{display:none!important}`**：要直接測真正的 index.html，並確認首頁只有 `#v-home` 可見（`section[id^=v-]` 中 offsetHeight>0 的只有一個）。曾因漏掉這條規則讓所有關卡畫面疊在首頁。
   - Playwright（chromium 參數 `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --allow-file-access-from-files`，注入 `[hidden]{display:none!important}`）：開 `file://.../index.html`，輸入暱稱進首頁、進任一關卡出題、進「我的島」看到 canvas、開商店／盲盒面板；全程無 `pageerror`。
   - 320px 與 390px 寬各截圖首頁與島面板，檢查 `scrollWidth - innerWidth == 0`。
   - 看截圖確認改動真的比較好看；變差就還原該項。
7. 版本號：首頁底部 `說說島 vX.Y.Z` 的 Z 加 1（所有出現處同步）；README 最上方版本與「更新紀錄」表追加一行（日期、版本、簡述）。
8. 在 `tools/ui-log.md` 最上面追加：日期、主題、改了什麼、截圖檢查結果。
9. `git pull --rebase`（每晚還有題庫機器人會 commit）→ `git add -A && git commit && git push origin main`。commit 訊息：`ui: YYYY-MM-DD 主題簡述`，結尾加排程給的 Co-Authored-By 與 Claude-Session 行。
10. 回報：今天主題、改了哪幾處、驗證結果、push 是否成功。
