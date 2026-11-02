# UI 優化紀錄（新的在上面）
- 2026-11-02 v1.20.0｜（Stacy 指定）商店 12 款＋每週上新品＋首頁新品彈窗：island.js 新增 B.teacup/pirateship/bounce/seesaw/sandbox/picnic/maple/cactus/lotus/dog/pig/turtle 與 CAT（含 w 上架日）；index.html 新增 isRel()、NEWS、nwPop()、.nwc/.nwg/.nwi CSS，商店列表／盲盒池／圖鑑依 isRel 過濾，homePops 接 nwPop，S.nwSeen 記已看批次。island.js 快取 ?v=10。驗證：check.js ALL OK；模擬日期 11/02、11/23 彈窗與商店分頁數量正確、再開不重複彈、無 pageerror、溢出 0。zizi.html 請同步。
- 2026-11-02 v1.19.3｜主題 5 好友團與排行榜、家長區：index.html `</style>` 前新增「v1.19.3」CSS 區塊：.lb 立體底影、第 1 名光暈、.lb .ch 虛線分隔、互動鈕按壓回饋、.grpbtn 按壓與圖示加大、#v-parent .panel h3 虛線底、.uc 底影、.tbl 斑馬紋；新增 ICO.lock 向量鎖頭，renderGrp 的「🔒參觀島」改 ic('lock')（取代 emoji UI 圖示）；≤360px 隱藏「幫他加油：」標籤避免超出卡片。驗證：check.js ALL OK；320/390 淺深色首頁僅 v-home、scrollWidth 溢出 0、無 pageerror；家長區／排行榜（模擬資料）截圖確認。zizi.html 請同步。
- 2026-11-01 v1.18.8｜主題 4 島的 3D 造型：只改 island.js，在 EN 包裝後新增 EN2 區塊（chain 動畫）：bunny 耳朵交替擺動＋粉鼻＋前腳掌；mushroom 菌褶圓盤＋白點＋輕搖；lamp 光暈環脈動＋繞燈飛蛾；bigtree 三片落葉＋深色葉團＋紅果；duck 眼睛高光＋腮紅＋小跳。index.html 只改版本號 v1.18.8 與 island.js 快取參數 ?v=8→?v=9。驗證：check.js ALL OK；320/390 首頁僅 v-home、島 canvas 正常、商店面板可開、scrollWidth 溢出 0、無 pageerror；5 個道具縮圖截圖確認。已知（非今日造成）：320 寬「選人／新增小朋友」頁溢出 2px（年級按鈕列），留待主題 6。zizi.html 無需改（island.js 共用）。
- 2026-10-31 v1.13.1｜主題 3 我的島 UI：只改 CSS（index.html `</style>` 前新增「v1.13.1」區塊）：.islBar .btn 立體按壓與圖示加大、.islBar .dotn 改絕對定位角標（320px 不再壓到「盲盒」字）＋脈動、.sheet 滑入動畫＋::before 把手、.tabb 選中底影、.icard 按壓回饋、.dx 已收集金底、.bx 立體＋.bx.lucky 光暈、.bx .be 浮動、.rv-card .rv-e 陰影；prefers-reduced-motion 關動畫。另修 320px 首頁溢出 13px（.tools 右側，新增 @media(max-width:340px) 縮 .brand 與 .tools .ibtn）。驗證：check.js ALL OK；320/390 淺深色首頁僅 v-home 可見、scrollWidth 溢出 0（首頁、島、商店、盲盒）、島 canvas 正常、無 pageerror；截圖確認。zizi.html 請同步加入同一段 CSS。
- 2026-10-30 v1.7.4｜主題 2 結果頁與徽章、週挑戰：只改 CSS（index.html 約 line 491 後新增「v1.7.4」區塊）：.res 光暈、.stars 加大＋閃動、.bonus 金色虛線漸層、.wk .wd i.t 脈動外框、.wk .chest 底座、.bdg span.on 金邊、prefers-reduced-motion 關動畫。另修深色模式結果頁（.res／#v-res .qcard 被寫死 #fff，淺字配白底看不到）：加深色覆寫。驗證：check.js ALL OK；320/390px 淺深色首頁僅 v-home 可見、scrollWidth 溢出 0、無 pageerror、結果頁／週挑戰截圖確認。zizi.html 請同步加入同一段 CSS。

- 2026-10-29 v1.7.1｜主題 1 遊戲畫面：選項答對／答錯角落加向量勾叉、回饋卡滑入、進度條條紋動畫、題目卡立體、焦點框、未選項淡化。驗證：check.js ALL OK；Playwright 320/390px 首頁僅 v-home 可見、題目頁與島 canvas 正常、無 pageerror、scrollWidth 溢出 0；答錯截圖勾叉圖示正常

- 2026-10-29 v1.6.0：全面改向量圖示、徽章對比、商店縮圖、道具圓角（手動）
- 2026-11-02 v1.18.9｜低年級注音三關一輪第一次全對送 1 個免費盲盒（finish()，S.zbx 記每日數量，無上限）
- 2026-11-02 v1.19.0｜期間限定活動（DB.ev / evAward / evPop / renderEv）；家長區新增活動設定面板
- 2026-11-02 v1.19.1｜活動設定頁日期欄位等寬（.evd）、條件選項縮短；活動彈窗改一項一列（.evc/.evr，關卡逐列）
- 2026-11-02 v1.19.2｜注音拼音拼音卡：zPool() 改用 ZC 混淆表＋ZFOCUS 補位成對，易混音兩兩相鄰
