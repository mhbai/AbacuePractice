/**
 * @file grader.js
 * @description 線上自動批改與成績評定演算法
 * 特色：
 * 1. 容錯字元標準化（自動剔除空格、$符號、千分位逗號等）。
 * 2. 智慧數值等價比對（如 1234.50 與 1234.5 及 1,234.5 視為完全正確）。
 * 3. 珠算段位與各級檢定合格標準自動判定。
 * 4. 錯題解析與作答數據統計。
 */

/**
 * 標準化使用者輸入字串
 * @param {string|number} input
 * @returns {{ valid: boolean, numVal: number|null, cleanStr: string }}
 */
export function normalizeUserAnswer(input) {
  if (input === undefined || input === null) {
    return { valid: false, numVal: null, cleanStr: '' };
  }

  let str = String(input).trim();
  if (str === '') {
    return { valid: false, numVal: null, cleanStr: '' };
  }

  // 移除 $ / ￥ / NT$ 貨幣符號
  str = str.replace(/[$￥NTnt]/g, '');

  // 移除所有千分位逗號與多餘空白
  str = str.replace(/[,，\s]/g, '');

  // 處理括號負數 (例如 (123) -> -123)
  if (str.startsWith('(') && str.endsWith(')')) {
    str = '-' + str.substring(1, str.length - 1);
  }

  const numVal = parseFloat(str);
  const valid = !isNaN(numVal) && isFinite(numVal);

  return {
    valid,
    numVal: valid ? numVal : null,
    cleanStr: str
  };
}

/**
 * 比對使用者答案與標準答案是否等價
 * @param {string|number} userInput
 * @param {number} standardAnswer
 * @param {number} [toleranceDecimals=5]
 * @returns {boolean}
 */
export function compareAnswer(userInput, standardAnswer, toleranceDecimals = 5) {
  const norm = normalizeUserAnswer(userInput);
  if (!norm.valid || norm.numVal === null) {
    return false;
  }

  // 浮點精度比對：誤差小於 10^(-decimals - 1)
  const epsilon = Math.pow(10, -(toleranceDecimals + 1));
  const diff = Math.abs(norm.numVal - standardAnswer);

  return diff <= epsilon;
}

/**
 * 單題即時批改 (支援即填即審)
 * @param {object} question - 題目物件
 * @param {string|number} userAnswer - 使用者輸入答案
 * @returns {{ isAnswered: boolean, isCorrect: boolean, userRaw: string, standardAnswer: number, answerFormatted: string, pointsEarned: number }}
 */
export function gradeSingleQuestion(question, userAnswer) {
  if (!question) {
    return { isAnswered: false, isCorrect: false, userRaw: '', standardAnswer: 0, answerFormatted: '', pointsEarned: 0 };
  }
  const norm = normalizeUserAnswer(userAnswer);
  const isAnswered = norm.valid || String(userAnswer || '').trim() !== '';
  const tolerance = question.decimalPlaces !== undefined ? question.decimalPlaces : (question.roundingDecimals || 5);
  const isCorrect = isAnswered ? compareAnswer(userAnswer, question.standardAnswer, tolerance) : false;

  return {
    isAnswered,
    isCorrect,
    userRaw: String(userAnswer || ''),
    standardAnswer: question.standardAnswer,
    answerFormatted: question.answerFormatted || String(question.standardAnswer),
    pointsEarned: isCorrect ? (question.points || 10) : 0
  };
}

/**
 * 判定段位等級
 * @param {number} totalScore
 * @param {Array<{score: number, rank: string}>} danRankScale
 * @returns {{ passed: boolean, rank: string, nextRankScore: number|null }}
 */
export function evaluateDanRank(totalScore, danRankScale) {
  if (!Array.isArray(danRankScale) || danRankScale.length === 0) {
    return { passed: false, rank: '無段位標準', nextRankScore: null };
  }

  // 排序由低至高
  const sorted = [...danRankScale].sort((a, b) => a.score - b.score);
  let achievedRank = '未達初段';
  let passed = false;
  let nextRankScore = sorted[0].score;

  for (let i = 0; i < sorted.length; i++) {
    if (totalScore >= sorted[i].score) {
      achievedRank = sorted[i].rank;
      passed = true;
      nextRankScore = (i + 1 < sorted.length) ? sorted[i + 1].score : null;
    }
  }

  return {
    passed,
    rank: achievedRank,
    nextRankScore
  };
}

