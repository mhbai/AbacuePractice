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
 * 取得直覺運珠 (無十進位、無五湊進) 之加法可用候選數字列表 (1 ~ 9)
 * @param {number} currentSum - 當前累計總和 (0 ~ 9)
 * @returns {number[]}
 */
export function getValidDirectAddCandidates(currentSum) {
  const curL = currentSum % 5;
  const curU = Math.floor(currentSum / 5);
  const maxAddL = 4 - curL;
  const maxAddU = 1 - curU;

  const candidates = [];
  for (let u = 0; u <= maxAddU; u++) {
    for (let l = 0; l <= maxAddL; l++) {
      const d = u * 5 + l;
      if (d >= 1 && d <= 9 && (currentSum + d) <= 9) {
        candidates.push(d);
      }
    }
  }
  return candidates;
}

/**
 * 取得直覺運珠 (無十退位、無五借退) 之減法可用候選數字列表 (1 ~ 9)
 * @param {number} currentSum - 當前累計總和 (1 ~ 9)
 * @returns {number[]}
 */
export function getValidDirectSubCandidates(currentSum) {
  const curL = currentSum % 5;
  const curU = Math.floor(currentSum / 5);

  const candidates = [];
  for (let u = 0; u <= curU; u++) {
    for (let l = 0; l <= curL; l++) {
      const d = u * 5 + l;
      if (d >= 1 && (currentSum - d) >= 1) {
        candidates.push(d);
      }
    }
  }
  return candidates;
}

/**
 * 直覺運珠題目生成器 (100% 保證直加直減，無十進位、無五湊進、無退位)
 * @param {object} spec
 * @param {number} questionNo
 * @returns {object}
 */
export function generateDirectBeadsQuestion(spec, questionNo) {
  const { rows = 3, subtractionRatio = 0.0, hasCurrency = false } = spec;

  for (let attempt = 0; attempt < 200; attempt++) {
    const numbers = [];
    let runningSum = 0;
    let success = true;

    for (let r = 0; r < rows; r++) {
      const isFirst = r === 0;
      const wantSubtract = !isFirst && subtractionRatio > 0 && Math.random() < subtractionRatio;

      if (wantSubtract && runningSum >= 2) {
        const subCandidates = getValidDirectSubCandidates(runningSum);
        if (subCandidates.length > 0) {
          const baseVal = getRandomChoice(subCandidates);
          runningSum -= baseVal;
          numbers.push({
            rawVal: -baseVal,
            isNegative: true,
            display: formatNumber(-baseVal, { hasCurrency: false, decimalPlaces: 0 })
          });
          continue;
        }
      }

      // 進行直加
      const addCandidates = getValidDirectAddCandidates(runningSum);
      if (addCandidates.length === 0) {
        success = false;
        break;
      }

      const remainingRows = rows - 1 - r;
      let filtered = addCandidates;
      if (remainingRows > 0) {
        const safe = addCandidates.filter(d => {
          const nextSum = runningSum + d;
          const nextL = nextSum % 5;
          const nextU = Math.floor(nextSum / 5);
          return (4 - nextL) + (1 - nextU) >= 1;
        });
        if (safe.length > 0) filtered = safe;
      }

      const baseVal = getRandomChoice(filtered);
      runningSum += baseVal;
      numbers.push({
        rawVal: baseVal,
        isNegative: false,
        display: formatNumber(baseVal, { hasCurrency: isFirst && hasCurrency, decimalPlaces: 0 })
      });
    }

    if (success && numbers.length === rows) {
      const finalAnswer = runningSum;
      return {
        id: `addsub_${questionNo}`,
        questionNo,
        type: SUBJECT_TYPES.ADD_SUB,
        rows: numbers,
        hasCurrency,
        hasDecimals: false,
        decimalPlaces: 0,
        standardAnswer: finalAnswer,
        answerFormatted: formatNumber(finalAnswer, { hasCurrency, decimalPlaces: 0 }),
        spec
      };
    }
  }

  // Fallback
  return generateAddSubQuestion({ ...spec, directBeadsOnly: false, noCarry: false }, questionNo);
}

/**
 * 加減算題目生成器 (支援非負累計約束)
 * @param {object} spec
 * @param {number} questionNo
 * @returns {object}
 */
/**
 * 十二級專用：10組合不含混合型加6/7/8/9口訣，且第1、2口為無口訣
 */
