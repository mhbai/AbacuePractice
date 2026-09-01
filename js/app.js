/**
 * @file app.js
 * @description 珠心算模擬測驗 SPA 應用程式進入點與主控制器
 */

import { EXAM_TYPES, getLevelList, getLevelConfig } from './config/quizConfig.js';
import { generateExamPaper } from './engine/mathEngine.js';
import { gradeExamPaper } from './engine/grader.js';
import { store } from './state/store.js';
import { ExamTimer } from './ui/timer.js';
import { KeyboardNavigator } from './ui/keyboardNav.js';
import { ExamRenderer } from './ui/renderer.js';
import { ReportView } from './ui/reportView.js';

class AppController {
  constructor() {
    this.dom = {
      selectExamType: document.getElementById('select-exam-type'),
      selectLevel: document.getElementById('select-level'),
      btnStartExam: document.getElementById('btn-start-exam'),
      btnSubmitExam: document.getElementById('btn-submit-exam'),
      timerDigits: document.getElementById('timer-digits'),
      timerDisplay: document.getElementById('timer-display'),
      examContainer: document.getElementById('exam-paper-container'),
      modalMountPoint: document.getElementById('modal-mount-point'),
      btnOpenHistory: document.getElementById('btn-open-history'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      btnToggleTheme: document.getElementById('btn-toggle-theme')
    };

    this.renderer = new ExamRenderer(this.dom.examContainer);
    this.reportView = new ReportView(this.dom.modalMountPoint);
    this.timer = null;
    this.keyboardNav = new KeyboardNavigator({
      container: this.dom.examContainer,
      onSubmitShortcut: () => this.handleManualSubmit()
    });

    this.init();
  }

  init() {
    // 1. 初始化設定與主題
    this.applySettingsToUI();

    // 2. 載入上次選擇或預設準12級
    const { examType, levelId } = store.getState();
    if (this.dom.selectExamType) {
      this.dom.selectExamType.value = examType || EXAM_TYPES.MENTAL;
    }

    // 3. 填充級別下拉選單
    this.populateLevels(this.dom.selectExamType.value, levelId || 'pre_class_12');

    // 4. 事件綁定
    this.bindEvents();

    // 5. 訂閱 Store
    store.subscribe((state, changeKey) => this.handleStoreChange(state, changeKey));

    // 6. 初始載入預覽題庫
    this.prepareInitialView();
  }

  /**
   * 填充級別選項清單 (預設優先選取準12級或上次記憶之級別)
   * @param {string} examType
   * @param {string} [preferredLevelId='pre_class_12']
   */
  populateLevels(examType, preferredLevelId = 'pre_class_12') {
    const levels = getLevelList(examType);
    this.dom.selectLevel.innerHTML = levels.map(lvl => `
      <option value="${lvl.levelId}">${lvl.levelName}</option>
    `).join('');

    // 優先選取指定級別或準12級
    const hasTarget = levels.some(l => l.levelId === preferredLevelId);
    const targetLevelId = hasTarget ? preferredLevelId : (levels.some(l => l.levelId === 'pre_class_12') ? 'pre_class_12' : levels[0].levelId);
    
    this.dom.selectLevel.value = targetLevelId;
  }

  /**
   * 綁定 DOM 事件
   */
  bindEvents() {
    // 測驗大類別變更：切換題型、更新倒數、即時切換試卷題庫並記錄至 localStorage
    this.dom.selectExamType.addEventListener('change', (e) => {
      const currentLevel = this.dom.selectLevel.value;
      this.populateLevels(e.target.value, currentLevel);
      store.saveLastSelection(this.dom.selectExamType.value, this.dom.selectLevel.value);
      this.updateDefaultTimerPreview();
      this.prepareInitialView();
    });

    // 級別變更：更新倒數、即時切換試卷題庫並記錄至 localStorage
    this.dom.selectLevel.addEventListener('change', () => {
      store.saveLastSelection(this.dom.selectExamType.value, this.dom.selectLevel.value);
      this.updateDefaultTimerPreview();
      this.prepareInitialView();
    });

    // 開始測驗按鈕
    this.dom.btnStartExam.addEventListener('click', () => {
      this.handleStartExam();
    });

    // 立即交卷按鈕
    this.dom.btnSubmitExam.addEventListener('click', () => {
      this.handleManualSubmit();
    });

    // 歷史紀錄按鈕
    this.dom.btnOpenHistory.addEventListener('click', () => {
      const history = store.getHistory ? store.getHistory() : store.getState().history;
      this.reportView.showHistoryModal(
        history,
        () => store.clearHistory(),
        (record) => console.log('Selected record', record)
      );
    });

    // 音效開關切換
    this.dom.btnToggleSound.addEventListener('click', () => {
      const current = store.getState().settings.soundEnabled;
      store.updateSettings({ soundEnabled: !current });
      this.dom.btnToggleSound.textContent = !current ? '🔊' : '🔇';
    });

    // 主題切換 (paper -> dark -> light)
    this.dom.btnToggleTheme.addEventListener('click', () => {
      const themes = ['paper', 'dark', 'light'];
      const currentTheme = store.getState().settings.theme || 'paper';
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      store.updateSettings({ theme: nextTheme });
      document.documentElement.setAttribute('data-theme', nextTheme);
    });

    // 試卷委派事件 (輸入作答與頁籤切換)
    this.dom.examContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('quiz-answer-input')) {
        const sId = e.target.getAttribute('data-subject');
        const qNo = parseInt(e.target.getAttribute('data-qno'), 10);
        store.setAnswer(sId, qNo, e.target.value);
      }
    });

    this.dom.examContainer.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-subject-tab]');
      if (tabBtn) {
        const targetTab = tabBtn.getAttribute('data-subject-tab');
        this.switchSubjectTab(targetTab);
      }
    });
  }

  /**
   * 套用偏好設定至介面
   */
  applySettingsToUI() {
    const { settings } = store.getState();
    document.documentElement.setAttribute('data-theme', settings.theme || 'paper');
    this.dom.btnToggleSound.textContent = settings.soundEnabled ? '🔊' : '🔇';
    this.updateDefaultTimerPreview();
  }

  /**
   * 更新預設倒數計時器預覽數值
   */
  updateDefaultTimerPreview() {
    const examType = this.dom.selectExamType.value;
    const levelId = this.dom.selectLevel.value;
    const lvlCfg = getLevelConfig(examType, levelId);
    const secs = lvlCfg ? lvlCfg.timeLimitSeconds : (examType === EXAM_TYPES.MENTAL ? 180 : 600);
    this.dom.timerDigits.textContent = ExamTimer.formatTime(secs);
    this.dom.timerDisplay.classList.remove('timer-warning');
  }

  /**
   * 準備初始預覽試卷 (同步記錄於 store 中，避免切換頁籤時題目丟失)
   * @param {string} [preferredSubjectTab='ALL']
   */
  prepareInitialView(preferredSubjectTab = 'ALL') {
    const examType = this.dom.selectExamType.value;
    const levelId = this.dom.selectLevel.value;
    const paper = generateExamPaper(examType, levelId);
    store.setPreviewPaper(paper);
    store.setActiveSubject(preferredSubjectTab);
    this.renderer.renderPaper(paper, {}, preferredSubjectTab, null);
  }

  /**
   * 開始新測驗流程
   */
  handleStartExam() {
    const examType = this.dom.selectExamType.value;
    const levelId = this.dom.selectLevel.value;

    // 1. 即時隨機演算法生成全新試卷
    const paper = generateExamPaper(examType, levelId);

    // 2. 寫入 Store
    store.startExam(paper);

    // 3. 介面按鈕狀態切換
    this.dom.btnStartExam.disabled = true;
    this.dom.btnSubmitExam.disabled = false;
    this.dom.selectExamType.disabled = true;
    this.dom.selectLevel.disabled = true;
    this.dom.timerDisplay.classList.remove('timer-warning');

    // 4. 渲染試卷並啟動鍵盤導航
    this.renderer.renderPaper(paper, {}, 'ALL', null);
    this.keyboardNav.attach();
    this.keyboardNav.focusFirstInput(true);

    // 5. 啟動高精度倒數計時器
    if (this.timer) this.timer.stop();
    this.timer = new ExamTimer({
      totalSeconds: paper.timeLimitSeconds,
      soundEnabled: store.getState().settings.soundEnabled,
      onTick: (rem, spent) => {
        store.updateTimer(rem, spent);
        this.dom.timerDigits.textContent = ExamTimer.formatTime(rem);
      },
      onWarning: () => {
        this.dom.timerDisplay.classList.add('timer-warning');
      },
      onTimeUp: () => {
        this.finishExamAndGrade(true);
      }
    });

    this.timer.start();
  }

  /**
   * 使用者手動點擊交卷或快捷鍵交卷
   */
  handleManualSubmit() {
    const state = store.getState();
    if (state.examStatus !== 'IN_PROGRESS') return;

    const totalAns = Object.values(state.userAnswers).reduce((sum, obj) => sum + Object.keys(obj).length, 0);
    const totalQ = state.currentPaper.totalQuestionsCount;

    if (totalAns < totalQ) {
      if (!confirm(`尚有 ${totalQ - totalAns} 題未作答，確定要現在交卷評分嗎？`)) {
        return;
      }
    }

    this.finishExamAndGrade(false);
  }

  /**
   * 結束測驗並自動批改評分
   * @param {boolean} isTimeUp
   */
  finishExamAndGrade(isTimeUp = false) {
    if (this.timer) this.timer.stop();
    this.keyboardNav.detach();

    const state = store.getState();
    const timeSpent = isTimeUp ? state.currentPaper.timeLimitSeconds : this.timer.getSpent();

    // 1. 自動評分
    const report = gradeExamPaper(state.currentPaper, state.userAnswers, timeSpent);

    // 2. 儲存報告
    store.finishExam(report);

    // 3. 更新按鈕狀態
    this.dom.btnStartExam.disabled = false;
    this.dom.btnSubmitExam.disabled = true;
    this.dom.selectExamType.disabled = false;
    this.dom.selectLevel.disabled = false;
    this.dom.timerDisplay.classList.remove('timer-warning');

    // 4. 重新渲染試卷 (帶批改標記與標準答案)
    this.renderer.renderPaper(state.currentPaper, state.userAnswers, state.activeSubjectId, report);

    // 5. 彈出成績單
    this.reportView.showReportModal(report, {
      onReview: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onRetry: () => {
        this.handleStartExam();
      }
    });
  }

  /**
   * 切換科目頁籤
   */
  switchSubjectTab(subjectId) {
    let state = store.getState();
    if (!state.currentPaper) {
      this.prepareInitialView(subjectId);
      state = store.getState();
    } else {
      store.setActiveSubject(subjectId);
      this.renderer.renderPaper(state.currentPaper, state.userAnswers, subjectId, state.lastReport);
    }
    if (state.examStatus === 'IN_PROGRESS') {
      this.keyboardNav.focusFirstInput(true);
    }
  }

  /**
   * 處理 Store 狀態變更
   */
  handleStoreChange(state, changeKey) {
    if (changeKey === 'settingsChange') {
      this.applySettingsToUI();
    }
  }
}

// 當 DOM 載入完畢後初始化應用
document.addEventListener('DOMContentLoaded', () => {
  window.__abacusApp = new AppController();
});
