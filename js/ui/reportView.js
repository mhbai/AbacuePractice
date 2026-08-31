/**
 * @file reportView.js
 * @description 成績單統計、評分結果展示與歷史紀錄視圖
 */

import { ExamTimer } from './timer.js';

export class ReportView {
  constructor(modalContainerEl) {
    this.container = modalContainerEl;
  }

  /**
   * 顯示成績單彈窗
   * @param {object} report - 評分結果物件
   * @param {object} callbacks - { onReview, onRetry, onOpenHistory }
   */
  showReportModal(report, callbacks = {}) {
    const {
      levelName,
      totalEarnedScore,
      totalPossibleScore,
      overallAccuracyRate,
      overallCompletionRate,
      timeSpentSeconds,
      evaluation,
      subjects
    } = report;

    const accuracyPct = Math.round(overallAccuracyRate * 100);
    const completionPct = Math.round(overallCompletionRate * 100);
    const scorePct = Math.round((totalEarnedScore / totalPossibleScore) * 100);

    const isDan = !!evaluation.danRank;
    const badgeClass = evaluation.isPassed ? 'status-passed' : 'status-failed';

    let subjectsHtml = '';
    for (const [sId, sData] of Object.entries(subjects)) {
      const sAccPct = Math.round(sData.accuracyRate * 100);
      subjectsHtml += `
        <div class="report-subject-row">
          <div class="subj-info">
            <span class="subj-title">${sData.subjectName}</span>
            <span class="subj-score">${sData.earnedPoints} / ${sData.totalPossiblePoints} 分</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${Math.round((sData.earnedPoints / sData.totalPossiblePoints) * 100)}%"></div>
          </div>
          <div class="subj-sub-stats">
            <span>答對：${sData.correctCount} / ${sData.questionCount} 題</span>
            <span>正確率：${sAccPct}%</span>
          </div>
        </div>
      `;
    }

    const modalHtml = `
      <div class="modal-backdrop" id="report-modal-backdrop">
        <div class="report-modal-card">
          <header class="report-header ${badgeClass}">
            <div class="report-cert-icon">
              ${evaluation.isPassed ? '🏆' : '📝'}
            </div>
            <div class="report-header-text">
              <h2 class="report-title">${levelName} 測驗成績單</h2>
              <p class="report-summary-text">${evaluation.summaryText}</p>
              ${evaluation.nextGoalText ? `<p class="report-next-goal">${evaluation.nextGoalText}</p>` : ''}
            </div>
          </header>

          <div class="report-body">
            <!-- 核心三項數據面板 -->
            <div class="report-stats-grid">
              <div class="stat-card stat-score">
                <span class="stat-label">總得分</span>
                <div class="stat-value">
                  <span class="score-number">${totalEarnedScore}</span>
                  <span class="score-total">/ ${totalPossibleScore}</span>
                </div>
                <div class="stat-sub">${scorePct}% 達成率</div>
              </div>

              <div class="stat-card stat-accuracy">
                <span class="stat-label">作答正確率</span>
                <div class="stat-value">
                  <span class="score-number">${accuracyPct}</span>
                  <span class="score-unit">%</span>
                </div>
                <div class="stat-sub">答對 ${report.totalCorrect} / ${report.totalAttempted} 題</div>
              </div>

              <div class="stat-card stat-time">
                <span class="stat-label">作答耗時</span>
                <div class="stat-value">
                  <span class="score-number">${ExamTimer.formatTime(timeSpentSeconds)}</span>
                </div>
                <div class="stat-sub">完成率 ${completionPct}% (${report.totalAttempted}/${report.totalQuestions}題)</div>
              </div>
            </div>

            <!-- 分科成績明細 -->
            <div class="report-subjects-section">
              <h4 class="section-title">分科成績明細</h4>
              <div class="subjects-list">
                ${subjectsHtml}
              </div>
            </div>
          </div>

          <footer class="report-footer">
            <button class="btn btn-secondary" id="btn-report-review">
              <i class="icon-search"></i> 檢視試卷錯題
            </button>
            <button class="btn btn-secondary" id="btn-report-print">
              <i class="icon-print"></i> 列印試卷 / 成績單
            </button>
            <button class="btn btn-primary" id="btn-report-retry">
              <i class="icon-refresh"></i> 重新測驗
            </button>
          </footer>
        </div>
      </div>
    `;

    this.container.innerHTML = modalHtml;

    // 綁定按鈕事件
    document.getElementById('btn-report-review')?.addEventListener('click', () => {
      this.hideModal();
      if (callbacks.onReview) callbacks.onReview();
    });

    document.getElementById('btn-report-print')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-report-retry')?.addEventListener('click', () => {
      this.hideModal();
      if (callbacks.onRetry) callbacks.onRetry();
    });
  }

  /**
   * 關閉彈窗
   */
  hideModal() {
    this.container.innerHTML = '';
  }

  /**
   * 顯示歷史紀錄抽屜/彈窗
   */
  showHistoryModal(historyList = [], onClearHistory = null, onSelectRecord = null) {
    let listHtml = '';
    if (!historyList || historyList.length === 0) {
      listHtml = `<div class="empty-history">尚未有任何測驗紀錄，快來進行第一次測驗吧！</div>`;
    } else {
      listHtml = historyList.map((item, index) => {
        const dateStr = new Date(item.date).toLocaleString('zh-TW', { hour12: false });
        const passClass = item.isPassed ? 'tag-passed' : 'tag-failed';
        return `
          <div class="history-item-row" data-index="${index}">
            <div class="hist-col-main">
              <div class="hist-title-line">
                <span class="hist-level">${item.levelName}</span>
                <span class="hist-type-badge">${item.examType === 'MENTAL' ? '心算' : '珠算'}</span>
                <span class="hist-pass-badge ${passClass}">${item.danRank || (item.isPassed ? '及格' : '未及格')}</span>
              </div>
              <div class="hist-date">${dateStr}</div>
            </div>
            <div class="hist-col-stats">
              <div class="hist-score">${item.totalEarnedScore} <small>/ ${item.totalPossibleScore}</small></div>
              <div class="hist-sub">正確率 ${Math.round(item.accuracyRate * 100)}% | 耗時 ${ExamTimer.formatTime(item.timeSpentSeconds)}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    const html = `
      <div class="modal-backdrop" id="history-modal-backdrop">
        <div class="history-modal-card">
          <header class="modal-card-header">
            <h3><i class="icon-history"></i> 歷史模擬測驗紀錄</h3>
            <button class="btn-icon-close" id="btn-close-history">&times;</button>
          </header>
          <div class="history-list-container">
            ${listHtml}
          </div>
          <footer class="modal-card-footer">
            ${historyList.length > 0 ? `<button class="btn btn-danger-outline" id="btn-clear-history">清除所有紀錄</button>` : ''}
            <button class="btn btn-secondary" id="btn-close-history-bottom">關閉</button>
          </footer>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const closeHandler = () => this.hideModal();
    document.getElementById('btn-close-history')?.addEventListener('click', closeHandler);
    document.getElementById('btn-close-history-bottom')?.addEventListener('click', closeHandler);

    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
      if (confirm('確定要清除所有歷史測驗紀錄嗎？此動作無法復原。')) {
        if (onClearHistory) onClearHistory();
        this.hideModal();
      }
    });
  }
}