export function generateClass12MentalQuestion(spec, questionNo) {
  const { hasCurrency = false } = spec;
  const lastAddCandidates = [6, 7, 8, 9];

  for (let attempt = 0; attempt < 200; attempt++) {
    // 1. 生成第 1 口與第 2 口 (純直加無口訣)
    const d1 = getRandomInt(1, 4);
    const d2Candidates = getValidDirectAddCandidates(d1);
    if (d2Candidates.length === 0) continue;
    const d2 = getRandomChoice(d2Candidates);
    const sum2 = d1 + d2; // 2 ~ 9

    // 2. 生成第 3 口 (加 6, 7, 8, 9，且與 sum2 形成純十補數進位)
    const validD3 = lastAddCandidates.filter(d => {
      // 必須進位: sum2 + d >= 10
      if (sum2 + d < 10) return false;
      // 單純10補數 (不含湊五混合型):
      // 加6需減4 (下珠夠減4): (sum2 % 5) >= 4 或 sum2 >= 4
      // 加7需減3 (下珠夠減3): (sum2 % 5) >= 3
      // 加8需減2 (下珠夠減2): (sum2 % 5) >= 2
      // 加9需減1 (下珠夠減1): (sum2 % 5) >= 1
      const complement = 10 - d;
      return (sum2 % 5) >= complement || (sum2 % 10) >= complement;
    });

    if (validD3.length === 0) continue;
    const d3 = getRandomChoice(validD3);
    const finalAnswer = sum2 + d3;

    const numbers = [
      { rawVal: d1, isNegative: false, display: formatNumber(d1, { hasCurrency, decimalPlaces: 0 }) },
      { rawVal: d2, isNegative: false, display: formatNumber(d2, { hasCurrency: false, decimalPlaces: 0 }) },
      { rawVal: d3, isNegative: false, display: formatNumber(d3, { hasCurrency: false, decimalPlaces: 0 }) }
    ];

    return {
      id: `addsub_${questionNo}`,
      questionNo,
      type: SUBJECT_TYPES.ADD_SUB,
      rows: numbers,
      hasCurrency,
      hasDecimals: false,
      decimalPlaces: 0,
      standardAnswer: finalAnswer,
      answerFormatted: formatNumber(finalAnswer, { hasCurrency, decimalPlaces: 0 }),
      spec
    };
  }

  return generateDirectBeadsQuestion(spec, questionNo);
}

/**
 * 十一級專用：5組合及不含混合型之10組合全部口訣
 */
export function generateClass11MentalQuestion(spec, questionNo) {
  const { hasCurrency = false } = spec;

  for (let attempt = 0; attempt < 200; attempt++) {
    const numbers = [];
    let runningSum = 0;
    let hasCombo = false;

    for (let r = 0; r < 3; r++) {
      const d = getRandomInt(1, 9);
      if (r > 0) {
        const curL = runningSum % 5;
        const curU = Math.floor(runningSum / 5);
        const addL = d % 5;
        const addU = Math.floor(d / 5);
        // 檢查是否為湊五 (5組合) 或進位 (10組合)
        if (curL + addL > 4 || runningSum + d >= 10) {
          hasCombo = true;
        }
      }
      runningSum += d;
      numbers.push({
        rawVal: d,
        isNegative: false,
        display: formatNumber(d, { hasCurrency: r === 0 && hasCurrency, decimalPlaces: 0 })
      });
    }

    if (hasCombo) {
      return {
        id: `addsub_${questionNo}`,
        questionNo,
        type: SUBJECT_TYPES.ADD_SUB,
        rows: numbers,
        hasCurrency,
        hasDecimals: false,
        decimalPlaces: 0,
        standardAnswer: runningSum,
        answerFormatted: formatNumber(runningSum, { hasCurrency, decimalPlaces: 0 }),
        spec
      };
    }
  }

  return generateDirectBeadsQuestion(spec, questionNo);
}

/**
 * 加減算題目生成器 (支援非負累計約束)
 * @param {object} spec
 * @param {number} questionNo
 * @returns {object}
 */
