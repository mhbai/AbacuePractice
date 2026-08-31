/**
 * @file keyboardNav.js
 * @description 純鍵盤極致操作導航控制器
 * 支援 Enter / Shift+Enter / Tab / 方向鍵快速跳題、Numpad 友好輸入、Ctrl+Enter 快速交卷
 */

export class KeyboardNavigator {
  constructor(options = {}) {
    this.container = options.container || document;
    this.onSubmitShortcut = options.onSubmitShortcut || (() => {});
    this.onInputChange = options.onInputChange || (() => {});
    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.isListening = false;
  }

  attach() {
    if (!this.isListening) {
      this.container.addEventListener('keydown', this.boundKeyHandler);
      this.isListening = true;
    }
  }

  detach() {
    if (this.isListening) {
      this.container.removeEventListener('keydown', this.boundKeyHandler);
      this.isListening = false;
    }
  }

  /**
   * 取得目前所有可作答的輸入框列表
   * @returns {HTMLInputElement[]}
   */
  getInputElements() {
    return Array.from(this.container.querySelectorAll('input.quiz-answer-input:not([disabled])'));
  }

  /**
   * 自動聚焦到第一個（或第一個未作答的）輸入框
   */
  focusFirstInput(preferEmpty = true) {
    const inputs = this.getInputElements();
    if (inputs.length === 0) return;

    if (preferEmpty) {
      const firstEmpty = inputs.find(input => input.value.trim() === '');
      if (firstEmpty) {
        firstEmpty.focus();
        firstEmpty.select();
        return;
      }
    }

    inputs[0].focus();
    inputs[0].select();
  }

  /**
   * 聚焦特定題目的輸入框
   * @param {string} subjectId
   * @param {number} questionNo
   */
  focusQuestion(subjectId, questionNo) {
    const target = this.container.querySelector(`input.quiz-answer-input[data-subject="${subjectId}"][data-qno="${questionNo}"]`);
    if (target && !target.disabled) {
      target.focus();
      target.select();
    }
  }

  /**
   * 全局鍵盤事件攔截器
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    // 快捷鍵：Ctrl+Enter 或 Cmd+Enter -> 交卷
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.onSubmitShortcut();
      return;
    }

    const target = e.target;
    if (!target || !target.classList.contains('quiz-answer-input')) {
      return;
    }

    const inputs = this.getInputElements();
    const currentIndex = inputs.indexOf(target);
    if (currentIndex === -1) return;

    // 1. Enter 或 NumpadEnter
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enter: 跳到前一題
        this.navigateInputs(inputs, currentIndex, -1);
      } else {
        // Enter: 跳到下一題
        this.navigateInputs(inputs, currentIndex, 1);
      }
      return;
    }

    // 2. Tab 或 Shift+Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      this.navigateInputs(inputs, currentIndex, e.shiftKey ? -1 : 1);
      return;
    }

    // 3. 上下方向鍵 (ArrowDown / ArrowUp)
    if (e.key === 'ArrowDown') {
      // 檢查是否在加減算直欄多欄模式
      const colStep = parseInt(target.getAttribute('data-grid-cols') || '1', 10);
      if (colStep > 1) {
        e.preventDefault();
        this.navigateInputs(inputs, currentIndex, colStep);
      } else {
        e.preventDefault();
        this.navigateInputs(inputs, currentIndex, 1);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      const colStep = parseInt(target.getAttribute('data-grid-cols') || '1', 10);
      if (colStep > 1) {
        e.preventDefault();
        this.navigateInputs(inputs, currentIndex, -colStep);
      } else {
        e.preventDefault();
        this.navigateInputs(inputs, currentIndex, -1);
      }
      return;
    }

    // 4. 左右方向鍵 (ArrowLeft / ArrowRight) 在游標位於最前或最後時跳轉
    if (e.key === 'ArrowRight' && target.selectionEnd === target.value.length) {
      this.navigateInputs(inputs, currentIndex, 1);
      return;
    }
    if (e.key === 'ArrowLeft' && target.selectionStart === 0) {
      this.navigateInputs(inputs, currentIndex, -1);
      return;
    }
  }

  /**
   * 游標索引跳轉與滾動置中
   * @param {HTMLInputElement[]} inputs
   * @param {number} currentIndex
   * @param {number} delta
   */
  navigateInputs(inputs, currentIndex, delta) {
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= inputs.length) {
      nextIndex = inputs.length - 1;
    }

    const nextInput = inputs[nextIndex];
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
      nextInput.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }
}
