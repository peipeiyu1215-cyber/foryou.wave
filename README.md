# 《為你好》比較海浪 · GitHub Pages 上傳版

這份已選定會真正繪製海浪的比較版本：黑底白字、照片海水材質、高浪逐字吞沒，再露出另一句。不是倒影／漣漪版，也不是跳轉殼。

## 直接測試

開啟本資料夾的 **index.html**，即可使用角度滑桿、滑鼠拖曳、左右方向鍵、播放預覽、重置與全螢幕。compare.html 也是完整互動頁，兩者都不會跳轉，不需要上層資料夾。

0° 為「你看看別人」（保留兩個「看」）；180° 是倒轉裝置後可正讀的「你比不上人家」。90°、270° 完全遮字。預覽保留 0° 閱讀時間、慢慢吞字及完全吞完後加快收尾的節奏。

## 上傳 GitHub Pages

1. 解壓縮 ZIP，將裡面的**所有檔案**上傳到 GitHub 儲存庫根目錄。請確認 index.html 直接在根目錄，不是多包一層 github-pages-comparison 資料夾；不要只上傳 ZIP 檔。
2. 在儲存庫的 Settings → Pages，Source 選 Deploy from a branch，Branch 選你上傳的分支（通常是 main），資料夾選 /(root)，按 Save。
3. 等 GitHub 完成部署，以 Pages 顯示的 HTTPS 網址開啟。網站支援 https://使用者.github.io/儲存庫名稱/ 這種子路徑。

若要保留儲存庫原來的其他網站，可改將這份檔案內容放在 docs/，並將 Pages 發布資料夾選為 /docs；不要直接覆蓋不相關網站。

官方設定說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 手機旋轉

使用手機 Safari／Chrome 開啟部署後的 HTTPS 網址，按「啟用手機旋轉」，允許方向感測，手機立起後按「校正 0°」。滑桿、拖曳、預覽與手機共用同一套角度。桌面和直接開檔可先用滑桿測試；感測器與 iOS 權限仍須在實際手機確認。

## 檔案

- index.html：真正的預設入口，內有 Canvas、角度滑桿及操作介面。
- compare.html：同一份完整網頁，保留 /compare.html 的使用方式。
- comparison.css：原比較頁共用樣式，重新命名以免誤認為戀愛頁。
- comparison-waves.js：浪面、逐字位移與遮擋。
- comparison.js：滑桿、DeviceOrientation、iOS 權限、校正、拖曳及預覽。
- comparison-handwriting.js、comparison-strokes.js：原手寫字資料與清理。
- comparison-sea-reference.js：內嵌海浪照片材質。
- .nojekyll：以靜態檔案發布。
- SOURCE-MANIFEST.json：來源檔案與 SHA-256 核對資料。

不用 npm 安裝、編譯、CDN 或額外圖片資料夾；筆跡與海浪參考圖已內嵌。JavaScript 資源使用相對路徑與內容版本碼，適用儲存庫子路徑。

## 已確認的來源

真正原始入口是 testcodex/compare.html；海浪是 comparison-waves.js 的 ComparisonSea 類別，旋轉控制是 comparison.js。
testcodex/倒影/index.html 與 testcodex/倒影/compare.html 都只會跳到 ../compare.html；原根目錄 index.html 是戀愛泡泡頁。這些都沒有被拿來當成此次的發布入口。

SOURCE-MANIFEST.json 可核對發布版 JavaScript 與目前專案來源；原專案的其他情境沒有被更動。
