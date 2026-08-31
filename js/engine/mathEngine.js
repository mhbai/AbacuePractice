/**
 * @file mathEngine.js
 * @description 珠算與心算出題演算法核心引擎
 * 核心特性：
 * 1. 加減算：隨機產生每筆數字（可含減法），確保「累計總和在每一步驟都大於 0」（非負約束）。
 * 2. 逆向生成除法：先決定商數與除數相乘得被除數，100% 保證整除。
 * 3. 珠算小數與四捨五入：支援名數($)求至分位(2位)，無名數依級別精準四捨五入。
 * 4. 浮點數防誤差精度計算。
 */

import { SUBJECT_TYPES, ROUNDING_RULES, getLevelConfig } from '../config/quizConfig.js';

/**
 * 產生指定位數的隨機整數
 * @param {number} digits - 位數 (如 2 代表 10~99, 1 代表 1~9)
 * @param {number} [minVal] - 自訂最小值
 * @param {number} [maxVal] - 自訂最大值
 * @returns {number}
 */
export function getRandomIntWithDigits(digits, minVal = null, maxVal = null) {
  if (digits <= 0) digits = 1;
  const min = minVal !== null ? minVal : Math.pow(10, digits - 1);
  const max = maxVal !== null ? maxVal : Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 產生範圍內的隨機整數 [min, max]
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 隨機挑選陣列元素
 * @param {Array} arr
 * @returns {*}
 */
export function getRandomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 四捨五入數值至指定小數位數 (精確處理浮點數)
 * @param {number} num
 * @param {number} decimals
 * @returns {number}
 */
export function roundToDecimals(num, decimals) {
  const factor = Math.pow(10, decimals);
  // 使用 Number.EPSILON 避免 1.005 * 100 浮點誤差
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * 格式化數值輸出 (含千分位與固定小數位)
 * @param {number} val
 * @param {object} options
 * @param {boolean} [options.hasCurrency=false]
 * @param {number} [options.decimalPlaces=0]
 * @param {boolean} [options.showNegativeSign=true]
 * @returns {string}
 */
export function formatNumber(val, options = {}) {
  const { hasCurrency = false, decimalPlaces = 0, showNegativeSign = true } = options;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let formatted = '';
  if (decimalPlaces > 0) {
    const parts = absVal.toFixed(decimalPlaces).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = `${intPart}.${parts[1]}`;
  } else {
    formatted = Math.round(absVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let prefix = '';
  if (isNegative && showNegativeSign) {
    prefix = '-';
  }
  if (hasCurrency) {
    prefix += '$';
  }

  return `${prefix}${formatted}`;
}

/**
 * 加減算題目生成器 (支援非負累計約束)
 * @param {object} spec
 * @param {number} questionNo
 * @returns {object}
 */
export function generateAddSubQuestion(spec, questionNo) {
  const {
    rows = 10,
    hasDecimals = false,
    decimalPlaces = 2,
    hasCurrency = false,
    subtractionRatio = 0.3,
    digitDistribution = [{ minDigits: 2, maxDigits: 3, weight: 1.0 }]
  } = spec;

  const numbers = [];
  let runningSum = 0;

  for (let r = 0; r < rows; r++) {
    // 依權重決定本筆位數
    const dist = getRandomChoice(digitDistribution);
    const digits = getRandomInt(dist.minDigits, dist.maxDigits);
    const minVal = dist.minVal || null;
    const maxVal = dist.maxVal || null;

    let baseVal = getRandomIntWithDigits(digits, minVal, maxVal);

    if (hasDecimals) {
      // 產生帶小數的數字 (例如小數點後 2 位)
      // 若 digits = 3，如 24.50 或 2.48
      const decimalFactor = Math.pow(10, decimalPlaces);
      baseVal = baseVal / decimalFactor;
      // 確保不是純 0
      if (baseVal === 0) baseVal = 1 / decimalFactor;
    }

    // 決定是否為減法 (第 1 筆永遠為正數)
    const canSubtract = r > 0 && subtractionRatio > 0 && Math.random() < subtractionRatio;

    if (canSubtract) {
      // 非負約束：減數必須嚴格小於當前累計總和 (runningSum - baseVal > 0)
      if (baseVal >= runningSum) {
        // 若減數過大，調整減數為 runningSum 的 20%~80%
        if (hasDecimals) {
          const maxAllowed = roundToDecimals(runningSum * (0.3 + Math.random() * 0.5), decimalPlaces);
          baseVal = Math.max(0.01, maxAllowed);
        } else {
          const maxAllowed = Math.floor(runningSum * (0.3 + Math.random() * 0.5));
          baseVal = Math.max(1, maxAllowed);
        }
      }

      // 雙重保證：累計必大於 0
      if (runningSum - baseVal <= 0) {
        // 若依然無法相減，轉為加法
        runningSum = roundToDecimals(runningSum + baseVal, decimalPlaces);
        numbers.push({
          rawVal: baseVal,
          isNegative: false,
          display: formatNumber(baseVal, { hasCurrency: r === 0 && hasCurrency, decimalPlaces: hasDecimals ? decimalPlaces : 0 })
        });
      } else {
        runningSum = roundToDecimals(runningSum - baseVal, decimalPlaces);
        numbers.push({
          rawVal: -baseVal,
          isNegative: true,
          display: formatNumber(-baseVal, { hasCurrency: false, decimalPlaces: hasDecimals ? decimalPlaces : 0 })
        });
      }
    } else {
      // 加法
      runningSum = roundToDecimals(runningSum + baseVal, decimalPlaces);
      numbers.push({
        rawVal: baseVal,
        isNegative: false,
        display: formatNumber(baseVal, { hasCurrency: r === 0 && hasCurrency, decimalPlaces: hasDecimals ? decimalPlaces : 0 })
      });
    }
  }

  // 計算標準答案
  const finalAnswer = runningSum;
  const answerFormatted = formatNumber(finalAnswer, { hasCurrency, decimalPlaces: hasDecimals ? decimalPlaces : 0 });

  return {
    id: `addsub_${questionNo}`,
    questionNo,
    type: SUBJECT_TYPES.ADD_SUB,
    rows: numbers,
    hasCurrency,
    hasDecimals,
    decimalPlaces: hasDecimals ? decimalPlaces : 0,
    standardAnswer: finalAnswer,
    answerFormatted,
    spec
  };
}

/**
 * 乘算題目生成器
 * @param {object} spec
 * @param {number} questionNo
 * @param {number} totalQuestions
 * @returns {object}
 */
export function generateMultiplicationQuestion(spec, questionNo, totalQuestions) {
  const { roundingRule, patterns = [] } = spec;

  let pattern;
  if (patterns.length === 1) {
    pattern = patterns[0];
  } else {
    // 依據題目編號分配 pattern
    let cumulative = 0;
    for (const p of patterns) {
      cumulative += p.count || 1;
      if (questionNo <= cumulative) {
        pattern = p;
        break;
      }
    }
    if (!pattern) pattern = patterns[patterns.length - 1];
  }

  const multiplicandDigits = pattern.multiplicandDigits || getRandomInt(pattern.minDigitsA || 2, pattern.maxDigitsA || 3);
  const multiplierDigits = pattern.multiplierDigits || getRandomInt(pattern.minDigitsB || 2, pattern.maxDigitsB || 2);
  const isCurrency = !!pattern.isCurrency;
  const hasDecimals = !!pattern.hasDecimals;

  let multiplicand = getRandomIntWithDigits(multiplicandDigits);
  let multiplier = getRandomIntWithDigits(multiplierDigits);

  let decA = 0;
  let decB = 0;

  if (hasDecimals) {
    // 珠算小數乘算 (如 480.96 × 52,937 或 0.2537 × 4,196,380)
    if (Math.random() < 0.5) {
      decA = getRandomInt(1, Math.min(4, multiplicandDigits));
      multiplicand = multiplicand / Math.pow(10, decA);
    } else {
      decB = getRandomInt(1, Math.min(4, multiplierDigits));
      multiplier = multiplier / Math.pow(10, decB);
    }
  }

  // 精確計算乘積
  const rawProduct = multiplicand * multiplier;

  // 決定答案四捨五入目標
  let roundingDecimals = 0;
  let targetRoundingRule = roundingRule || (isCurrency ? spec.currencyRounding : spec.nonCurrencyRounding);

  if (targetRoundingRule === ROUNDING_RULES.CURRENCY_CENTS || isCurrency) {
    roundingDecimals = 2;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_5) {
    roundingDecimals = 5;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_4) {
    roundingDecimals = 4;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_3) {
    roundingDecimals = 3;
  } else {
    roundingDecimals = 0;
  }

  const standardAnswer = roundToDecimals(rawProduct, roundingDecimals);

  // 格式化算式表達式
  const strA = formatNumber(multiplicand, { hasCurrency: isCurrency, decimalPlaces: decA });
  const strB = formatNumber(multiplier, { hasCurrency: false, decimalPlaces: decB });
  const expr = `${strA} × ${strB}`;

  return {
    id: `mul_${questionNo}`,
    questionNo,
    type: SUBJECT_TYPES.MULTIPLICATION,
    multiplicand,
    multiplier,
    expression: expr,
    isCurrency,
    roundingDecimals,
    rawProduct,
    standardAnswer,
    answerFormatted: formatNumber(standardAnswer, { hasCurrency: isCurrency, decimalPlaces: roundingDecimals })
  };
}

/**
 * 除算題目生成器 (支援整除逆向生成與珠算小數除法)
 * @param {object} spec
 * @param {number} questionNo
 * @param {number} totalQuestions
 * @returns {object}
 */
export function generateDivisionQuestion(spec, questionNo, totalQuestions) {
  const { roundingRule, patterns = [] } = spec;

  let pattern;
  if (patterns.length === 1) {
    pattern = patterns[0];
  } else {
    let cumulative = 0;
    for (const p of patterns) {
      cumulative += p.count || 1;
      if (questionNo <= cumulative) {
        pattern = p;
        break;
      }
    }
    if (!pattern) pattern = patterns[patterns.length - 1];
  }

  const isCurrency = !!pattern.isCurrency;
  const hasDecimals = !!pattern.hasDecimals;
  const isExactOnly = roundingRule === ROUNDING_RULES.EXACT_ONLY;

  let divisorDigits = Array.isArray(pattern.divisorDigits)
    ? getRandomInt(pattern.divisorDigits[0], pattern.divisorDigits[1])
    : (pattern.divisorDigits || 2);

  let quotientDigits = Array.isArray(pattern.quotientDigits)
    ? getRandomInt(pattern.quotientDigits[0], pattern.quotientDigits[1])
    : (pattern.quotientDigits || 2);

  // -------------------------------------------------------------
  // 逆向生成法 (整除心算與基礎除算)
  // -------------------------------------------------------------
  if (isExactOnly || !hasDecimals) {
    const divisor = getRandomIntWithDigits(divisorDigits);
    const quotient = getRandomIntWithDigits(quotientDigits);
    const dividend = divisor * quotient;

    const strDividend = formatNumber(dividend, { hasCurrency: isCurrency, decimalPlaces: 0 });
    const strDivisor = formatNumber(divisor, { hasCurrency: false, decimalPlaces: 0 });
    const expr = `${strDividend} ÷ ${strDivisor}`;

    return {
      id: `div_${questionNo}`,
      questionNo,
      type: SUBJECT_TYPES.DIVISION,
      dividend,
      divisor,
      expression: expr,
      isCurrency,
      roundingDecimals: 0,
      standardAnswer: quotient,
      answerFormatted: formatNumber(quotient, { hasCurrency: isCurrency, decimalPlaces: 0 })
    };
  }

  // -------------------------------------------------------------
  // 珠算小數與四捨五入除算
  // -------------------------------------------------------------
  let targetRoundingRule = roundingRule || (isCurrency ? spec.currencyRounding : spec.nonCurrencyRounding);
  let roundingDecimals = 0;

  if (targetRoundingRule === ROUNDING_RULES.CURRENCY_CENTS || isCurrency) {
    roundingDecimals = 2;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_5) {
    roundingDecimals = 5;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_4) {
    roundingDecimals = 4;
  } else if (targetRoundingRule === ROUNDING_RULES.DECIMAL_3) {
    roundingDecimals = 3;
  }

  // 生成適當位數與小數點之被除數與除數
  let divisor = getRandomIntWithDigits(divisorDigits);
  let quotient = getRandomIntWithDigits(quotientDigits);

  // 引入隨機小數點
  let decDivisor = Math.random() < 0.6 ? getRandomInt(1, Math.min(3, divisorDigits)) : 0;
  let decQuotient = Math.random() < 0.6 ? getRandomInt(1, Math.min(3, quotientDigits)) : 0;

  if (decDivisor > 0) divisor = divisor / Math.pow(10, decDivisor);
  if (decQuotient > 0) quotient = quotient / Math.pow(10, decQuotient);

  // 增加少許餘數擾動，測試四捨五入
  const rawDividend = roundToDecimals(divisor * quotient + (Math.random() < 0.7 ? (Math.random() * 0.09) : 0), 4);
  const rawQuotient = rawDividend / divisor;
  const standardAnswer = roundToDecimals(rawQuotient, roundingDecimals);

  const strDividend = formatNumber(rawDividend, { hasCurrency: isCurrency, decimalPlaces: decDivisor > 0 || String(rawDividend).includes('.') ? (String(rawDividend).split('.')[1] || '').length : 0 });
  const strDivisor = formatNumber(divisor, { hasCurrency: false, decimalPlaces: decDivisor });
  const expr = `${strDividend} ÷ ${strDivisor}`;

  return {
    id: `div_${questionNo}`,
    questionNo,
    type: SUBJECT_TYPES.DIVISION,
    dividend: rawDividend,
    divisor,
    expression: expr,
    isCurrency,
    roundingDecimals,
    standardAnswer,
    answerFormatted: formatNumber(standardAnswer, { hasCurrency: isCurrency, decimalPlaces: roundingDecimals })
  };
}

/**
 * 產生完整測驗試卷 (Full Exam Paper Generator)
 * @param {string} examType - 'MENTAL' | 'ABACUS'
 * @param {string} levelId - 'degree' | 'class_1' ...
 * @returns {object}
 */
export function generateExamPaper(examType, levelId) {
  const levelConfig = getLevelConfig(examType, levelId);
  if (!levelConfig) {
    throw new Error(`Invalid exam type or level: ${examType} / ${levelId}`);
  }

  const paperId = `paper_${examType}_${levelId}_${Date.now()}`;
  const subjectsData = {};

  let totalQuestionsCount = 0;
  let totalPossibleScore = 0;

  for (const [subjectType, subjectConfig] of Object.entries(levelConfig.subjects)) {
    const questions = [];
    const count = subjectConfig.questionCount;

    for (let i = 1; i <= count; i++) {
      let q;
      switch (subjectType) {
        case SUBJECT_TYPES.ADD_SUB:
          q = generateAddSubQuestion(subjectConfig.spec, i);
          break;
        case SUBJECT_TYPES.MULTIPLICATION:
          q = generateMultiplicationQuestion(subjectConfig.spec, i, count);
          break;
        case SUBJECT_TYPES.DIVISION:
          q = generateDivisionQuestion(subjectConfig.spec, i, count);
          break;
        default:
          throw new Error(`Unknown subject type: ${subjectType}`);
      }
      q.points = subjectConfig.pointsPerQuestion;
      questions.push(q);
    }

    subjectsData[subjectType] = {
      subjectId: subjectType,
      subjectName: subjectConfig.subjectName,
      questionCount: count,
      pointsPerQuestion: subjectConfig.pointsPerQuestion,
      totalPoints: subjectConfig.totalPoints,
      questions
    };

    totalQuestionsCount += count;
    totalPossibleScore += subjectConfig.totalPoints;
  }

  return {
    paperId,
    examType,
    levelId,
    levelName: levelConfig.levelName,
    timeLimitSeconds: levelConfig.timeLimitSeconds,
    passCriteria: levelConfig.passCriteria,
    totalQuestionsCount,
    totalPossibleScore,
    createdAt: new Date().toISOString(),
    subjects: subjectsData
  };
}
