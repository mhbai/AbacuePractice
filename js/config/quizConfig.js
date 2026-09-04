/**
 * @file quizConfig.js
 * @description 珠算與心算線上模擬測驗設定規格檔 (依據台灣省商業會官方「珠算測試項目及程度、心算測試項目及程度」標準)
 * 涵蓋完整 16 個級別：
 * 段位、一級、準一級、二級、準二級、三級、四級、五級、六級、七級、八級、九級、十級、十一級、十二級、準十二級。
 */

/**
 * 測驗大類別
 * @readonly
 * @enum {string}
 */
export const EXAM_TYPES = {
  MENTAL: 'MENTAL', // 心算測驗 (限時 3 分鐘)
  ABACUS: 'ABACUS'  // 珠算測驗 (限時 10 分鐘)
};

/**
 * 科目類別
 * @readonly
 * @enum {string}
 */
export const SUBJECT_TYPES = {
  ADD_SUB: 'ADD_SUB',         // 加減算 / 加心算 / 加減心算
  MULTIPLICATION: 'MULTIPLICATION', // 乘算 / 乘心算
  DIVISION: 'DIVISION',        // 除算 / 除心算
  CROSS_ADD_SUB: 'CROSS_ADD_SUB' // 縱橫列計算
};

/**
 * 四捨五入規範
 * @readonly
 * @enum {string}
 */
export const ROUNDING_RULES = {
  INTEGER: 'INTEGER',               // 整數 (四捨五入至整數位)
  CURRENCY_CENTS: 'CURRENCY_CENTS', // 名數($)：求至分位（小數點後第2位，未滿者四捨五入）
  DECIMAL_3: 'DECIMAL_3',           // 無名數：求至小數第3位（未滿者四捨五入）
  DECIMAL_4: 'DECIMAL_4',           // 無名數：求至小數第4位（未滿者四捨五入）
  DECIMAL_5: 'DECIMAL_5',           // 無名數：求至小數第5位（未滿者四捨五入）
  EXACT_ONLY: 'EXACT_ONLY'          // 必須整除 / 精確無餘數
};

const OFFICIAL_DAN_SCALE = [
  { score: 80, rank: '初段' },
  { score: 90, rank: '二段' },
  { score: 100, rank: '三段' },
  { score: 110, rank: '四段' },
  { score: 120, rank: '五段' },
  { score: 130, rank: '六段' },
  { score: 140, rank: '七段' },
  { score: 160, rank: '八段' },
  { score: 180, rank: '九段' },
  { score: 200, rank: '十段' }
];

/**
 * 心算測驗完整設定 (Mental Math Configurations)
 * 試卷一張，限制時間 3 分鐘，加減心算每題10分，乘除心算每題5分，總分70分以上合格 (段位80~200分)
 */
