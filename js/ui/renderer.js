/**
 * @file renderer.js
 * @description 試卷與題型 DOM 渲染器 (支援標準直式縱列加減算、橫式乘除算、自動批改結果標記)
 */

import { SUBJECT_TYPES } from '../config/quizConfig.js';

export class ExamRenderer {
  constructor(containerEl) {
    this.container = containerEl;
  }

  /**
   * 渲染完整測驗試卷
   * @param {object} examPaper
   * @param {object} userAnswers
   * @param {string} activeSubjectId - 科目 ID 或 'ALL'
   * @param {object} [gradedResult=null] - 若已交卷批改，傳入評分結果以標記對錯
   */
  renderPaper(examPaper, userAnswers = {}, activeSubjectId = null, gradedResult = null) {
    if (!examPaper) {
      this.container.innerHTML = `<div class="empty-state">請選擇測驗項目並點擊「開始測驗」</div>`;
      return;
    }

    const { examType, levelName, timeLimitSeconds, subjects } = examPaper;
    const isGraded = !!gradedResult;
    const isInstant = !!(gradedResult && gradedResult.isInstant);

    const isMental = examType === 'MENTAL';
    const mainTitle = isMental ? '心 算 測 試' : '珠 算 測 試';
    const mainSubtitle = isMental ? 'MENTAL CALCULATION EXAMINATION' : 'ABACUS CALCULATION EXAMINATION';

    let html = `
      <div class="exam-sheet ${isGraded && !isInstant ? 'is-graded-sheet' : ''}">
        <!-- 試卷標頭 -->
        <header class="exam-sheet-header">
          <div class="exam-header-main">
            <h1 class="exam-org-title">${mainTitle}</h1>
            <p class="exam-org-subtitle">${mainSubtitle}</p>
            <h2 class="exam-test-title">${levelName} 模擬測驗試題</h2>
            <div class="exam-meta-info">
              <span class="exam-tag"><i class="icon-clock"></i> 限時 ${Math.floor(timeLimitSeconds / 60)} 分鐘</span>
              <span class="exam-tag"><i class="icon-paper"></i> 總題數：${examPaper.totalQuestionsCount} 題</span>
              <span class="exam-tag"><i class="icon-trophy"></i> 滿分：${examPaper.totalPossibleScore} 分</span>
            </div>
          </div>
          <div class="exam-stamp-box">
            <table class="stamp-table">
              <thead>
                <tr><th colspan="2">得 分</th></tr>
                <tr><th>初審</th><th>複審</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td class="stamp-score">${isGraded && !isInstant ? gradedResult.totalEarnedScore : '&nbsp;'}</td>
                  <td class="stamp-score">${isGraded && !isInstant ? gradedResult.totalEarnedScore : '&nbsp;'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </header>

        <!-- 試卷科目切換頁籤 -->
        <nav class="subject-tabs-nav" role="tablist">
          <button class="subj-tab-btn ${activeSubjectId === 'ALL' || !activeSubjectId ? 'active' : ''}" data-subject-tab="ALL">
            <i class="icon-all"></i> 整卷全覽
          </button>
    `;

    for (const [sId, sData] of Object.entries(subjects)) {
      const isCurrentActive = activeSubjectId === sId;
      const count = sData.questionCount;
      const answeredCount = Object.keys(userAnswers[sId] || {}).filter(k => String(userAnswers[sId][k]).trim() !== '').length;

      let scoreBadge = '';
      if (isGraded && !isInstant && gradedResult.subjects[sId]) {
        scoreBadge = `<span class="tab-score-badge">${gradedResult.subjects[sId].earnedPoints}/${sData.totalPoints}分</span>`;
      } else {
        scoreBadge = `<span class="tab-progress-badge">${answeredCount}/${count}</span>`;
      }

      html += `
        <button class="subj-tab-btn ${isCurrentActive ? 'active' : ''}" data-subject-tab="${sId}">
          ${sData.subjectName} (${sData.totalPoints}分) ${scoreBadge}
        </button>
      `;
    }

    html += `</nav><div class="exam-sheet-body">`;

    // 渲染各科目內容
    for (const [sId, sData] of Object.entries(subjects)) {
      const isVisible = (activeSubjectId === 'ALL' || !activeSubjectId) || (activeSubjectId === sId);
      if (!isVisible) continue;

      const gradedSubject = isGraded && gradedResult.subjects[sId] ? { ...gradedResult.subjects[sId], isInstant } : null;

      html += `
        <section class="subject-section" id="subject-section-${sId}">
          <div class="subject-header">
            <h3 class="subject-title">${sData.subjectName}</h3>
            <div class="subject-rules-hint">
              <span>每題 ${sData.pointsPerQuestion} 分，共 ${sData.questionCount} 題（滿分 ${sData.totalPoints} 分）</span>
              ${sId === SUBJECT_TYPES.ADD_SUB ? '<span class="note-badge">【注意】每步累計總和 > 0</span>' : ''}
              ${examPaper.examType === 'ABACUS' ? '<span class="note-badge">【注意】名數求至分位，無名數依級別四捨五入</span>' : ''}
            </div>
          </div>
      `;

      if (sId === SUBJECT_TYPES.ADD_SUB) {
        html += this.renderAddSubSection(sData, userAnswers[sId] || {}, gradedSubject);
      } else if (sId === SUBJECT_TYPES.CROSS_ADD_SUB) {
        html += this.renderCrossAddSubSection(sData, userAnswers[sId] || {}, gradedSubject);
      } else if (sId === SUBJECT_TYPES.MULTIPLICATION || sId === SUBJECT_TYPES.DIVISION) {
        html += this.renderArithmeticSection(sId, sData, userAnswers[sId] || {}, gradedSubject);
      }

      html += `</section>`;
    }

    html += `</div></div>`;

    this.container.innerHTML = html;
  }

