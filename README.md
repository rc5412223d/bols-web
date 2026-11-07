# Minecraft 無垠伺服器網站

Minecraft 無垠伺服器的網站前端專案。網站使用 GitHub Pages 發佈，並透過 Cloudflare Worker 提供登入、聊天室及其他後端服務。

- 官方網站：https://bols.dpdns.org/
- 後端 API：https://auth.bols.dpdns.org/
- Worker 名稱：`bols-auth`

## 功能

- Google OAuth 登入。
- 登入後使用伺服器聊天、Litematica 與公告頻道。
- 聊天訊息中的網址自動轉為可點擊連結。
- 語音功能，由 Worker 與 Durable Objects 處理即時訊號。
- 聊天附件透過 Supabase Storage 管理。
- 音樂相關介面與即時狀態功能。
- Web Push 網站推播，可用於公告與 @提及通知。

> 推播功能需要正確部署 Worker、設定 VAPID 金鑰、註冊 Service Worker，並由使用者允許瀏覽器通知。公開金鑰 API 可讀取不代表整個推播流程已完成實機驗證。

## 專案結構

```text
repository/
├── index.html                     # GitHub Pages 預設首頁
├── index_mobile_redesigned.html   # 手機版獨立頁面
├── sw.js                          # Web Push Service Worker
├── README.md                      # 專案說明
└── 其他網站資源                    # 圖片、圖示、樣式等
```

Cloudflare Worker 是獨立的後端專案，不應把 Worker 私密憑證或服務帳戶私鑰放進網站 repository。

### 首頁與手機版

- GitHub Pages 預設載入根目錄的 `index.html`。
- `index_mobile_redesigned.html` 是獨立頁面，可由 `https://bols.dpdns.org/index_mobile_redesigned.html` 開啟。
- 若要讓手機版成為預設首頁，需將其內容整合至 `index.html`，或另外設定前端導向。
- `sw.js` 應放在網站根目錄，並可由 `https://bols.dpdns.org/sw.js` 存取。

## GitHub Pages 部署

1. 將前端檔案放入 GitHub repository 的 Pages 發佈根目錄。
2. 確認 `index.html` 在根目錄。
3. 將 `sw.js` 放在根目錄，不要放進 Worker 專案資料夾。
4. 到 repository 的 **Settings → Pages** 設定發佈來源。
5. 確認自訂網域 `bols.dpdns.org` 的 DNS、網域驗證與 HTTPS 設定正確。
6. 推送更新後，等待 GitHub Pages 發佈，再檢查網站。

部署後可檢查：

- https://bols.dpdns.org/
- https://bols.dpdns.org/index_mobile_redesigned.html
- https://bols.dpdns.org/sw.js

## Cloudflare Worker

前端呼叫的 API 網域：

```text
https://auth.bols.dpdns.org
```

Worker 使用 `worker.js` 作為入口，並使用既有的 `CHAT_ROOM` Durable Object binding 與 `ChatRoom` 類別。

部署時務必保留：

- `CHAT_ROOM` binding。
- `ChatRoom` Durable Object 類別與既有儲存設定。
- 原有環境變數及 Secrets。
- Google OAuth、Supabase、聊天室、語音與音樂功能所需設定。

**不要為了加入推播功能而刪除、重新命名或重建既有 Durable Object。** 不要直接以範例 `wrangler.jsonc` 覆蓋正式環境設定。

## Worker 環境變數與 Secrets

以下為需要核對的名稱。實際值請從自己的服務控制台取得。

| 名稱 | 類型 | 用途 |
|---|---|---|
| `SUPABASE_URL` | Variable | Supabase 專案網址 |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Worker 存取 Supabase Storage |
| `SESSION_SECRET` | Secret | 登入工作階段簽章 |
| `GOOGLE_CLIENT_SECRET` | Secret | Google OAuth 用戶端密鑰 |
| `VAPID_PUBLIC_KEY` | Variable | Web Push 公開金鑰 |
| `VAPID_PRIVATE_KEY` | Secret | Web Push 私密金鑰 |
| `VAPID_SUBJECT` | Variable | 推播聯絡識別，網站值為 `https://bols.dpdns.org/` |
| `FCM_PROJECT_ID` | Variable | Android FCM 專案 ID（使用原生推播時需要） |
| `FCM_CLIENT_EMAIL` | Variable | Firebase 服務帳戶電子郵件（使用原生推播時需要） |
| `FCM_PRIVATE_KEY` | Secret | Firebase 服務帳戶私鑰（使用原生推播時需要） |

