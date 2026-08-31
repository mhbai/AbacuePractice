/**
 * @file quizConfig.js
 * @description 珠算與心算線上模擬測驗設定規格檔 (JSON Schema & Level Configuration)
 * 涵蓋所有級別（心算：段位、1級~12級、準12級；珠算：段位、1級~10級）
 * 包含科目、題數、計分、位數、名數($)、小數點位數、四捨五入模式與合格標準。
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
  ADD_SUB: 'ADD_SUB',         // 加減算 / 加減心算
  MULTIPLICATION: 'MULTIPLICATION', // 乘算 / 乘心算
  DIVISION: 'DIVISION'        // 除算 / 除心算
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

/**
 * JSON Schema for Quiz Configuration Validation
 */
export const QUIZ_CONFIG_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "AbacusAndMentalMathQuizConfig",
  type: "object",
  properties: {
    examTypes: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          defaultTimeLimitSeconds: { type: "integer", minimum: 10 },
          levels: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                levelId: { type: "string" },
                levelName: { type: "string" },
                timeLimitSeconds: { type: "integer" },
                passCriteria: {
                  type: "object",
                  properties: {
                    minTotalScore: { type: "number" },
                    minSubjectScore: { type: "number" },
                    danRankScale: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          rank: { type: "string" }
                        },
                        required: ["score", "rank"]
                      }
                    }
                  }
                },
                subjects: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      subjectId: { type: "string" },
                      subjectName: { type: "string" },
                      questionCount: { type: "integer", minimum: 1 },
                      pointsPerQuestion: { type: "number", minimum: 1 },
                      totalPoints: { type: "number", minimum: 1 },
                      spec: { type: "object" }
                    },
                    required: ["subjectId", "subjectName", "questionCount", "pointsPerQuestion", "totalPoints", "spec"]
                  }
                }
              },
              required: ["levelId", "levelName", "timeLimitSeconds", "subjects"]
            }
          }
        },
        required: ["id", "name", "defaultTimeLimitSeconds", "levels"]
      }
    }
  }
};

