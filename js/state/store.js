/**
 * @file store.js
 * @description 應用程式狀態管理與 LocalStorage 歷史儲存器
 */

import { EXAM_TYPES } from '../config/quizConfig.js';

const STORAGE_KEYS = {
  HISTORY: 'abacus_mental_quiz_history_v1',
  SETTINGS: 'abacus_mental_quiz_settings_v1',
  LAST_SELECTION: 'abacus_mental_quiz_last_selection_v1'
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  theme: 'paper', // 'paper' | 'dark' | 'light'
  largeFont: false,
  autoAdvanceOnEnter: true,
  warnOnTimeLimit: true
};

class Store {
  constructor() {
    this.listeners = new Set();
    const lastSel = this.loadLastSelection();
    this.state = {
      examType: lastSel.examType || EXAM_TYPES.MENTAL,
      levelId: lastSel.levelId || 'pre_class_12',
      currentPaper: null,
      userAnswers: {}, // { [subjectId]: { [questionNo]: string } }
      examStatus: 'IDLE', // 'IDLE' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'
      timeRemaining: 0,
      timeSpent: 0,
      activeSubjectId: null,
      lastReport: null,
      settings: this.loadSettings(),
      history: this.loadHistory()
    };
  }

  /**
   * 訂閱狀態變更
   * @param {Function} listener
   * @returns {Function} 取消訂閱函式
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有監聽器
   */
  notify(changeKey = null) {
    for (const listener of this.listeners) {
      listener(this.state, changeKey);
    }
  }

  /**
   * 取得目前狀態快照
   */
  getState() {
    return this.state;
  }

  /**
   * 設定目前測驗大類與級別
   */
  /**
   * 設定預覽試卷 (IDLE 狀態下保持題目快照)
   * @param {object} examPaper
   */
  setPreviewPaper(examPaper) {
    this.state.currentPaper = examPaper;
    this.state.userAnswers = {};
    for (const subjId of Object.keys(examPaper.subjects)) {
      this.state.userAnswers[subjId] = {};
    }
    this.state.examStatus = 'IDLE';
    this.state.timeRemaining = examPaper.timeLimitSeconds;
    this.state.timeSpent = 0;
    this.state.lastReport = null;
    this.notify('previewPaper');
  }

  /**
   * 開始新測驗
   * @param {object} examPaper
   */
  startExam(examPaper) {
    this.state.currentPaper = examPaper;
    this.state.userAnswers = {};
    for (const subjId of Object.keys(examPaper.subjects)) {
      this.state.userAnswers[subjId] = {};
    }
    this.state.examStatus = 'IN_PROGRESS';
    this.state.timeRemaining = examPaper.timeLimitSeconds;
    this.state.timeSpent = 0;
    this.state.activeSubjectId = Object.keys(examPaper.subjects)[0];
    this.state.lastReport = null;
    this.notify('startExam');
  }

  /**
   * 記錄使用者填寫的答案
   */
  setAnswer(subjectId, questionNo, value) {
    if (!this.state.userAnswers[subjectId]) {
      this.state.userAnswers[subjectId] = {};
    }
    this.state.userAnswers[subjectId][questionNo] = value;
    this.notify('answerChange');
  }

  /**
   * 更新倒數時間
   */
  updateTimer(remaining, spent) {
    this.state.timeRemaining = remaining;
    this.state.timeSpent = spent;
    this.notify('timerTick');
  }

  /**
   * 完成測驗並儲存成績單
   */
  finishExam(report) {
    this.state.examStatus = 'COMPLETED';
    this.state.lastReport = report;
    this.saveReportToHistory(report);
    this.notify('finishExam');
  }

  /**
   * 重設回初始狀態
   */
  resetToIdle() {
    this.state.examStatus = 'IDLE';
    this.state.currentPaper = null;
    this.state.userAnswers = {};
    this.state.timeRemaining = 0;
    this.state.timeSpent = 0;
    this.state.lastReport = null;
    this.notify('reset');
  }

  /**
   * 切換目前檢視的科目頁籤
   */
  setActiveSubject(subjectId) {
    this.state.activeSubjectId = subjectId;
    this.notify('activeSubjectChange');
  }

  /**
   * 讀取設定
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * 更新設定並持久化
   */
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.state.settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
    this.notify('settingsChange');
  }

  /**
   * 讀取歷史紀錄
   */
  loadHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load history', e);
      return [];
    }
  }

  /**
   * 儲存成績單至歷史
   */
  saveReportToHistory(report) {
    try {
      const history = this.loadHistory();
      // 限制最多保留 100 筆紀錄
      history.unshift({
        id: report.paperId,
        date: report.gradedAt,
        examType: report.examType,
        levelId: report.levelId,
        levelName: report.levelName,
        totalEarnedScore: report.totalEarnedScore,
        totalPossibleScore: report.totalPossibleScore,
        accuracyRate: report.overallAccuracyRate,
        timeSpentSeconds: report.timeSpentSeconds,
        isPassed: report.evaluation.isPassed,
        danRank: report.evaluation.danRank || null,
        summaryText: report.evaluation.summaryText
      });
      if (history.length > 100) {
        history.pop();
      }
      this.state.history = history;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history report', e);
    }
  }

  /**
   * 讀取上次選擇的測驗項目與級別 (預設為心算 準12級)
   */
  loadLastSelection() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SELECTION);
      return data ? JSON.parse(data) : { examType: EXAM_TYPES.MENTAL, levelId: 'pre_class_12' };
    } catch (e) {
      return { examType: EXAM_TYPES.MENTAL, levelId: 'pre_class_12' };
    }
  }

  /**
   * 儲存選擇的測驗項目與級別
   */
  saveLastSelection(examType, levelId) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SELECTION, JSON.stringify({ examType, levelId }));
    } catch (e) {
      console.warn('Failed to save last selection', e);
    }
  }

  /**
   * 清除歷史紀錄
   */
  clearHistory() {
    this.state.history = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
    this.notify('historyCleared');
  }
}

export const store = new Store();
