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
   - `node tools/ui_scan.js --widths=320,390 --schemes=light,dark --lv=1` 印出 `UI SCAN: ALL OK`（有錯誤就修；只有「字太小」警告也要盡量清到 0）。
   - **不可以注入 `[hidden]{display:none!important}`**：要直接測真正的 index.html，並確認首頁只有 `#v-home` 可見（`section[id^=v-]` 中 offsetHeight>0 的只有一個）。曾因漏掉這條規則讓所有關卡畫面疊在首頁。
   - Playwright（chromium 參數 `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --allow-file-access-from-files`，注入 `[hidden]{display:none!important}`）：開 `file://.../index.html`，輸入暱稱進首頁、進任一關卡出題、進「我的島」看到 canvas、開商店／盲盒面板；全程無 `pageerror`。
   - 320px 與 390px 寬各截圖首頁與島面板，檢查 `scrollWidth - innerWidth == 0`。
   - 看截圖確認改動真的比較好看；變差就還原該項。
7. 版本號：首頁底部 `說說島 vX.Y.Z` 的 Z 加 1（所有出現處同步）；README 最上方版本與「更新紀錄」表追加一行（日期、版本、簡述）。
8. 在 `tools/ui-log.md` 最上面追加：日期、主題、改了什麼、截圖檢查結果。
9. `git pull --rebase`（每晚還有題庫機器人會 commit）→ `git add -A && git commit && git push origin main`。commit 訊息：`ui: YYYY-MM-DD 主題簡述`，結尾加排程給的 Co-Authored-By 與 Claude-Session 行。
10. 回報：今天主題、改了哪幾處、驗證結果、push 是否成功。

## 補充（v1.7.2）
- 人類（Stacy 的手動版本）是從 `zizi.html` 打包出 `index.html`。排程直接改 `index.html` 沒問題，但請在 commit 訊息與 `tools/ui-log.md` 清楚寫出改了哪些 CSS／函式，方便手動版同步回去。
- 頭像是 `a:代號` 格式（`AVSVG`），不要改回 emoji；島是六角地塊（`island.js` 的 `hp()`、`RAD()`、`hd()`），不要改回方格。
- **文字對比（Stacy 多次強調，必做）**：任何新增或修改的畫面（尤其彈窗 `.prc`、卡片、面板）都要在深色模式實測文字對比。`.prc` 彈窗底色固定白、字固定 `#3B2A5A`，裡面的卡片不可使用 `var(--bg)`／`var(--ink)`／`var(--ink2)`（深色會變成淺字配白底）；要用固定色（底 `#FAF5FF`、字 `#3B2A5A`、次要字 `#5E4B80`）。驗證時用深色 colorScheme 截圖，並檢查文字與底色對比 ≥ 4.5。

## 待辦清單（Stacy 指定，主題 4「島的 3D 造型」輪到時優先做；做完請在此打勾並寫進 ui-log）
**A. 每顆星球專屬撿拾物（火箭 mystPop）**——現在 6 種撿拾物（sp_crystal／sp_meteor／sp_glowtree／sp_moon／sp_ufo／sp_alien）所有星球共用，已在 v1.25.9 統一升級成「多層造型＋發光脈動＋繞行粒子＋小動畫」風格；專屬物品必須維持同一風格與細緻度（參考 island.js 的 B.sp_ufo／B.sp_alien／B.sp_moon，用 EM() 做各自閃爍的發光材質）。
- 每晚只做 1～2 個，做完在下表打勾。每個要做：①island.js 的 B.sp_xxx 造型＋動畫；②CAT 目錄加一筆（c:'神祕'、p:0、r:3、np:1、e 填一個 emoji 當圖鑑內容圖）；③island.js ?v= 加 1；④縮圖截圖與島上實景截圖確認，無 pageerror。
- 全部 9 項完成後，再另開一晚改 index.html 的 mystPop 撿拾判定：該星球專屬物約 35%、其餘照現有機率；專屬物要在圖鑑可看到「還差幾個」。**在判定改好之前，專屬物只能做造型、不要加進撿拾池。**
- [ ] 月球：月兔（搗藥杵）　[ ] 水星：鐵核礦石（金屬光澤）　[ ] 金星：黃色硫磺雲（會飄）
- [ ] 火星：紅石＋迷你漫遊車（會慢慢開）　[ ] 木星：大紅斑風暴球（旋轉的雲帶）　[ ] 土星：迷你土星（環會轉）
- [ ] 天王星：躺著轉的藍綠小星球（直立環）　[ ] 海王星：藍色冰晶（會落鑽石雨粒子）　[ ] 小行星帶：穀神星小石（旁邊有碎石環繞）

**B. 其他想做的小項目**
- [ ] 撿到畫面接劇情：撿完顯示「火箭裝滿了，回家囉！」（只動 mystPop 的文案與 .ms 樣式）。
- [ ] 稀有物（r≥3）在背包、圖鑑與島上放置時加一圈光環，一眼看出稀有。
- [ ] 行星圖（plSvg）加強：土星環前後遮擋、木星大紅斑、地球標示「我們在這裡」。