### 憑證安全

- 不要把 `SESSION_SECRET`、`GOOGLE_CLIENT_SECRET`、`SUPABASE_SERVICE_ROLE_KEY`、`VAPID_PRIVATE_KEY` 或 `FCM_PRIVATE_KEY` 提交到 GitHub。
- 私密資料應使用 Cloudflare Worker 的 **Settings → Variables and Secrets → Secrets**。
- 若憑證曾經提交到公開 repository，請在原服務控制台撤銷或輪替。
- `google-services.json` 是 Android App 的 Firebase 設定檔，不是網站前端部署所需檔案；Firebase 服務帳戶私鑰不可放入網站。

## Google OAuth

Google OAuth 授權重新導向 URI 必須與 Worker 實際使用的 callback 完全一致：

```text
https://auth.bols.dpdns.org/auth/callback
```

請在 Google Cloud Console 的 OAuth 用戶端設定中核對此 URI。若網域或 callback 路徑變更，Worker 與 Google OAuth 設定必須同步更新。

## Web Push 設定與測試

1. 產生一組 VAPID 金鑰。
2. 在 Cloudflare Worker 設定 `VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY` 與 `VAPID_SUBJECT`。
3. 部署包含推播 API 與 Durable Object 推播處理程式的 Worker。
4. 將 `sw.js` 放在網站根目錄。
5. 使用支援 Web Push 的瀏覽器登入網站並允許通知。
6. 按網站的推播開啟按鈕，確認訂閱 API 成功。
7. 以另一個帳號測試公告與 @提及通知。

公開金鑰 API：

https://auth.bols.dpdns.org/api/push/vapid-public-key

成功回應應包含 `ok: true` 與 `vapidPublicKey`。這只代表公開金鑰 API 可讀取，仍須另外測試訂閱與實際通知送達。

### @提及比對

目前推播程式使用 Google 登入資料中的顯示名稱、完整 Email 與 Email 前綴比對 `@提及`。若聊天室暱稱與 Google 顯示名稱不同，系統不一定能自動對應帳號。

## 常見檢查

### API 回傳 404

- 確認 `auth.bols.dpdns.org` 指向正確的 `bols-auth` Worker。
- 確認正式環境部署的是包含該 API 路由的 Worker 版本。
- 若 Worker 會轉送請求至 Durable Object，確認兩邊的內部路徑一致。

### VAPID API 顯示尚未設定金鑰

- 確認 `VAPID_PUBLIC_KEY` 位於正確的 Worker 環境。
- 確認 `VAPID_PRIVATE_KEY` 已設為 Secret。
- 確認公開與私密金鑰來自同一次產生。
- 儲存設定並確認已套用到正式環境。

### 瀏覽器沒有收到推播

- 確認瀏覽器已允許網站通知。
- 確認 Service Worker 已成功註冊。
- 確認網站推播訂閱 API 回應成功。
- 確認接收者與發送者是不同帳號。
- 先測試公告頻道，再測試 @提及。

### 網站仍顯示舊版

- 確認 GitHub Pages 已完成發佈。
- 使用 `Ctrl + F5` 強制重新整理。
- 若 Service Worker 快取舊資源，確認新版本 Service Worker 已更新。

## 使用技術

- GitHub Pages：靜態網站託管
- Cloudflare Workers：API 與 OAuth
- Cloudflare Durable Objects：即時聊天室、語音訊號及推播資料處理
- Supabase Storage：附件儲存
- Google OAuth：使用者登入
- Web Push / VAPID：網站推播
- Firebase Cloud Messaging：Android 原生推播（需另外設定）

## 維護原則

1. 修改前先備份正式網站與 Worker。
2. 前端檔案部署至 GitHub Pages；Worker 程式部署至 Cloudflare。
3. 私密憑證不可放進公開 GitHub repository。
4. 更新 Worker 時保留原有登入、聊天室、語音、音樂及 Durable Object 設定。
5. 每次更新後分別測試網站載入、登入、聊天、語音及推播；不要只以建置成功判定所有功能正常。