export function generateAddSubQuestion(spec, questionNo) {
  if (spec.directBeadsOnly || spec.noCarry) {
    return generateDirectBeadsQuestion(spec, questionNo);
  }

  if (spec.specialCarryMode === '10_COMBINATIONS_NO_MIX_LAST6789') {
    return generateClass12MentalQuestion(spec, questionNo);
  }

  if (spec.specialCarryMode === '5_AND_10_COMBINATIONS') {
    return generateClass11MentalQuestion(spec, questionNo);
  }

  // 支援 rowPatterns (如五級~八級之心算題型分配)
  let effectiveRows = spec.rows || 10;
  let effectiveDistribution = spec.digitDistribution || [{ minDigits: 2, maxDigits: 3, weight: 1.0 }];

  if (spec.rowPatterns && spec.rowPatterns.length > 0) {
    let cumulative = 0;
    for (const p of spec.rowPatterns) {
      cumulative += p.count || 1;
      if (questionNo <= cumulative) {
        if (p.rows) effectiveRows = p.rows;
        if (p.digitDistribution) effectiveDistribution = p.digitDistribution;
        break;
      }
    }
  }

  const {
    hasDecimals = false,
    decimalPlaces = 2,
    hasCurrency = false,
    subtractionRatio = 0.3,
    requireCarry = false,
    minSum = null
  } = spec;

  const maxAttempts = requireCarry ? 150 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const numbers = [];
    let runningSum = 0;
    let hasCarryOccurred = false;

    for (let r = 0; r < effectiveRows; r++) {
      const dist = getRandomChoice(effectiveDistribution);
      const digits = getRandomInt(dist.minDigits, dist.maxDigits);
      const minVal = dist.minVal || null;
      const maxVal = dist.maxVal || null;

      let baseVal = getRandomIntWithDigits(digits, minVal, maxVal);

      if (hasDecimals) {
        const decimalFactor = Math.pow(10, decimalPlaces);
        baseVal = baseVal / decimalFactor;
        if (baseVal === 0) baseVal = 1 / decimalFactor;
      }

      const canSubtract = r > 0 && subtractionRatio > 0 && Math.random() < subtractionRatio;

      if (canSubtract) {
        if (baseVal >= runningSum) {
          if (hasDecimals) {
            const maxAllowed = roundToDecimals(runningSum * (0.3 + Math.random() * 0.5), decimalPlaces);
            baseVal = Math.max(0.01, maxAllowed);
          } else {
            const maxAllowed = Math.floor(runningSum * (0.3 + Math.random() * 0.5));
            baseVal = Math.max(1, maxAllowed);
          }
        }

        if (runningSum - baseVal <= 0) {
          if (r > 0 && ((runningSum % 10) + (baseVal % 10) >= 10 || (runningSum + baseVal) >= 10)) {
            hasCarryOccurred = true;
          }
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
        if (r > 0 && ((runningSum % 10) + (baseVal % 10) >= 10 || (runningSum + baseVal) >= 10)) {
          hasCarryOccurred = true;
        }
        runningSum = roundToDecimals(runningSum + baseVal, decimalPlaces);
        numbers.push({
          rawVal: baseVal,
          isNegative: false,
          display: formatNumber(baseVal, { hasCurrency: r === 0 && hasCurrency, decimalPlaces: hasDecimals ? decimalPlaces : 0 })
        });
      }
    }

    if (requireCarry) {
      if (!hasCarryOccurred && runningSum < 10) {
        continue;
      }
      if (minSum !== null && runningSum < minSum) {
        continue;
      }
    }

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
 * 縱橫列計算題目生成器 (Cross Addition/Subtraction Generator)
 * 產生 5列 × 4行 之矩陣，並計算 4 縱列合計 + 5 橫列合計 (共 9 題)
 * @param {object} spec
 * @returns {object[]} 回傳 9 個題目項目
 */
/**
 * 縱橫列計算題目生成器 (Cross Addition/Subtraction Generator)
 * 產生 5 橫列 × 4 縱列 之矩陣，計算 4 縱列合計 + 5 橫列合計 + 1 橫列總計（全表總和） (共 10 題)
 * @param {object} spec
 * @returns {object} 回傳 matrix, rows, cols, questions
 */
export function generateCrossAddSubQuestions(spec) {
  const {
    rows = 5,
    cols = 4,
    subtractionRatio = 0.25,
    hasCurrency = false,
    directBeadsOnly = false,
    digitDistribution = [{ minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }]
  } = spec;

  const matrix = [];
  for (let r = 0; r < rows; r++) {
    matrix[r] = [];
  }

  for (let c = 0; c < cols; c++) {
    let colRunningSum = 0;
    for (let r = 0; r < rows; r++) {
      const dist = getRandomChoice(digitDistribution);
      const minVal = dist.minVal || (dist.minDigits === 1 ? 1 : Math.pow(10, dist.minDigits - 1));
      const maxVal = dist.maxVal || Math.pow(10, dist.maxDigits) - 1;
      let val = getRandomInt(minVal, maxVal);

      if (directBeadsOnly) {
        val = getRandomInt(1, Math.min(4, maxVal));
      }

      const canSub = r > 0 && subtractionRatio > 0 && Math.random() < subtractionRatio;
      if (canSub && colRunningSum - val > 0) {
        colRunningSum -= val;
        matrix[r][c] = {
          rawVal: -val,
          display: `-${val}`,
          isNegative: true
        };
      } else {
        colRunningSum += val;
        matrix[r][c] = {
          rawVal: val,
          display: formatNumber(val, { hasCurrency: r === 0 && hasCurrency, decimalPlaces: 0 }),
          isNegative: false
        };
      }
    }
  }

  // 4 個縱列合計 (Q1 ~ Q4)
  const colSums = [];
  for (let c = 0; c < cols; c++) {
    let sum = 0;
    for (let r = 0; r < rows; r++) {
      sum += matrix[r][c].rawVal;
    }
    colSums.push(sum);
  }

  // 5 個橫列合計 (Q5 ~ Q9)
  const rowSums = [];
  for (let r = 0; r < rows; r++) {
    let sum = 0;
    for (let c = 0; c < cols; c++) {
      sum += matrix[r][c].rawVal;
    }
    rowSums.push(sum);
  }

  // 橫列總計（全表總和 / 縱列總計之值）(Q10)
  const grandTotal = colSums.reduce((acc, v) => acc + v, 0);

  const questions = [];
  const colLabels = ['一', '二', '三', '四', '五'];

  // Q1 ~ Q4: 縱列合計
  for (let c = 0; c < cols; c++) {
    const qNo = c + 1;
    questions.push({
      id: `cross_col_${c + 1}`,
      questionNo: qNo,
      type: SUBJECT_TYPES.CROSS_ADD_SUB,
      targetType: 'col',
      targetIndex: c,
      label: `縱列【${colLabels[c] || c + 1}】合計`,
      matrix,
      standardAnswer: colSums[c],
      answerFormatted: formatNumber(colSums[c], { hasCurrency, decimalPlaces: 0 })
    });
  }

  // Q5 ~ Q9: 橫列合計
  for (let r = 0; r < rows; r++) {
    const qNo = cols + r + 1;
    questions.push({
      id: `cross_row_${r + 1}`,
      questionNo: qNo,
      type: SUBJECT_TYPES.CROSS_ADD_SUB,
      targetType: 'row',
      targetIndex: r,
      label: `橫列【第 ${r + 1} 行】合計`,
      matrix,
      standardAnswer: rowSums[r],
      answerFormatted: formatNumber(rowSums[r], { hasCurrency, decimalPlaces: 0 })
    });
  }

  // Q10: 橫列總計 (全表總計)
  const qNoTotal = cols + rows + 1; // 4 + 5 + 1 = 10
  questions.push({
    id: `cross_total`,
    questionNo: qNoTotal,
    type: SUBJECT_TYPES.CROSS_ADD_SUB,
    targetType: 'grand_total',
    targetIndex: -1,
    label: `橫列總計（全表總和）`,
    matrix,
    standardAnswer: grandTotal,
    answerFormatted: formatNumber(grandTotal, { hasCurrency, decimalPlaces: 0 })
  });

  return { matrix, rows, cols, questions };
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
    let questions = [];
    const count = subjectConfig.questionCount;
    let extraData = {};

    if (subjectType === SUBJECT_TYPES.CROSS_ADD_SUB) {
      const crossResult = generateCrossAddSubQuestions(subjectConfig.spec);
      questions = crossResult.questions;
      questions.forEach(q => { q.points = subjectConfig.pointsPerQuestion; });
      extraData = { matrix: crossResult.matrix, rows: crossResult.rows, cols: crossResult.cols };
    } else {
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
    }

    subjectsData[subjectType] = {
      subjectId: subjectType,
      subjectName: subjectConfig.subjectName,
      questionCount: questions.length,
      pointsPerQuestion: subjectConfig.pointsPerQuestion,
      totalPoints: subjectConfig.totalPoints,
      questions,
      ...extraData
    };

    totalQuestionsCount += questions.length;
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
