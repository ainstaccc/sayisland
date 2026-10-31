# UI 優化紀錄（新的在上面）
- 2026-10-31 v1.13.1｜主題 3 我的島 UI：只改 CSS（index.html `</style>` 前新增「v1.13.1」區塊）：.islBar .btn 立體按壓與圖示加大、.islBar .dotn 改絕對定位角標（320px 不再壓到「盲盒」字）＋脈動、.sheet 滑入動畫＋::before 把手、.tabb 選中底影、.icard 按壓回饋、.dx 已收集金底、.bx 立體＋.bx.lucky 光暈、.bx .be 浮動、.rv-card .rv-e 陰影；prefers-reduced-motion 關動畫。另修 320px 首頁溢出 13px（.tools 右側，新增 @media(max-width:340px) 縮 .brand 與 .tools .ibtn）。驗證：check.js ALL OK；320/390 淺深色首頁僅 v-home 可見、scrollWidth 溢出 0（首頁、島、商店、盲盒）、島 canvas 正常、無 pageerror；截圖確認。zizi.html 請同步加入同一段 CSS。
- 2026-10-30 v1.7.4｜主題 2 結果頁與徽章、週挑戰：只改 CSS（index.html 約 line 491 後新增「v1.7.4」區塊）：.res 光暈、.stars 加大＋閃動、.bonus 金色虛線漸層、.wk .wd i.t 脈動外框、.wk .chest 底座、.bdg span.on 金邊、prefers-reduced-motion 關動畫。另修深色模式結果頁（.res／#v-res .qcard 被寫死 #fff，淺字配白底看不到）：加深色覆寫。驗證：check.js ALL OK；320/390px 淺深色首頁僅 v-home 可見、scrollWidth 溢出 0、無 pageerror、結果頁／週挑戰截圖確認。zizi.html 請同步加入同一段 CSS。

- 2026-10-29 v1.7.1｜主題 1 遊戲畫面：選項答對／答錯角落加向量勾叉、回饋卡滑入、進度條條紋動畫、題目卡立體、焦點框、未選項淡化。驗證：check.js ALL OK；Playwright 320/390px 首頁僅 v-home 可見、題目頁與島 canvas 正常、無 pageerror、scrollWidth 溢出 0；答錯截圖勾叉圖示正常

- 2026-10-29 v1.6.0：全面改向量圖示、徽章對比、商店縮圖、道具圓角（手動）
