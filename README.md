# 🧮 珠算與心算線上模擬測驗與自動評分平台
### Abacus & Mental Calculation Online Simulation & Auto-Grading Platform

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-success?style=for-the-badge&logo=github)](https://mhbai.github.io/AbacuePractice/)
[![Pure Frontend](https://img.shields.io/badge/Architecture-Pure%20Frontend%20SPA-blue?style=for-the-badge)](https://mhbai.github.io/AbacuePractice/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

---

## 🌐 線上即時測驗網址 (Live Demo)
👉 **[https://mhbai.github.io/AbacuePractice/](https://mhbai.github.io/AbacuePractice/)**

無需安裝任何套件或伺服器，點擊上方連結即可直接在瀏覽器進行極致流暢的珠算與心算模擬檢定！

---

## 📸 介面預覽 (Interface Preview)

![珠心算模擬測驗與自動評分平台]()

---

## 📖 平台簡介與設計理念

本平台為專為**珠算（Abacus）**與**心算（Mental Math）**學習者、檢定考生與教學機構量身打造的**純前端單頁應用（SPA）**。依據臺灣省商會、中華民國珠算學會及全國珠心算檢定標準規範設計，提供最真實的考試版型、高精度倒數計時、智慧輸入容錯比對與段位證書認定。

---

## ✨ 核心特色與技術亮點

### 1. ⚡ 純前端無伺服器架構 (Zero Backend)
- **即時演算法出題**：所有題型皆在客戶端以隨機數學演算法即時生成，題目百萬變化不重複。
- **本地持久化儲存**：作答設定、主題喜好與完整歷史測驗成績單皆儲存於 `localStorage`，保護使用者隱私。
- **自動記憶上次選擇**：預設進入**準十二級**啟蒙題型，並自動記住上次選擇的測驗項目與級別。

### 2. 🧮 完整支援 14 個檢定級別
- **🧠 心算測驗 (限時 3 分鐘)**：
  - **段位**、**第一級至第十級**、**第十一級**、**第十二級**、**準十二級**。
  - 科目包含：加減心算、乘心算、除心算。
- **🧮 珠算測驗 (限時 10 分鐘)**：
  - **段位**、**第一級至第十級**、**第十一級**、**第十二級**、**準十二級**。
  - 科目包含：加減算（縱列式）、縱橫列計算（$4 \times 5$ 交叉合計矩陣）、乘算、除算。

### 3. 🎯 嚴謹的出題數學邏輯
- **加減算非負約束**：每筆數字隨機生成（含減法），確保「計算過程中的每一步驟累計總和皆嚴格大於 0」。
- **逆向整除生成法**：乘除心算與整數除算預先決定商數與除數相乘得被除數，**100% 保證整除無餘數**。
- **名數與小數四捨五入規範**：
  - 名數（`$`）精準求至**分位**（小數點後第 2 位）。
  - 無名數依級別精確四捨五入（段位/1級至第5位、2級至第4位、3級至第3位、4級以下為整數）。

### 4. ⌨️ 純鍵盤極致作答體驗 (UX)
- 支援數字鍵盤（Numpad）極速盲打作答。
- <kbd>Enter</kbd> / <kbd>Tab</kbd> 自動跳至下一題輸入框並自動全選文字。
- <kbd>Shift</kbd> + <kbd>Enter</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> 返回上一題。
- <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> 方向鍵在縱橫表格與題目欄間直覺切換。
- <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> 隨時一鍵立即交卷。

### 5. ⏱️ 高精度計時與 Web Audio 聲效
- 無延遲倒數計時器（時間到自動強制交卷並鎖定輸入）。
- 最後 30 秒視覺預警閃爍，最後 5 秒每秒嗶聲提示。
- 內建 Web Audio API 音訊合成器（開場和弦、節奏音、交卷鐘聲），無需下載外部音檔。

### 6. 📊 雙重批改模式與智慧評分
- **📝 交卷後統一批改（正式測驗模式）**：模擬真實檢定考場，測驗過程中不干擾作答，交卷後統一批改。
- **⚡ 即填即審（自主練習模式）**：每填入一筆答案即刻進行智慧比對，答對亮綠燈顯示「✓」並播放清脆叮聲，答錯亮紅燈顯示「✗」與標準答案，極度適合初學者自主訓練！
- **智慧容錯比對**：自動剔除使用者輸入之 `$` 貨幣符號、千分位逗點 `,`、多餘空白與括號負數。
- **硃筆標記錯題**：如同老師親自用硃筆批改，清晰標註錯誤題目並提供標準解答。
- **段位認定與評級**：支援初段（80分）至十段（260分）標準認定與級別及格判定。
- **A4 列印優化**：支援 <kbd>Ctrl</kbd> + <kbd>P</kbd> 直接將試卷或成績單列印成標準 A4 試題紙。

---

## ⌨️ 鍵盤快捷鍵一覽 (Keyboard Shortcuts)

| 按鍵組合 | 功能說明 |
| :--- | :--- |
| <kbd>Enter</kbd> / <kbd>Tab</kbd> / <kbd>↓</kbd> | 自動跳至下一題輸入框並全選文字 |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> / <kbd>↑</kbd> | 返回上一題輸入框 |
| <kbd>→</kbd> / <kbd>←</kbd> | 在算式或縱橫矩陣欄位間移動 |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> | 立即交卷並進行自動評分 |

---

## 📋 測驗級別與規範概覽

| 測驗大類 | 限時 | 涵蓋級別 | 測驗科目 | 評分標準 |
| :--- | :--- | :--- | :--- | :--- |
| **心算測驗** | **3 分鐘** | 段位、1級～12級、準12級 | 加減心算 (3~10筆)<br>乘心算 (2~4位)<br>除心算 (整除) | • 段位：初段 (80分) 至 十段 (260分)<br>• 各級別：滿分 100~200 分 (140或70分及格) |
| **珠算測驗** | **10 分鐘** | 段位、1級～12級、準12級 | 乘算 (名數/無名數)<br>除算 (四捨五入)<br>加減算 (縱列)<br>縱橫列計算 ($4 \times 5$) | • 段位：初段至十段認定<br>• 各級別：滿分 100~200 分 |

---

## 🛠️ 本地開發與測試 (Local Development & Testing)

本專案為純靜態網頁，無需建置編譯步驟：

### 1. 複製儲存庫 (Clone)
```bash
git clone https://github.com/mhbai/AbacuePractice.git
cd AbacuePractice
```

### 2. 啟動本地靜態伺服器 (任意伺服器皆可)
```bash
# 使用 Python 內建伺服器
python3 -m http.server 8080

# 或使用 Node.js http-server
npx http-server . -p 8080
```
開啟瀏覽器前往 `http://localhost:8080` 即可使用。

### 3. 執行自動化測試套件 (Automated Verification)
本專案附帶完整的出題約束與評分測試腳本（自動生成 2,800+ 道題目驗證非負約束與整除性）：
```bash
node tests/verify.js
```

---

## 📂 專案目錄架構 (Project Structure)

```
AbacuePractice/
├── index.html                   # 主頁面 SPA 骨架
├── README.md                    # 專案詳細說明文件
├── .gitignore                   # Git 忽略設定
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions Pages 自動佈署流程
├── css/
│   ├── main.css                 # 核心主題 (Paper 試卷風 / Dark / Light)
│   ├── exam.css                 # 縱列加減算、橫式乘除算、縱橫交叉算排版
│   └── components.css           # 計時器、成績單面板、歷史紀錄抽屜
├── js/
│   ├── config/
│   │   └── quizConfig.js        # 核心設定庫與 JSON Schema
│   ├── engine/
│   │   ├── mathEngine.js        # 出題演算法 (非負約束、逆向整除、小數名數)
│   │   └── grader.js            # 自動評分器 (容錯標準化、等價比對、段位認定)
│   ├── state/
│   │   └── store.js             # 響應式狀態機與 LocalStorage 儲存
│   ├── ui/
│   │   ├── timer.js             # 高精度計時器與 Web Audio 合成音效
│   │   ├── keyboardNav.js       # 純鍵盤極致操作控制器
│   │   ├── renderer.js          # 試卷 DOM 動態渲染器
│   │   └── reportView.js        # 成績單彈窗與歷史紀錄視圖
│   └── app.js                   # 應用程式進入點與主控制器
├── assets/
│   └── preview.jpg              # 介面預覽擷圖
└── tests/
    └── verify.js                # 自動化單元與集成測試套件
```

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權開放。
歡迎學習、教學與練習使用！