const MENTAL_CONFIG = {
  id: EXAM_TYPES.MENTAL,
  name: "心算模擬測驗",
  defaultTimeLimitSeconds: 180, // 3 分鐘
  levels: {
    // -------------------------------------------------------------
    // 段位 (Degree / Dan Level)
    // -------------------------------------------------------------
    degree: {
      levelId: 'degree',
      levelName: '段位',
      timeLimitSeconds: 180,
      passCriteria: { danRankScale: OFFICIAL_DAN_SCALE },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 3, maxDigits: 3, weight: 0.4 },
              { minDigits: 4, maxDigits: 4, weight: 0.4 },
              { minDigits: 5, maxDigits: 5, weight: 0.2 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 2, count: 5 },
              { multiplicandDigits: 3, multiplierDigits: 3, count: 5 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 2, quotientDigits: 3, count: 5 },
              { divisorDigits: 3, quotientDigits: 2, count: 3 },
              { divisorDigits: 3, quotientDigits: 3, count: 2 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第一級 (Class 1)
    // -------------------------------------------------------------
    class_1: {
      levelId: 'class_1',
      levelName: '第一級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 3, maxDigits: 3, weight: 0.5 },
              { minDigits: 4, maxDigits: 4, weight: 0.5 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 2, count: 5 },
              { multiplicandDigits: 2, multiplierDigits: 3, count: 5 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 2, quotientDigits: 3, count: 5 },
              { divisorDigits: 3, quotientDigits: 2, count: 5 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準一級 (Pre-Class 1)
    // -------------------------------------------------------------
    pre_class_1: {
      levelId: 'pre_class_1',
      levelName: '準一級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 3, maxDigits: 3, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 2, count: 5 },
              { multiplicandDigits: 2, multiplierDigits: 2, count: 5 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 2, quotientDigits: 3, count: 3 },
              { divisorDigits: 3, quotientDigits: 2, count: 2 },
              { divisorDigits: 2, quotientDigits: 2, count: 5 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第二級 (Class 2)
    // -------------------------------------------------------------
    class_2: {
      levelId: 'class_2',
      levelName: '第二級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 0.5 },
              { minDigits: 3, maxDigits: 3, weight: 0.5 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 2, multiplierDigits: 2, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 2, quotientDigits: 2, count: 10 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準二級 (Pre-Class 2)
    // -------------------------------------------------------------
    pre_class_2: {
      levelId: 'pre_class_2',
      levelName: '準二級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 0.7 },
              { minDigits: 3, maxDigits: 3, weight: 0.3 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 2, multiplierDigits: 2, count: 5 },
              { multiplicandDigits: 3, multiplierDigits: 1, count: 5 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 2, quotientDigits: 2, count: 5 },
              { divisorDigits: 1, quotientDigits: 3, count: 5 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第三級 (Class 3)
    // -------------------------------------------------------------
    class_3: {
      levelId: 'class_3',
      levelName: '第三級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 1, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 1, quotientDigits: 3, count: 10 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第四級 (Class 4)
    // -------------------------------------------------------------
    class_4: {
      levelId: 'class_4',
      levelName: '第四級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 8,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 2, multiplierDigits: 1, count: 5 },
              { multiplicandDigits: 3, multiplierDigits: 1, count: 5 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 1, quotientDigits: 2, count: 5 },
              { divisorDigits: 1, quotientDigits: 3, count: 5 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第五級 (Class 5)
    // -------------------------------------------------------------
    class_5: {
      levelId: 'class_5',
      levelName: '第五級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 8,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            rowPatterns: [
              { count: 5, rows: 8, digitDistribution: [{ minDigits: 2, maxDigits: 2, weight: 0.5 }, { minDigits: 1, maxDigits: 1, weight: 0.5 }] },
              { count: 5, rows: 6, digitDistribution: [{ minDigits: 2, maxDigits: 2, weight: 1.0 }] }
            ]
          }
        },
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 2, multiplierDigits: 1, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除心算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 1, quotientDigits: 2, count: 10 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第六級 (Class 6)
    // -------------------------------------------------------------
    class_6: {
      levelId: 'class_6',
      levelName: '第六級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 8,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            rowPatterns: [
              { count: 5, rows: 8, digitDistribution: [{ minDigits: 1, maxDigits: 1, weight: 1.0 }] },
              { count: 5, rows: 5, digitDistribution: [{ minDigits: 2, maxDigits: 2, weight: 0.6 }, { minDigits: 1, maxDigits: 1, weight: 0.4 }] }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第七級 (Class 7)
    // -------------------------------------------------------------
    class_7: {
      levelId: 'class_7',
      levelName: '第七級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 7,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            rowPatterns: [
              { count: 5, rows: 7, digitDistribution: [{ minDigits: 1, maxDigits: 1, weight: 1.0 }] },
              { count: 5, rows: 5, digitDistribution: [{ minDigits: 2, maxDigits: 2, weight: 0.4 }, { minDigits: 1, maxDigits: 1, weight: 0.6 }] }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第八級 (Class 8)
    // -------------------------------------------------------------
    class_8: {
      levelId: 'class_8',
      levelName: '第八級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 6,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            rowPatterns: [
              { count: 5, rows: 6, digitDistribution: [{ minDigits: 1, maxDigits: 1, weight: 1.0 }] },
              { count: 5, rows: 4, digitDistribution: [{ minDigits: 2, maxDigits: 2, weight: 0.5 }, { minDigits: 1, maxDigits: 1, weight: 0.5 }] }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第九級 (Class 9)
    // -------------------------------------------------------------
    class_9: {
      levelId: 'class_9',
      levelName: '第九級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十級 (Class 10)
    // -------------------------------------------------------------
    class_10: {
      levelId: 'class_10',
      levelName: '第十級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 4,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十一級 (Class 11)
    // -------------------------------------------------------------
    class_11: {
      levelId: 'class_11',
      levelName: '第十一級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 3,
            specialCarryMode: '5_AND_10_COMBINATIONS',
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十二級 (Class 12)
    // -------------------------------------------------------------
    class_12: {
      levelId: 'class_12',
      levelName: '第十二級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 3,
            specialCarryMode: '10_COMBINATIONS_NO_MIX_LAST6789',
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準十二級 (Pre-Class 12)
    // -------------------------------------------------------------
    pre_class_12: {
      levelId: 'pre_class_12',
      levelName: '準十二級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加心算 (直覺運珠)',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 3,
            directBeadsOnly: true,
            noCarry: true,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, weight: 1.0 }
            ]
          }
        }
      }
    }
  }
};

/**
 * 珠算測驗完整設定 (Abacus Configurations)
 * 限制時間 10 分鐘，乘算除算縱橫列每題5分、加減算每題10分，各項目達70分及格 (段位80~200分)
 */
const ABACUS_CONFIG = {
  id: EXAM_TYPES.ABACUS,
  name: "珠算模擬測驗",
  defaultTimeLimitSeconds: 600, // 10 分鐘
  levels: {
    // -------------------------------------------------------------
    // 段位 (Degree / Dan Level)
    // -------------------------------------------------------------
    degree: {
      levelId: 'degree',
      levelName: '段位',
      timeLimitSeconds: 600,
      passCriteria: { danRankScale: OFFICIAL_DAN_SCALE },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 40,
          pointsPerQuestion: 5,
          totalPoints: 200,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 6, multiplierDigits: 5, isCurrency: true, count: 10 },
              { multiplicandDigits: 5, multiplierDigits: 6, isCurrency: false, hasDecimals: true, count: 10 },
              { multiplicandDigits: 6, multiplierDigits: 5, isCurrency: false, hasDecimals: true, count: 10 },
              { multiplicandDigits: 7, multiplierDigits: 4, isCurrency: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 40,
          pointsPerQuestion: 5,
          totalPoints: 200,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 5, quotientDigits: 5, isCurrency: true, count: 10 },
              { divisorDigits: 6, quotientDigits: 4, isCurrency: false, hasDecimals: true, count: 10 },
              { divisorDigits: 4, quotientDigits: 6, isCurrency: true, count: 10 },
              { divisorDigits: 5, quotientDigits: 5, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 20,
          pointsPerQuestion: 10,
          totalPoints: 200,
          spec: {
            rows: 15,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 5, maxDigits: 6, weight: 0.3 },
              { minDigits: 7, maxDigits: 8, weight: 0.4 },
              { minDigits: 9, maxDigits: 10, weight: 0.3 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第一級 (Class 1)
    // -------------------------------------------------------------
    class_1: {
      levelId: 'class_1',
      levelName: '第一級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 6, multiplierDigits: 5, isCurrency: true, count: 10 },
              { multiplicandDigits: 5, multiplierDigits: 6, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 5, quotientDigits: 5, isCurrency: true, count: 10 },
              { divisorDigits: 6, quotientDigits: 4, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 9, maxDigits: 10, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 9, maxDigits: 10, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準一級 (Pre-Class 1)
    // -------------------------------------------------------------
    pre_class_1: {
      levelId: 'pre_class_1',
      levelName: '準一級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 5, multiplierDigits: 5, isCurrency: true, count: 10 },
              { multiplicandDigits: 6, multiplierDigits: 4, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 5, quotientDigits: 4, isCurrency: true, count: 10 },
              { divisorDigits: 4, quotientDigits: 5, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 8, maxDigits: 9, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 8, maxDigits: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第二級 (Class 2)
    // -------------------------------------------------------------
    class_2: {
      levelId: 'class_2',
      levelName: '第二級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 5, multiplierDigits: 4, isCurrency: true, count: 10 },
              { multiplicandDigits: 4, multiplierDigits: 5, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 4, quotientDigits: 4, isCurrency: true, count: 10 },
              { divisorDigits: 5, quotientDigits: 3, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 7, maxDigits: 8, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 7, maxDigits: 8, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準二級 (Pre-Class 2)
    // -------------------------------------------------------------
    pre_class_2: {
      levelId: 'pre_class_2',
      levelName: '準二級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 4, multiplierDigits: 4, isCurrency: true, count: 10 },
              { multiplicandDigits: 5, multiplierDigits: 3, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 4, quotientDigits: 3, isCurrency: true, count: 10 },
              { divisorDigits: 3, quotientDigits: 4, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 6, maxDigits: 7, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 6, maxDigits: 7, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第三級 (Class 3)
    // -------------------------------------------------------------
    class_3: {
      levelId: 'class_3',
      levelName: '第三級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_3,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { multiplicandDigits: 4, multiplierDigits: 3, isCurrency: true, count: 10 },
              { multiplicandDigits: 3, multiplierDigits: 4, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_3,
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            patterns: [
              { divisorDigits: 3, quotientDigits: 3, isCurrency: true, count: 10 },
              { divisorDigits: 4, quotientDigits: 2, isCurrency: false, hasDecimals: true, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 5, maxDigits: 6, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 5, maxDigits: 6, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第四級 (Class 4)
    // -------------------------------------------------------------
    class_4: {
      levelId: 'class_4',
      levelName: '第四級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 4, multiplierDigits: 3, count: 10 },
              { multiplicandDigits: 3, multiplierDigits: 4, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { divisorDigits: 3, quotientDigits: 3, count: 10 },
              { divisorDigits: 2, quotientDigits: 4, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 4, maxDigits: 5, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 4, maxDigits: 5, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第五級 (Class 5)
    // -------------------------------------------------------------
    class_5: {
      levelId: 'class_5',
      levelName: '第五級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 3, count: 10 },
              { multiplicandDigits: 4, multiplierDigits: 2, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { divisorDigits: 2, quotientDigits: 3, count: 10 },
              { divisorDigits: 3, quotientDigits: 2, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 3, maxDigits: 4, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 3, maxDigits: 4, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第六級 (Class 6)
    // -------------------------------------------------------------
    class_6: {
      levelId: 'class_6',
      levelName: '第六級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 2, count: 10 },
              { multiplicandDigits: 2, multiplierDigits: 3, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { divisorDigits: 2, quotientDigits: 2, count: 10 },
              { divisorDigits: 1, quotientDigits: 3, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 2, maxDigits: 4, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: true,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 2, maxDigits: 4, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第七級 (Class 7)
    // -------------------------------------------------------------
    class_7: {
      levelId: 'class_7',
      levelName: '第七級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 2, multiplierDigits: 2, count: 20 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 1, quotientDigits: 3, count: 10 },
              { divisorDigits: 1, quotientDigits: 2, count: 10 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第八級 (Class 8)
    // -------------------------------------------------------------
    class_8: {
      levelId: 'class_8',
      levelName: '第八級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 350 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { multiplicandDigits: 3, multiplierDigits: 1, count: 20 }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            roundingRule: ROUNDING_RULES.EXACT_ONLY,
            patterns: [
              { divisorDigits: 1, quotientDigits: 2, count: 20 }
            ]
          }
        },
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第九級 (Class 9)
    // -------------------------------------------------------------
    class_9: {
      levelId: 'class_9',
      levelName: '第九級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十級 (Class 10)
    // -------------------------------------------------------------
    class_10: {
      levelId: 'class_10',
      levelName: '第十級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十一級 (Class 11)
    // -------------------------------------------------------------
    class_11: {
      levelId: 'class_11',
      levelName: '第十一級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 7,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 第十二級 (Class 12)
    // -------------------------------------------------------------
    class_12: {
      levelId: 'class_12',
      levelName: '第十二級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 9, weight: 1.0 }
            ]
          }
        }
      }
    },

    // -------------------------------------------------------------
    // 準十二級 (Pre-Class 12)
    // -------------------------------------------------------------
    pre_class_12: {
      levelId: 'pre_class_12',
      levelName: '準十二級',
      timeLimitSeconds: 600,
      passCriteria: { minSubjectScore: 70, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減算 (直覺運珠)',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 4,
            directBeadsOnly: true,
            noCarry: true,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.25,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, weight: 1.0 }
            ]
          }
        },
        [SUBJECT_TYPES.CROSS_ADD_SUB]: {
          subjectId: SUBJECT_TYPES.CROSS_ADD_SUB,
          subjectName: '縱橫列計算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            rows: 5,
            cols: 5,
            directBeadsOnly: true,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.2,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 5, weight: 1.0 }
            ]
          }
        }
      }
    }
  }
};

/**
 * 完整測驗總設定庫
 */
export const QUIZ_CONFIG = {
  [EXAM_TYPES.MENTAL]: MENTAL_CONFIG,
  [EXAM_TYPES.ABACUS]: ABACUS_CONFIG
};

/**
 * 輔助函式：取得指定測驗與等級的設定
 * @param {string} examType - 'MENTAL' | 'ABACUS'
 * @param {string} levelId
 * @returns {object|null}
 */
export function getLevelConfig(examType, levelId) {
  const exam = QUIZ_CONFIG[examType];
  if (!exam) return null;
  return exam.levels[levelId] || null;
}

/**
 * 輔助函式：取得所有可用等級列表
 * @param {string} examType - 'MENTAL' | 'ABACUS'
 * @returns {Array<{ levelId: string, levelName: string }>}
 */
export function getLevelList(examType) {
  const exam = QUIZ_CONFIG[examType];
  if (!exam) return [];
  return Object.values(exam.levels).map(lvl => ({
    levelId: lvl.levelId,
    levelName: lvl.levelName
  }));
}
