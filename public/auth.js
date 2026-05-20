(function () {
  'use strict';

  const STORAGE_KEY = 'yoonai_auth_ok';
  const EXPECTED_HASH = '2a605dd2319a7d34906edf1517a9bf87f2f017973f34afab94ee61216711612a';

  // 이미 통과 상태면 게이트 핸들러 자체를 건너뜀
  // (head의 inline script가 html.locked 클래스를 안 붙임 → CSS로 게이트 숨김)
  if (localStorage.getItem(STORAGE_KEY) === '1') {
    return;
  }

  function init() {
    const gate = document.getElementById('auth-gate');
    if (!gate) return;

    const inputs = Array.from(gate.querySelectorAll('.auth-digit'));
    const errorMsg = gate.querySelector('.auth-error');
    const form = gate.querySelector('.auth-form');

    setTimeout(() => inputs[0] && inputs[0].focus(), 50);

    inputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val.slice(-1);

        if (e.target.value && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }

        if (inputs.every((i) => i.value)) {
          submitCode();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          inputs[idx - 1].focus();
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (inputs.every((i) => i.value)) submitCode();
        }
        if (e.key === 'ArrowLeft' && idx > 0) {
          inputs[idx - 1].focus();
        }
        if (e.key === 'ArrowRight' && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
          .getData('text')
          .replace(/\D/g, '')
          .slice(0, 4);
        if (!pasted) return;
        pasted.split('').forEach((digit, i) => {
          if (inputs[i]) inputs[i].value = digit;
        });
        if (pasted.length === 4) {
          submitCode();
        } else if (inputs[pasted.length]) {
          inputs[pasted.length].focus();
        }
      });
    });

    async function submitCode() {
      const code = inputs.map((i) => i.value).join('');
      if (code.length !== 4) return;

      const hash = await sha256(code);

      if (hash === EXPECTED_HASH) {
        localStorage.setItem(STORAGE_KEY, '1');
        gate.style.opacity = '0';
        setTimeout(() => {
          document.documentElement.classList.remove('locked');
        }, 300);
      } else {
        errorMsg.textContent = '입장 코드가 일치하지 않습니다.';
        errorMsg.classList.add('visible');
        form.classList.remove('shake');
        void form.offsetWidth; // reflow → 애니메이션 재시작
        form.classList.add('shake');
        inputs.forEach((i) => (i.value = ''));
        inputs[0].focus();
      }
    }

    async function sha256(text) {
      const buf = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