  /**
   * 渲染加減算直式縱列排版 (標準每 5 題一組)
   */
  renderAddSubSection(subjectData, userAnsMap, gradedSubject) {
    const questions = subjectData.questions || [];
    if (questions.length === 0) return '';

    const maxRows = Math.max(...questions.map(q => (q.rows ? q.rows.length : 10)));
    const groupSize = 5;
    let html = `<div class="addsub-container">`;

    for (let g = 0; g < questions.length; g += groupSize) {
      const groupQuestions = questions.slice(g, g + groupSize);

      html += `
        <div class="addsub-group-card">
          <table class="addsub-table">
            <thead>
              <tr class="header-qno-row">
                <th class="col-header-label">NO.</th>
                ${groupQuestions.map(q => `<th class="col-qno">${q.questionNo}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
      `;

      // 縱列每一列數字
      for (let r = 0; r < maxRows; r++) {
        html += `
          <tr class="row-num-data">
            <td class="row-index">${r + 1}</td>
            ${groupQuestions.map(q => {
              const rowItem = q.rows && q.rows[r];
              if (!rowItem) return `<td class="num-cell empty-cell">-</td>`;
              const isNeg = rowItem.isNegative;
              return `<td class="num-cell ${isNeg ? 'is-negative' : ''}">${rowItem.display}</td>`;
            }).join('')}
          </tr>
        `;
      }

      // 答題輸入列
      html += `
        <tr class="row-answer-input">
          <td class="row-ans-label">答</td>
          ${groupQuestions.map(q => {
            const userVal = userAnsMap[q.questionNo] || '';
            const gradedQ = gradedSubject ? gradedSubject.questions.find(item => item.questionNo === q.questionNo) : null;
            const statusClass = gradedQ ? (gradedQ.isCorrect ? 'ans-correct' : 'ans-incorrect') : '';

            return `
              <td class="ans-cell ${statusClass}">
                <div class="input-wrapper">
                  ${q.hasCurrency ? '<span class="currency-sign">$</span>' : ''}
                  <input
                    type="text"
                    inputmode="decimal"
                    class="quiz-answer-input"
                    data-subject="${subjectData.subjectId}"
                    data-qno="${q.questionNo}"
                    data-grid-cols="${groupQuestions.length}"
                    value="${userVal}"
                    placeholder="輸入"
                    autocomplete="off"
                    ${gradedSubject && !gradedSubject.isInstant ? 'readonly' : ''}
                  />
                  ${gradedQ ? `
                    <div class="grade-indicator ${gradedQ.isCorrect ? 'indicator-correct' : 'indicator-wrong'}">
                      ${gradedQ.isCorrect ? '✓' : `✗ <span class="standard-ans">${q.answerFormatted}</span>`}
                    </div>
                  ` : ''}
                </div>
              </td>
            `;
          }).join('')}
        </tr>
        <tr class="row-stamp-row">
          <td class="row-stamp-label">初審</td>
          ${groupQuestions.map(q => `<td class="stamp-cell"></td>`).join('')}
        </tr>
        <tr class="row-stamp-row">
          <td class="row-stamp-label">複審</td>
          ${groupQuestions.map(q => `<td class="stamp-cell"></td>`).join('')}
        </tr>
      `;

      html += `</tbody></table></div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * 渲染乘算與除算題目表格 (自適應雙欄或四欄)
   */
  renderArithmeticSection(subjectId, subjectData, userAnsMap, gradedSubject) {
    const questions = subjectData.questions || [];
    const colCount = questions.length >= 30 ? 2 : 2; // 雙大欄排版
    const midPoint = Math.ceil(questions.length / colCount);

    let html = `<div class="arithmetic-grid cols-${colCount}">`;

    for (let c = 0; c < colCount; c++) {
      const sliceQuestions = questions.slice(c * midPoint, (c + 1) * midPoint);
      if (sliceQuestions.length === 0) continue;

      html += `
        <div class="arithmetic-column-card">
          <table class="arithmetic-table">
            <thead>
              <tr>
                <th class="th-no">題號</th>
                <th class="th-expr">算式題目</th>
                <th class="th-ans">作答欄</th>
                <th class="th-audit">初審</th>
                <th class="th-audit">複審</th>
              </tr>
            </thead>
            <tbody>
      `;

      for (const q of sliceQuestions) {
        const userVal = userAnsMap[q.questionNo] || '';
        const gradedQ = gradedSubject ? gradedSubject.questions.find(item => item.questionNo === q.questionNo) : null;
        const statusClass = gradedQ ? (gradedQ.isCorrect ? 'ans-correct' : 'ans-incorrect') : '';

        html += `
          <tr class="arithmetic-row ${statusClass}">
            <td class="td-no">${q.questionNo}</td>
            <td class="td-expr"><span class="math-expr">${q.expression} =</span></td>
            <td class="td-ans">
              <div class="input-wrapper">
                ${q.isCurrency ? '<span class="currency-sign">$</span>' : ''}
                <input
                  type="text"
                  inputmode="decimal"
                  class="quiz-answer-input"
                  data-subject="${subjectId}"
                  data-qno="${q.questionNo}"
                  value="${userVal}"
                  placeholder="輸入答案"
                  autocomplete="off"
                  ${gradedSubject && !gradedSubject.isInstant ? 'readonly' : ''}
                />
                ${gradedQ ? `
                  <div class="grade-indicator ${gradedQ.isCorrect ? 'indicator-correct' : 'indicator-wrong'}">
                    ${gradedQ.isCorrect ? '✓' : `✗ <span class="standard-ans">${q.answerFormatted}</span>`}
                  </div>
                ` : ''}
              </div>
            </td>
            <td class="td-audit"></td>
            <td class="td-audit"></td>
          </tr>
        `;
      }

      html += `</tbody></table></div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * 渲染縱橫列計算表格 (4 縱列 × 5 橫列 = 9 題)
   */
  renderCrossAddSubSection(subjectData, userAnsMap, gradedSubject) {
    const matrix = subjectData.matrix || [];
    const rows = subjectData.rows || (matrix.length || 5);
    const cols = subjectData.cols || (matrix[0] ? matrix[0].length : 4);
    const questions = subjectData.questions || [];

    const colLabels = ['一', '二', '三', '四', '五'];

    let html = `
      <div class="cross-table-wrapper">
        <table class="cross-addsub-table">
          <thead>
            <tr>
              <th class="th-cross-no">No</th>
              ${Array.from({ length: cols }).map((_, c) => `<th class="th-cross-col">${colLabels[c] || c + 1}</th>`).join('')}
              <th class="th-cross-sum">橫列合計</th>
            </tr>
          </thead>
          <tbody>
    `;

    // 渲染各橫列數字與右側橫列合計輸入框
    for (let r = 0; r < rows; r++) {
      // 橫列合計題目編號: cols + r + 1
      const qNoRow = cols + r + 1;
      const qRow = questions.find(q => q.questionNo === qNoRow);
      const userValRow = userAnsMap[qNoRow] || '';
      const gradedQRow = gradedSubject ? gradedSubject.questions.find(item => item.questionNo === qNoRow) : null;
      const statusClassRow = gradedQRow ? (gradedQRow.isCorrect ? 'ans-correct' : 'ans-incorrect') : '';

      html += `
        <tr class="cross-data-row">
          <td class="td-cross-index">${r + 1}</td>
          ${Array.from({ length: cols }).map((_, c) => {
            const cell = matrix[r] && matrix[r][c];
            if (!cell) return `<td class="td-cross-cell">-</td>`;
            return `<td class="td-cross-cell ${cell.isNegative ? 'is-negative' : ''}">${cell.display}</td>`;
          }).join('')}
          <td class="td-cross-ans ${statusClassRow}">
            <div class="input-wrapper">
              <input
                type="text"
                inputmode="decimal"
                class="quiz-answer-input"
                data-subject="${subjectData.subjectId}"
                data-qno="${qNoRow}"
                data-grid-cols="${cols + 1}"
                value="${userValRow}"
                placeholder="橫計"
                autocomplete="off"
                ${gradedSubject && !gradedSubject.isInstant ? 'readonly' : ''}
              />
              ${gradedQRow ? `
                <div class="grade-indicator ${gradedQRow.isCorrect ? 'indicator-correct' : 'indicator-wrong'}">
                  ${gradedQRow.isCorrect ? '✓' : `✗ <span class="standard-ans">${qRow ? qRow.answerFormatted : ''}</span>`}
                </div>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }

    // 渲染底部縱列合計列
    html += `
      <tr class="cross-col-sum-row">
        <td class="td-cross-label">縱列<br>合計</td>
        ${Array.from({ length: cols }).map((_, c) => {
          const qNoCol = c + 1;
          const qCol = questions.find(q => q.questionNo === qNoCol);
          const userValCol = userAnsMap[qNoCol] || '';
          const gradedQCol = gradedSubject ? gradedSubject.questions.find(item => item.questionNo === qNoCol) : null;
          const statusClassCol = gradedQCol ? (gradedQCol.isCorrect ? 'ans-correct' : 'ans-incorrect') : '';

          return `
            <td class="td-cross-ans ${statusClassCol}">
              <div class="input-wrapper">
                <input
                  type="text"
                  inputmode="decimal"
                  class="quiz-answer-input"
                  data-subject="${subjectData.subjectId}"
                  data-qno="${qNoCol}"
                  data-grid-cols="${cols}"
                  value="${userValCol}"
                  placeholder="縱計"
                  autocomplete="off"
                  ${gradedSubject && !gradedSubject.isInstant ? 'readonly' : ''}
                />
                ${gradedQCol ? `
                  <div class="grade-indicator ${gradedQCol.isCorrect ? 'indicator-correct' : 'indicator-wrong'}">
                    ${gradedQCol.isCorrect ? '✓' : `✗ <span class="standard-ans">${qCol ? qCol.answerFormatted : ''}</span>`}
                  </div>
                ` : ''}
              </div>
            </td>
          `;
        }).join('')}
        <td class="td-cross-blank"></td>
      </tr>
    `;

    html += `</tbody></table></div>`;
    return html;
  }
}
