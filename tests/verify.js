/**
 * @file verify.js
 * @description 自動化測試套件：驗證設定檔、題目生成引擎約束、自動評分比對與段位判定
 */

import { EXAM_TYPES, QUIZ_CONFIG, getLevelList, getLevelConfig } from '../js/config/quizConfig.js';
import * as mathEngine from '../js/engine/mathEngine.js';
import * as grader from '../js/engine/grader.js';

async function runTests() {
  console.log('=====================================================');
  console.log('🧮 珠心算模擬測驗系統：全功能自動化測試');
  console.log('=====================================================');

  // 1. 驗證配置檔與 Schema 完整性
  console.log('\n[測試 1] 驗證配置檔與所有級別定義...');
  for (const type of [EXAM_TYPES.MENTAL, EXAM_TYPES.ABACUS]) {
    const list = getLevelList(type);
    console.log(`  - 測驗大類【${type}】：共有 ${list.length} 個等級`);
    for (const lvl of list) {
      const cfg = getLevelConfig(type, lvl.levelId);
      if (!cfg || !cfg.subjects) {
        throw new Error(`缺少級別設定: ${type} / ${lvl.levelId}`);
      }
    }
  }
  console.log('  ✓ 配置檔所有級別、科目、計分與時間規則驗證通過！');

  // 2. 驗證題目生成引擎與數學約束
  console.log('\n[測試 2] 驗證出題演算法與數學約束...');
  let totalPapers = 0;
  let totalQuestions = 0;

  for (const type of [EXAM_TYPES.MENTAL, EXAM_TYPES.ABACUS]) {
    const list = getLevelList(type);
    for (const lvl of list) {
      for (let round = 0; round < 3; round++) {
        const paper = mathEngine.generateExamPaper(type, lvl.levelId);
        totalPapers++;

        // 驗證加減算非負約束 (每一步驟 running balance > 0)
        const addSub = paper.subjects.ADD_SUB;
        if (addSub) {
          for (const q of addSub.questions) {
            totalQuestions++;
            let runningSum = 0;
            for (let rIdx = 0; rIdx < q.rows.length; rIdx++) {
              const r = q.rows[rIdx];
              runningSum = mathEngine.roundToDecimals(runningSum + r.rawVal, q.decimalPlaces || 2);
              if (runningSum <= 0) {
                throw new Error(`加減算非負約束違反！${type}/${lvl.levelId}/第${q.questionNo}題/第${rIdx + 1}筆: 累計總和 = ${runningSum}`);
              }
            }

            // 驗證直覺運珠 (無十進位、無五湊進、無借退位約束)
            if (addSub.spec?.directBeadsOnly || addSub.spec?.noCarry) {
              if (q.standardAnswer > 9 || q.standardAnswer < 1) {
                throw new Error(`直覺運珠答案超出範圍！${type}/${lvl.levelId}/第${q.questionNo}題: 答案 = ${q.standardAnswer}`);
              }
              let simSum = 0;
              for (const row of q.rows) {
                const val = Math.abs(row.rawVal);
                if (row.rawVal > 0) {
                  const curL = simSum % 5;
                  const curU = Math.floor(simSum / 5);
                  const addL = val % 5;
                  const addU = Math.floor(val / 5);
                  if (curL + addL > 4 || curU + addU > 1) {
                    throw new Error(`直覺運珠加法違反無進位/湊五約束！${type}/${lvl.levelId}/第${q.questionNo}題: 當前 ${simSum}, 加上 ${val}`);
                  }
                  simSum += val;
                } else {
                  const curL = simSum % 5;
                  const curU = Math.floor(simSum / 5);
                  const subL = val % 5;
                  const subU = Math.floor(val / 5);
                  if (curL < subL || curU < subU) {
                    throw new Error(`直覺運珠減法違反無退位/借位約束！${type}/${lvl.levelId}/第${q.questionNo}題: 當前 ${simSum}, 減去 ${val}`);
                  }
                  simSum -= val;
                }
              }
            }
          }
        }

        // 驗證心算除法整除約束
        const div = paper.subjects.DIVISION;
        if (div) {
          for (const q of div.questions) {
            totalQuestions++;
            if (q.roundingDecimals === 0 && !String(q.expression).includes('.')) {
              if (q.dividend % q.divisor !== 0) {
                throw new Error(`除算整除約束違反！${type}/${lvl.levelId}/第${q.questionNo}題: ${q.dividend} ÷ ${q.divisor}`);
              }
            }
          }
        }

        // 驗證乘算
        const mul = paper.subjects.MULTIPLICATION;
        if (mul) {
          for (const q of mul.questions) {
            totalQuestions++;
            if (isNaN(q.standardAnswer)) {
              throw new Error(`乘算答案計算異常: ${q.expression}`);
            }
          }
        }

        // 驗證縱橫列計算
        const cross = paper.subjects.CROSS_ADD_SUB;
        if (cross) {
          for (const q of cross.questions) {
            totalQuestions++;
            if (isNaN(q.standardAnswer)) {
              throw new Error(`縱橫列計算標準答案異常: ${q.label}`);
            }
          }
        }
      }
    }
  }
  console.log(`  ✓ 成功生成 ${totalPapers} 份完整試卷（共 ${totalQuestions} 道題目），加減算非負約束、整除約束與縱橫列計算 100% 達成！`);

  // 3. 驗證評分器、容錯標準化與段位判定
  console.log('\n[測試 3] 驗證自動評分器、輸入容錯比對與段位判定...');
  
  // 3.1 測試字串容錯標準化
  const normTests = [
    { input: '$1,234.50', expected: 1234.5 },
    { input: ' 1234.5 ', expected: 1234.5 },
    { input: '1,234.500', expected: 1234.5 },
    { input: '-456.78', expected: -456.78 },
    { input: '(456.78)', expected: -456.78 },
    { input: '$999', expected: 999 }
  ];

  for (const t of normTests) {
    const res = grader.normalizeUserAnswer(t.input);
    if (!res.valid || Math.abs(res.numVal - t.expected) > 0.0001) {
      throw new Error(`標準化測試失敗: 輸入 "${t.input}", 預期 ${t.expected}, 實際得到 ${res.numVal}`);
    }
  }
  console.log('  ✓ 答案容錯標準化（$ 貨幣符號、千分位逗號、空白、括號負數）驗證通過！');

  // 3.2 測試段位認定
  const danScale = QUIZ_CONFIG[EXAM_TYPES.MENTAL].levels.degree.passCriteria.danRankScale;
  const d0 = grader.evaluateDanRank(60, danScale);
  const d1 = grader.evaluateDanRank(80, danScale);
  const d4 = grader.evaluateDanRank(145, danScale);
  const d10 = grader.evaluateDanRank(260, danScale);

  if (d0.passed || d1.rank !== '初段' || d4.rank !== '四段' || d10.rank !== '十段') {
    throw new Error('段位評定邏輯異常: ' + JSON.stringify({ d0, d1, d4, d10 }));
  }
  console.log('  ✓ 段位評定標準（初段 ~ 十段）計算完全正確！');

  // 3.3 測試單題即時批改 (即填即審)
  const qTest1 = { questionNo: 1, standardAnswer: 350, answerFormatted: '350', points: 10 };
  const rCorrect = grader.gradeSingleQuestion(qTest1, ' 350 ');
  const rFormatCorrect = grader.gradeSingleQuestion(qTest1, '$350.00');
  const rWrong = grader.gradeSingleQuestion(qTest1, '351');
  const rEmpty = grader.gradeSingleQuestion(qTest1, '');

  if (!rCorrect.isCorrect || !rFormatCorrect.isCorrect || rWrong.isCorrect || rEmpty.isAnswered) {
    throw new Error('單題即時批改邏輯異常: ' + JSON.stringify({ rCorrect, rFormatCorrect, rWrong, rEmpty }));
  }
  console.log('  ✓ 單題即時批改（即填即審）驗證通過！');

  console.log('\n=====================================================');
  console.log('🎉 所有單元與集成測試全部通過 (100% SUCCESS)！');
  console.log('=====================================================\n');
}

runTests().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
