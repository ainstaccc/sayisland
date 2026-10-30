# UI 優化紀錄（新的在上面）
- 2026-10-30 v1.7.4｜主題 2 結果頁與徽章、週挑戰：只改 CSS（index.html 約 line 491 後新增「v1.7.4」區塊）：.res 光暈、.stars 加大＋閃動、.bonus 金色虛線漸層、.wk .wd i.t 脈動外框、.wk .chest 底座、.bdg span.on 金邊、prefers-reduced-motion 關動畫。另修深色模式結果頁（.res／#v-res .qcard 被寫死 #fff，淺字配白底看不到）：加深色覆寫。驗證：check.js ALL OK；320/390px 淺深色首頁僅 v-home 可見、scrollWidth 溢出 0、無 pageerror、結果頁／週挑戰截圖確認。zizi.html 請同步加入同一段 CSS。

- 2026-10-29 v1.7.1｜主題 1 遊戲畫面：選項答對／答錯角落加向量勾叉、回饋卡滑入、進度條條紋動畫、題目卡立體、焦點框、未選項淡化。驗證：check.js ALL OK；Playwright 320/390px 首頁僅 v-home 可見、題目頁與島 canvas 正常、無 pageerror、scrollWidth 溢出 0；答錯截圖勾叉圖示正常

- 2026-10-29 v1.6.0：全面改向量圖示、徽章對比、商店縮圖、道具圓角（手動）
