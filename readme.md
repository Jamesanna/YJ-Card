# 羿鈞科技 - 靠卡支援管理系統 (v1.6.0)

本專案已最佳化為標準 Vite + React + TypeScript 開發環境，適合在 Antigravity 及本機進行後續開發。

## 🛠️ 環境設定與啟動

1. **安裝依賴套件**:
   ```bash
   npm install
   ```

2. **啟動開發伺服器**:
   ```bash
   npm run dev
   ```

3. **建置生產版本**:
   ```bash
   npm run build
   ```

4. **部署至 GitHub Pages**:
   ```bash
   npm run deploy
   ```

## 📂 專案結構說明

- `src/`: 原始程式碼目錄
  - `components/`: 共用元件 (如 `Shared.tsx`)
  - `services/`: 資料處理服務 (如 `store.ts`)
  - `App.tsx`: 主要應用程式邏輯
  - `types.ts`: TypeScript 型別定義
  - `index.tsx`: 進入點
  - `index.css`: 全域樣式
- `index.html`: 網頁進入點
- `vite.config.ts`: Vite 設定檔 (已設定支援 GitHub Pages)

## 📡 資料儲存說明

本系統已串接 **Firebase / Firestore** 雲端資料庫。
設定檔位於 `src/services/firebase.ts`。

## 📜 版本異動紀錄 (Changelog)

### [v1.6.0] - 2026-01-02
- **新增**: 後台「系統資訊」加入「初始化資料庫」按鈕。
- **安全性**: 初始化動作需經過 SYSOP 帳號密碼二次驗證。
- **範例資料**: 擴充 20 筆員工資料、5 家廠商、10 項專案、及跨年度共 30 筆靠卡紀錄。
- **版本控管**: 整合 `SYSTEM_VERSION` 與 `LAST_UPDATE_CODE` 自動化。

### [v1.5.2] - 2026-01-02
- **功能**: 基本 Firebase 整合完成。

---
祝開發順利！
