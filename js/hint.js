window.addEventListener("load", () => {
  const debug = true;

  const FAIL_COOLDOWN = 1 * 1000;
  const SUCCESS_COOLDOWN = 30 * 60 * 1000;

  const lastAttemptTime = parseInt(localStorage.getItem("lastAttemptTime") || "0");
  const lastStatus = localStorage.getItem("lastStatus");
  const now = new Date().getTime();

  const cooldown = lastStatus === "success" ? SUCCESS_COOLDOWN : FAIL_COOLDOWN;

  if (debug || !lastAttemptTime || now - lastAttemptTime > cooldown) {
    // 💡 안전장치: 혹시라도 lang.js에서 i18n JSON 파일 다운로드가 아직 안 끝났다면 잠시 대기
    if (!i18n || !i18n.rumbleTitle) return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMobile = isMobileDevice || navigator.maxTouchPoints > 0;

    // 💡 [수정] 다국어 JSON(i18n) 객체에서 번역된 힌트 문구를 동적으로 긁어옵니다.
    const hints = [
      {
        chance: 0.5,
        text: i18n.hint_timer_change || "Hint: If 1 hour left, timer changes.",
      },
    ];

    // 💡 오직 물리적인 PC 기기일 때만 1% 확률 레어 영문 힌트를 목록 맨 앞에 삽입
    if (!isMobile) {
      hints.unshift({
        chance: 0.01,
        text: i18n.hint_rare || "Hint: s-t-a-r-b-l-a-s-t",
      });
    }

    const rand = Math.random();
    let cumulative = 0;
    let selectedHint = null;

    for (const h of hints) {
      cumulative += h.chance;
      if (rand < cumulative) {
        selectedHint = h.text;
        break;
      }
    }

    if (selectedHint) {
      const hint = document.createElement("div");
      hint.innerHTML = selectedHint;

      const positionStyle = isMobile
        ? `
      position: relative;          
      margin: 20px auto !important; 
      width: 90% !important;       
      transform: none;             
      top: 0; left: 0;
      white-space: normal;         
      word-break: break-all;       
      text-align: center;
    `
        : `
      position: fixed;             
      top: 50%; left: 50%; 
      transform: translate(-50%, -50%);
      white-space: nowrap;         
    `;

      hint.style.cssText = `
    z-index: 999; background: transparent; color: rgba(0, 255, 200, 0.8);
    font-family: "Courier New", Courier, monospace; font-size: 20px; font-weight: bold;
    text-shadow: 0 0 10px rgba(0, 255, 200, 0.5); pointer-events: none;
    transition: opacity 0.6s ease-in-out; opacity: 1;
    ${positionStyle} 
  `;

      const commentWrapper = document.getElementById("comment-section-wrapper");
      if (isMobile && commentWrapper) {
        commentWrapper.parentNode.insertBefore(hint, commentWrapper);
      } else {
        document.body.appendChild(hint);
      }

      localStorage.setItem("lastStatus", "success");

      setTimeout(() => {
        hint.style.opacity = "0";
      }, 5400);
      setTimeout(() => {
        hint.remove();
      }, 6000);
    } else {
      localStorage.setItem("lastStatus", "fail");
    }

    if (!debug) {
      localStorage.setItem("lastAttemptTime", now);
    }
  }
});