/**
 * 完整試卷自動評分函式
 * @param {object} examPaper - 由 mathEngine.generateExamPaper 產生的試卷物件
 * @param {object} userAnswers - 結構: { [subjectId]: { [questionNo]: "value" } }
 * @param {number} timeSpentSeconds - 實際作答花費秒數
 * @returns {object} 完整評分報告
 */
export function gradeExamPaper(examPaper, userAnswers = {}, timeSpentSeconds = 0) {
  const { examType, levelId, levelName, passCriteria, subjects, totalPossibleScore } = examPaper;

  let overallEarnedScore = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalAttempted = 0;

  const subjectResults = {};

  for (const [subjectType, subjectData] of Object.entries(subjects)) {
    const questions = subjectData.questions || [];
    const userSubjectAns = userAnswers[subjectType] || {};

    let subjectEarnedScore = 0;
    let subjectCorrectCount = 0;
    let subjectAttemptedCount = 0;
    const gradedQuestions = [];

    for (const q of questions) {
      const uAns = userSubjectAns[q.questionNo];
      const isAttempted = uAns !== undefined && uAns !== null && String(uAns).trim() !== '';
      const isCorrect = isAttempted && compareAnswer(uAns, q.standardAnswer, q.roundingDecimals || 2);

      if (isAttempted) {
        subjectAttemptedCount++;
        totalAttempted++;
      }

      const pointsEarned = isCorrect ? q.points : 0;
      if (isCorrect) {
        subjectCorrectCount++;
        totalCorrect++;
      }

      subjectEarnedScore += pointsEarned;

      gradedQuestions.push({
        questionNo: q.questionNo,
        type: q.type,
        expression: q.expression || null,
        rows: q.rows || null,
        standardAnswer: q.standardAnswer,
        answerFormatted: q.answerFormatted,
        userRawAnswer: uAns !== undefined ? uAns : '',
        isAttempted,
        isCorrect,
        pointsPossible: q.points,
        pointsEarned
      });
    }

    overallEarnedScore += subjectEarnedScore;
    totalQuestions += questions.length;

    subjectResults[subjectType] = {
      subjectId: subjectType,
      subjectName: subjectData.subjectName,
      questionCount: questions.length,
      totalPossiblePoints: subjectData.totalPoints,
      earnedPoints: subjectEarnedScore,
      correctCount: subjectCorrectCount,
      attemptedCount: subjectAttemptedCount,
      accuracyRate: subjectAttemptedCount > 0 ? (subjectCorrectCount / subjectAttemptedCount) : 0,
      completionRate: questions.length > 0 ? (subjectAttemptedCount / questions.length) : 0,
      questions: gradedQuestions
    };
  }

  // 判定合格或段位
  let evaluation = {
    isPassed: false,
    summaryText: '未通過',
    danRank: null,
    nextGoalText: ''
  };

  if (passCriteria && passCriteria.danRankScale) {
    const danEval = evaluateDanRank(overallEarnedScore, passCriteria.danRankScale);
    evaluation.isPassed = danEval.passed;
    evaluation.danRank = danEval.rank;
    evaluation.summaryText = danEval.passed ? `恭喜榮獲【${danEval.rank}】認定！` : `未達初段標準（尚缺 ${danEval.nextRankScore - overallEarnedScore} 分）`;
    if (danEval.nextRankScore) {
      evaluation.nextGoalText = `距離晉升下一段位還差 ${Math.max(0, danEval.nextRankScore - overallEarnedScore)} 分`;
    }
  } else if (passCriteria && passCriteria.minTotalScore !== undefined) {
    const isPassed = overallEarnedScore >= passCriteria.minTotalScore;
    evaluation.isPassed = isPassed;
    evaluation.summaryText = isPassed ? `檢定及格（標準: ${passCriteria.minTotalScore}分）` : `檢定未及格（標準: ${passCriteria.minTotalScore}分，尚缺 ${passCriteria.minTotalScore - overallEarnedScore}分）`;
  }

  return {
    gradedAt: new Date().toISOString(),
    paperId: examPaper.paperId,
    examType,
    levelId,
    levelName,
    timeSpentSeconds,
    totalPossibleScore,
    totalEarnedScore: overallEarnedScore,
    totalQuestions,
    totalCorrect,
    totalAttempted,
    overallAccuracyRate: totalAttempted > 0 ? (totalCorrect / totalAttempted) : 0,
    overallCompletionRate: totalQuestions > 0 ? (totalAttempted / totalQuestions) : 0,
    evaluation,
    subjects: subjectResults
  };
}
