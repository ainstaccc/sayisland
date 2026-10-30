# UI 優化紀錄（新的在上面）

- 2026-10-30 v1.8.0｜（手動）首頁瘦身＋底部導航：index.html 的 `MAPX/MAPH/mapY()/mapH()/nodeCenter()/placeWalker()/drawTrail()` 改三欄蛇形地圖；`#dRow` 改為 `.hbar` 愛心進度條；新增 `<nav id="bnav">`、`syncNav()`、`body.hasnav`；CSS 在最後一個 style 的「v1.8.0」區塊。驗證：check.js ALL OK；Playwright 390／320 首頁僅 v-home 可見、無 pageerror、scrollWidth 無溢出；導航切換首頁／詞卡冊／家長區／島來回正常。首頁高度 2588px → 1847px（390 寬）

- 2026-10-29 v1.7.1｜主題 1 遊戲畫面：選項答對／答錯角落加向量勾叉、回饋卡滑入、進度條條紋動畫、題目卡立體、焦點框、未選項淡化。驗證：check.js ALL OK；Playwright 320/390px 首頁僅 v-home 可見、題目頁與島 canvas 正常、無 pageerror、scrollWidth 溢出 0；答錯截圖勾叉圖示正常

- 2026-10-29 v1.6.0：全面改向量圖示、徽章對比、商店縮圖、道具圓角（手動）
