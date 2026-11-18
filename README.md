# 《為你好》比較｜容器浮沉版

這是最新「容器浮沉版」的 GitHub Pages 上傳資料夾。入口 index.html 是完整互動網頁，會直接顯示透明盛水容器，不會跳轉。樣式、程式和原手寫字都已內嵌，不用額外素材、安裝套件或編譯。

## 上傳方式

1. 打開這個資料夾，將**裡面的全部檔案**上傳至 GitHub 儲存庫根目錄。確認 index.html 直接在根目錄，不要多包一層 github-pages-container 資料夾。
2. 若使用 ZIP，先解壓縮再上傳內容；不要只把 ZIP 上傳。
3. 到儲存庫 Settings → Pages，Source 選 Deploy from a branch，選擇你上傳的分支（通常為 main），資料夾選 /(root)，按 Save。
4. 等部署完成，開啟 Pages 提供的 HTTPS 網址。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

若儲存庫原本有其他網站，請使用獨立儲存庫，或把這份內容放進 docs/，並將 Pages 發布來源選成 /docs，避免覆蓋既有入口。

## 操作

桌面直接開啟 index.html，可用滑桿、拖曳、方向鍵及播放預覽。手機請開啟部署後的 HTTPS 網址，按「啟用手機旋轉」，允許方向感測，立起手機後按「校正 0°」。手機感測與 iOS 權限仍須用實際裝置確認。

0° 是「你看看別人」；浪頭逐字吞入，90° 後回湧退浪，慢慢吐出「你比不上人家」，180° 前完整露出。預覽的 90°→180° 約 20 秒。保留淺倒影，文字露出與遮擋沒有淡入淡出。所有控制共用同一套水面與角度邏輯。

桌面滑桿與預覽顯示容器旋轉；手機感測時容器跟隨實體螢幕，避免視覺上重複轉動。水會流向低處、回盪，停下後逐漸收斂。

## 內容

- index.html：完整互動網頁，唯一必要的網站入口。
- .nojekyll：停用 Jekyll，直接發布靜態內容。
- SOURCE-MANIFEST.json：原始檔案、版本雜湊與檔案大小。
- README.md：本說明。

原始檔案是 testcodex/比較-容器浮沉版.html。這個資料夾不包含先前的比較海浪版、倒影跳轉頁或戀愛泡泡版，也不會依賴上層目錄。可整份搬移或放在任意 GitHub Pages 儲存庫子路徑。