/**
 * 心算測驗完整設定 (Mental Math Configurations)
 * 依據中華民國珠算學會 / 全國珠心算檢定標準規格
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
      passCriteria: {
        danRankScale: [
          { score: 80, rank: '初段' },
          { score: 100, rank: '二段' },
          { score: 120, rank: '三段' },
          { score: 140, rank: '四段' },
          { score: 160, rank: '五段' },
          { score: 180, rank: '六段' },
          { score: 200, rank: '七段' },
          { score: 220, rank: '八段' },
          { score: 240, rank: '九段' },
          { score: 260, rank: '十段' }
        ]
      },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.3, // 約 30% 負數運算
            digitDistribution: [
              { minDigits: 3, maxDigits: 5, weight: 1.0 }
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
              { multiplicandDigits: 3, multiplierDigits: 2, count: 4 }, // 例: 605×38
              { multiplicandDigits: 2, multiplierDigits: 3, count: 3 }, // 例: 97×234
              { multiplicandDigits: 4, multiplierDigits: 2, count: 2 }, // 例: 6,451×93
              { multiplicandDigits: 2, multiplierDigits: 4, count: 1 }  // 例: 16×5,907
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
              { divisorDigits: 2, quotientDigits: 3, count: 4 }, // 5位 ÷ 2位 = 3位 (16,388 ÷ 17 = 964)
              { divisorDigits: 3, quotientDigits: 2, count: 3 }, // 5位 ÷ 3位 = 2位 (39,974 ÷ 506 = 79)
              { divisorDigits: 3, quotientDigits: 3, count: 2 }, // 6位 ÷ 3位 = 3位 (160,440 ÷ 280 = 573)
              { divisorDigits: 4, quotientDigits: 2, count: 1 }  // 6位 ÷ 4位 = 2位 (787,437 ÷ 9,051 = 87)
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 3, maxDigits: 4, weight: 1.0 }
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
              { multiplicandDigits: 2, multiplierDigits: 3, count: 5 }, // 25 × 179
              { multiplicandDigits: 3, multiplierDigits: 2, count: 5 }  // 680 × 47
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
              { divisorDigits: 2, quotientDigits: 2, count: 5 }, // 4位 ÷ 2位 = 2位
              { divisorDigits: 2, quotientDigits: 3, count: 5 }  // 5位 ÷ 2位 = 3位
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.ADD_SUB]: {
          subjectId: SUBJECT_TYPES.ADD_SUB,
          subjectName: '加減心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 10,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
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
              { multiplicandDigits: 2, multiplierDigits: 2, count: 6 },
              { multiplicandDigits: 3, multiplierDigits: 2, count: 4 }
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
    // 第三級 (Class 3)
    // -------------------------------------------------------------
    class_3: {
      levelId: 'class_3',
      levelName: '第三級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
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
              { divisorDigits: 2, quotientDigits: 2, count: 6 },
              { divisorDigits: 1, quotientDigits: 3, count: 4 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { multiplicandDigits: 2, multiplierDigits: 2, count: 6 },
              { multiplicandDigits: 2, multiplierDigits: 1, count: 4 }
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
              { divisorDigits: 1, quotientDigits: 2, count: 6 },
              { divisorDigits: 2, quotientDigits: 2, count: 4 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
    // 第七級 (Class 7)
    // -------------------------------------------------------------
    class_7: {
      levelId: 'class_7',
      levelName: '第七級',
      timeLimitSeconds: 180,
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
              { divisorDigits: 1, quotientDigits: 1, count: 5 },
              { divisorDigits: 1, quotientDigits: 2, count: 5 }
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
      passCriteria: { minTotalScore: 100, totalPossible: 150 },
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
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
              { multiplicandDigits: 1, multiplierDigits: 1, count: 5 },
              { multiplicandDigits: 2, multiplierDigits: 1, count: 5 }
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
      passCriteria: { minTotalScore: 100, totalPossible: 150 },
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
            subtractionRatio: 0.2,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
              { multiplicandDigits: 1, multiplierDigits: 1, count: 10 }
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
          subjectName: '加心算',
          questionCount: 10,
          pointsPerQuestion: 10,
          totalPoints: 100,
          spec: {
            rows: 4,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, weight: 0.8 },
              { minDigits: 2, maxDigits: 2, weight: 0.2 }
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
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 1, minVal: 1, maxVal: 6, weight: 1.0 }
            ]
          }
        }
      }
    }
  }
};

/**
 * 珠算測驗完整設定 (Abacus Calculation Configurations)
 * 依據台灣標準省商會檢定 / 全國珠算競賽標準
 * 限時 10 分鐘，名數求至分位($0.00)，無名數依級別求至指定小數位數 (四捨五入)
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
      passCriteria: {
        danRankScale: [
          { score: 80, rank: '初段' },
          { score: 100, rank: '二段' },
          { score: 120, rank: '三段' },
          { score: 140, rank: '四段' },
          { score: 160, rank: '五段' },
          { score: 180, rank: '六段' },
          { score: 200, rank: '七段' },
          { score: 220, rank: '八段' },
          { score: 240, rank: '九段' },
          { score: 260, rank: '十段' }
        ]
      },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 40,
          pointsPerQuestion: 5,
          totalPoints: 200,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            patterns: [
              { count: 20, isCurrency: true, minDigitsA: 3, maxDigitsA: 6, minDigitsB: 2, maxDigitsB: 5, hasDecimals: true },
              { count: 20, isCurrency: false, minDigitsA: 3, maxDigitsA: 6, minDigitsB: 2, maxDigitsB: 5, hasDecimals: true }
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
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            patterns: [
              { count: 20, isCurrency: true, divisorDigits: [2, 5], quotientDigits: [2, 5], hasDecimals: true },
              { count: 20, isCurrency: false, divisorDigits: [2, 5], quotientDigits: [2, 5], hasDecimals: true }
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
            rows: 15,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 6, maxDigits: 10, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            patterns: [
              { count: 15, isCurrency: true, minDigitsA: 3, maxDigitsA: 5, minDigitsB: 2, maxDigitsB: 4, hasDecimals: true },
              { count: 15, isCurrency: false, minDigitsA: 3, maxDigitsA: 5, minDigitsB: 2, maxDigitsB: 4, hasDecimals: true }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_5,
            patterns: [
              { count: 15, isCurrency: true, divisorDigits: [2, 4], quotientDigits: [2, 4], hasDecimals: true },
              { count: 15, isCurrency: false, divisorDigits: [2, 4], quotientDigits: [2, 4], hasDecimals: true }
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
            rows: 15,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 5, maxDigits: 8, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            patterns: [
              { count: 15, isCurrency: true, minDigitsA: 3, maxDigitsA: 4, minDigitsB: 2, maxDigitsB: 3, hasDecimals: true },
              { count: 15, isCurrency: false, minDigitsA: 3, maxDigitsA: 4, minDigitsB: 2, maxDigitsB: 3, hasDecimals: true }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_4,
            patterns: [
              { count: 15, isCurrency: true, divisorDigits: [2, 3], quotientDigits: [2, 3], hasDecimals: true },
              { count: 15, isCurrency: false, divisorDigits: [2, 3], quotientDigits: [2, 3], hasDecimals: true }
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
            rows: 12,
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 4, maxDigits: 7, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_3,
            patterns: [
              { count: 15, isCurrency: true, minDigitsA: 3, maxDigitsA: 3, minDigitsB: 2, maxDigitsB: 3, hasDecimals: true },
              { count: 15, isCurrency: false, minDigitsA: 3, maxDigitsA: 3, minDigitsB: 2, maxDigitsB: 3, hasDecimals: true }
            ]
          }
        },
        [SUBJECT_TYPES.DIVISION]: {
          subjectId: SUBJECT_TYPES.DIVISION,
          subjectName: '除算',
          questionCount: 30,
          pointsPerQuestion: 5,
          totalPoints: 150,
          spec: {
            currencyRounding: ROUNDING_RULES.CURRENCY_CENTS,
            nonCurrencyRounding: ROUNDING_RULES.DECIMAL_3,
            patterns: [
              { count: 15, isCurrency: true, divisorDigits: [2, 3], quotientDigits: [2, 3], hasDecimals: true },
              { count: 15, isCurrency: false, divisorDigits: [2, 3], quotientDigits: [2, 3], hasDecimals: true }
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
            hasDecimals: true,
            decimalPlaces: 2,
            hasCurrency: true,
            subtractionRatio: 0.35,
            digitDistribution: [
              { minDigits: 4, maxDigits: 6, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 20,
          pointsPerQuestion: 5,
          totalPoints: 100,
          spec: {
            currencyRounding: ROUNDING_RULES.INTEGER,
            nonCurrencyRounding: ROUNDING_RULES.INTEGER,
            patterns: [
              { count: 20, isCurrency: false, minDigitsA: 3, maxDigitsA: 3, minDigitsB: 2, maxDigitsB: 2, hasDecimals: false }
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
              { divisorDigits: 2, quotientDigits: 2, count: 20 }
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
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 3, maxDigits: 4, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { count: 20, isCurrency: false, minDigitsA: 2, maxDigitsA: 3, minDigitsB: 2, maxDigitsB: 2, hasDecimals: false }
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
              { divisorDigits: 2, quotientDigits: 2, count: 20 }
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
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { count: 20, isCurrency: false, minDigitsA: 2, maxDigitsA: 2, minDigitsB: 1, maxDigitsB: 2, hasDecimals: false }
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
            rows: 8,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 3, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { count: 20, isCurrency: false, minDigitsA: 2, maxDigitsA: 2, minDigitsB: 1, maxDigitsB: 1, hasDecimals: false }
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
            rows: 8,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.3,
            digitDistribution: [
              { minDigits: 2, maxDigits: 2, weight: 1.0 }
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
      passCriteria: { minTotalScore: 140, totalPossible: 200 },
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
              { count: 20, isCurrency: false, minDigitsA: 2, maxDigitsA: 2, minDigitsB: 1, maxDigitsB: 1, hasDecimals: false }
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
              { divisorDigits: 1, quotientDigits: 1, count: 10 },
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
            rows: 6,
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
    // 第九級 (Class 9)
    // -------------------------------------------------------------
    class_9: {
      levelId: 'class_9',
      levelName: '第九級',
      timeLimitSeconds: 600,
      passCriteria: { minTotalScore: 100, totalPossible: 150 },
      subjects: {
        [SUBJECT_TYPES.MULTIPLICATION]: {
          subjectId: SUBJECT_TYPES.MULTIPLICATION,
          subjectName: '乘算',
          questionCount: 10,
          pointsPerQuestion: 5,
          totalPoints: 50,
          spec: {
            roundingRule: ROUNDING_RULES.INTEGER,
            patterns: [
              { count: 10, isCurrency: false, minDigitsA: 1, maxDigitsA: 2, minDigitsB: 1, maxDigitsB: 1, hasDecimals: false }
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
            rows: 6,
            hasDecimals: false,
            hasCurrency: false,
            subtractionRatio: 0.2,
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
      passCriteria: { minTotalScore: 70, totalPossible: 100 },
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
            subtractionRatio: 0.0,
            digitDistribution: [
              { minDigits: 1, maxDigits: 2, weight: 1.0 }
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
 * @param {string} levelId - 'degree' | 'class_1' ~ 'class_12' | 'pre_class_12'
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
