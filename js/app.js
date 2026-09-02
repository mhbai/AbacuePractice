/**
 * @file app.js
 * @description 珠心算模擬測驗 SPA 應用程式進入點與主控制器
 */

import { EXAM_TYPES, getLevelList, getLevelConfig } from './config/quizConfig.js';
import { generateExamPaper } from './engine/mathEngine.js';
import { gradeExamPaper, gradeSingleQuestion } from './engine/grader.js';
import { store } from './state/store.js';
import { ExamTimer, soundEngine } from './ui/timer.js';
import { KeyboardNavigator } from './ui/keyboardNav.js';
import { ExamRenderer } from './ui/renderer.js';
import { ReportView } from './ui/reportView.js';

class AppController {
  constructor() {
    this.dom = {
      selectExamType: document.getElementById('select-exam-type'),
      selectLevel: document.getElementById('select-level'),
      selectGradingMode: document.getElementById('select-grading-mode'),
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

    // 批改模式變更 (交卷後統一批改 vs 即填即審)
    if (this.dom.selectGradingMode) {
      this.dom.selectGradingMode.addEventListener('change', (e) => {
        store.updateSettings({ gradingMode: e.target.value });
        this.renderCurrentPaperView(store.getState().activeSubjectId || 'ALL');
      });
    }

    // 開始 / 暫停 / 繼續測驗按鈕
    this.dom.btnStartExam.addEventListener('click', () => {
      const { examStatus } = store.getState();
      if (examStatus === 'IN_PROGRESS') {
        this.handlePauseExam();
      } else if (examStatus === 'PAUSED') {
        this.handleResumeExam();
      } else {
        this.handleStartExam();
      }
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

    // 主題切換 (深色模式 dark <-> 淺色試卷 paper)
    this.dom.btnToggleTheme.addEventListener('click', () => {
      const currentTheme = store.getState().settings.theme || 'paper';
      const nextTheme = (currentTheme === 'dark') ? 'paper' : 'dark';
      store.updateSettings({ theme: nextTheme });
      document.documentElement.setAttribute('data-theme', nextTheme);
      this.updateThemeIcon(nextTheme);
    });

    // 試卷委派事件：使用者輸入時儲存數值，並清除舊狀態（不打斷輸入）
    this.dom.examContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('quiz-answer-input')) {
        const sId = e.target.getAttribute('data-subject');
        const qNo = parseInt(e.target.getAttribute('data-qno'), 10);
        const val = e.target.value;
        store.setAnswer(sId, qNo, val);

        const container = e.target.closest('.ans-cell, .arithmetic-row, .td-cross-ans');
        const auditCell = this.dom.examContainer.querySelector(`[data-subject="${sId}"][data-audit-qno="${qNo}"]`) || this.dom.examContainer.querySelector(`[data-audit-qno="${qNo}"]`);
        if (container) container.classList.remove('ans-correct', 'ans-incorrect');
        if (auditCell) {
          auditCell.classList.remove('stamp-correct', 'stamp-wrong');
          auditCell.innerHTML = '';
          auditCell.removeAttribute('data-last-graded-val');
        }
      }
    });

    // 離開輸入框或按下 Enter/Tab 跳題時才審核答案並播放音效
    this.dom.examContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('quiz-answer-input')) {
        const sId = e.target.getAttribute('data-subject');
        const qNo = parseInt(e.target.getAttribute('data-qno'), 10);
        const val = e.target.value;
        this.handleInstantGradingOnCommit(e.target, sId, qNo, val);
      }
    });

    this.dom.examContainer.addEventListener('blur', (e) => {
      if (e.target.classList.contains('quiz-answer-input')) {
        const sId = e.target.getAttribute('data-subject');
        const qNo = parseInt(e.target.getAttribute('data-qno'), 10);
        const val = e.target.value;
        this.handleInstantGradingOnCommit(e.target, sId, qNo, val);
      }
    }, true);

    this.dom.examContainer.addEventListener('click', (e) => {
      if (e.target.closest('#btn-overlay-start')) {
        this.handleStartExam();
        return;
      }
      if (e.target.closest('#btn-overlay-resume')) {
        this.handleResumeExam();
        return;
      }
      const tabBtn = e.target.closest('[data-subject-tab]');
      if (tabBtn) {
        const targetTab = tabBtn.getAttribute('data-subject-tab');
        this.switchSubjectTab(targetTab);
      }
    });
  }

  /**
   * 更新深淺主題圖示 (深色顯示月亮 🌙 / 淺色顯示太陽 ☀️)
   * @param {string} theme
   */
  updateThemeIcon(theme) {
    if (!this.dom.btnToggleTheme) return;
    if (theme === 'dark') {
      this.dom.btnToggleTheme.textContent = '🌙';
      this.dom.btnToggleTheme.title = '目前為深色夜間模式，點擊切換為明亮試卷主題';
      this.dom.btnToggleTheme.setAttribute('aria-label', '目前為深色模式');
    } else {
      this.dom.btnToggleTheme.textContent = '☀️';
      this.dom.btnToggleTheme.title = '目前為淺色試卷模式，點擊切換為深色夜間主題';
      this.dom.btnToggleTheme.setAttribute('aria-label', '目前為淺色模式');
    }
  }

  /**
   * 套用偏好設定至介面
   */
  applySettingsToUI() {
    const { settings } = store.getState();
    const currentTheme = settings.theme || 'paper';
    document.documentElement.setAttribute('data-theme', currentTheme);
    this.dom.btnToggleSound.textContent = settings.soundEnabled ? '🔊' : '🔇';
    this.updateThemeIcon(currentTheme);
    if (this.dom.selectGradingMode) {
      this.dom.selectGradingMode.value = settings.gradingMode || 'ON_SUBMIT';
    }
    this.updateDefaultTimerPreview();
  }

  /**
   * 取得即時批改結果映射物件 (若處於即填即審模式)
   */
  getInstantGradedMap(paper, userAnswers) {
    if (!paper) return null;
    const { settings, lastReport } = store.getState();
    if (lastReport) return lastReport;
    if (settings.gradingMode !== 'INSTANT') return null;

    const instSubjects = {};
    for (const [sId, sData] of Object.entries(paper.subjects)) {
      const uAnsMap = userAnswers[sId] || {};
      const qResults = [];
      for (const q of (sData.questions || [])) {
        const uVal = uAnsMap[q.questionNo];
        if (uVal !== undefined && String(uVal).trim() !== '') {
          const res = gradeSingleQuestion(q, uVal);
          qResults.push({
            questionNo: q.questionNo,
            isCorrect: res.isCorrect,
            earnedPoints: res.pointsEarned,
            standardAnswer: q.standardAnswer,
            userAnswerRaw: uVal
          });
        }
      }
      instSubjects[sId] = {
        subjectId: sId,
        questions: qResults
      };
    }

    return {
      isInstant: true,
      subjects: instSubjects
    };
  }

  /**
   * 統一渲染當前試卷視圖
   */
  renderCurrentPaperView(tab = store.getState().activeSubjectId || 'ALL') {
    const state = store.getState();
    if (!state.currentPaper) return;
    const instantGraded = this.getInstantGradedMap(state.currentPaper, state.userAnswers);
    this.renderer.renderPaper(
      state.currentPaper,
      state.userAnswers,
      tab,
      state.lastReport || instantGraded,
      state.examStatus
    );
  }

  /**
   * 處理單題送出時之即時批改與聲效提示 (即填即審模式：Enter / Tab / Blur 時觸發)
   */
  handleInstantGradingOnCommit(inputEl, sId, qNo, val) {
    const state = store.getState();
    // 只有在即填即審模式且測驗進行中尚未交卷時執行即時回饋
    if (state.settings.gradingMode !== 'INSTANT' || state.lastReport) return;
    if (state.examStatus !== 'IN_PROGRESS') return;

    const paper = state.currentPaper;
    const question = paper?.subjects[sId]?.questions?.find(item => item.questionNo === qNo);
    if (!question) return;

    const container = inputEl.closest('.ans-cell, .arithmetic-row, .td-cross-ans');
    const auditCell = this.dom.examContainer.querySelector(`[data-subject="${sId}"][data-audit-qno="${qNo}"]`) || this.dom.examContainer.querySelector(`[data-audit-qno="${qNo}"]`);

    if (!val || String(val).trim() === '') {
      if (container) container.classList.remove('ans-correct', 'ans-incorrect');
      if (auditCell) {
        auditCell.classList.remove('stamp-correct', 'stamp-wrong');
        auditCell.innerHTML = '';
        auditCell.removeAttribute('data-last-graded-val');
      }
      return;
    }

    // 若此數值剛剛已經審核判定過，避免重覆播放提示音
    const lastVal = auditCell ? auditCell.getAttribute('data-last-graded-val') : null;
    if (lastVal === val) return;
    if (auditCell) auditCell.setAttribute('data-last-graded-val', val);

    const result = gradeSingleQuestion(question, val);
    const soundEnabled = state.settings.soundEnabled;

    if (result.isCorrect) {
      if (container) {
        container.classList.remove('ans-incorrect');
        container.classList.add('ans-correct');
      }
      if (auditCell) {
        auditCell.classList.remove('stamp-wrong');
        auditCell.classList.add('stamp-correct');
        auditCell.innerHTML = '✓';
      }
      if (soundEnabled) {
        soundEngine.playCorrectSound();
      }
    } else {
      if (container) {
        container.classList.remove('ans-correct');
        container.classList.add('ans-incorrect');
      }
      if (auditCell) {
        auditCell.classList.remove('stamp-correct');
        auditCell.classList.add('stamp-wrong');
        auditCell.innerHTML = `<span class="audit-mark">✗</span><span class="audit-ans">${result.answerFormatted}</span>`;
      }
      if (soundEnabled) {
        soundEngine.playWrongSound();
      }
    }
  }

  /**
   * 更新控制列所有按鈕與選單之啟用/停用/文字樣式狀態
   * @param {'IDLE' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'} status
   */
  updateControlBarForState(status) {
    if (status === 'IN_PROGRESS') {
      this.dom.btnStartExam.disabled = false;
      this.dom.btnStartExam.innerHTML = '⏸️ 暫停測驗';
      this.dom.btnStartExam.className = 'btn btn-warning';
      this.dom.btnSubmitExam.disabled = false;
      this.dom.selectExamType.disabled = true;
      this.dom.selectLevel.disabled = true;
      if (this.dom.selectGradingMode) this.dom.selectGradingMode.disabled = true;
      this.dom.timerDisplay.classList.remove('timer-warning');
    } else if (status === 'PAUSED') {
      this.dom.btnStartExam.disabled = false;
      this.dom.btnStartExam.innerHTML = '▶ 繼續測驗';
      this.dom.btnStartExam.className = 'btn btn-primary';
      this.dom.btnSubmitExam.disabled = false;
      this.dom.selectExamType.disabled = true;
      this.dom.selectLevel.disabled = true;
      if (this.dom.selectGradingMode) this.dom.selectGradingMode.disabled = true;
    } else {
      // IDLE or COMPLETED
      this.dom.btnStartExam.disabled = false;
      this.dom.btnStartExam.innerHTML = status === 'COMPLETED' ? '▶ 重新測驗' : '▶ 開始測驗';
      this.dom.btnStartExam.className = 'btn btn-primary';
      this.dom.btnSubmitExam.disabled = true;
      this.dom.selectExamType.disabled = false;
      this.dom.selectLevel.disabled = false;
      if (this.dom.selectGradingMode) this.dom.selectGradingMode.disabled = false;
      this.dom.timerDisplay.classList.remove('timer-warning');
    }
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
    this.updateControlBarForState('IDLE');
    this.renderCurrentPaperView(preferredSubjectTab);
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

    // 3. 介面按鈕狀態切換 (開始按鈕轉為暫停按鈕)
    this.updateControlBarForState('IN_PROGRESS');

    // 4. 渲染試卷並啟動鍵盤導航
    this.renderCurrentPaperView('ALL');
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
   * 暫停測驗流程
   */
  handlePauseExam() {
    const state = store.getState();
    if (state.examStatus !== 'IN_PROGRESS') return;

    store.pauseExam();
    if (this.timer) this.timer.pause();
    this.keyboardNav.detach();
    this.updateControlBarForState('PAUSED');
    this.renderCurrentPaperView(state.activeSubjectId || 'ALL');
  }

  /**
   * 繼續測驗流程
   */
  handleResumeExam() {
    const state = store.getState();
    if (state.examStatus !== 'PAUSED') return;

    store.resumeExam();
    if (this.timer) this.timer.resume();
    this.updateControlBarForState('IN_PROGRESS');
    this.renderCurrentPaperView(state.activeSubjectId || 'ALL');
    this.keyboardNav.attach();
    this.keyboardNav.focusFirstInput(true);
  }

  /**
   * 使用者手動點擊交卷或快捷鍵交卷
   */
  handleManualSubmit() {
    const state = store.getState();
    if (state.examStatus !== 'IN_PROGRESS' && state.examStatus !== 'PAUSED') return;

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
    this.updateControlBarForState('COMPLETED');

    // 4. 重新渲染試卷 (帶批改標記與標準答案，輸入框鎖定為唯讀)
    this.renderCurrentPaperView(state.activeSubjectId);

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
      this.renderCurrentPaperView(subjectId);
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
