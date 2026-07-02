// js/lang.js

// 1. [순서 변경 - 핵심!] 로컬 스토리지보다 '현재 브라우저의 실제 언어'를 최우선으로 체크합니다.
const browserLang = navigator.language || navigator.userLanguage || "en";
const systemLang = browserLang.toLowerCase().substring(0, 2);

// 2. 만약 이전에 저장된 언어와 현재 브라우저 언어가 다르면, 브라우저 언어를 우선 적용합니다.
let currentLang = localStorage.getItem("userLang");
if (!currentLang || currentLang !== systemLang) {
  currentLang = systemLang;
  localStorage.setItem("userLang", currentLang);
}

let i18n = {};

// 3. 파일 직접 찔러보고 판단하는 로직
async function loadLanguage(lang) {
  try {
    const response = await fetch(`locales/${lang}.json`);

    // 파일이 없으면 에러를 내서 catch 구문(영어 대체)으로 이동
    if (!response.ok) throw new Error(`File not found: locales/${lang}.json`);

    i18n = await response.json();
    currentLang = lang;
    localStorage.setItem("userLang", lang);

    // 번역 및 타이머 즉시 갱신
    applyUITranslations();
    if (typeof updateTimer === "function") {
      updateTimer();
    }
  } catch (e) {
    console.warn(`${lang}.json 파일이 없어 기본값(en)으로 대체합니다.`);

    // 무한 루프 방지: 실패한 언어가 영어(en)가 아니었을 때만 영어로 최종 시도
    if (lang !== "en") {
      loadLanguage("en");
    }
  }
}

// 4. UI 텍스트 치환 함수
function applyUITranslations() {
  if (!i18n || Object.keys(i18n).length === 0) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[key]) {
      if (el.tagName.toLowerCase() === "input" && el.type === "button") {
        el.value = i18n[key];
      } else {
        el.textContent = i18n[key];
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (i18n[key]) el.setAttribute("placeholder", i18n[key]);
  });

  if (i18n.site_title) document.title = i18n.site_title;
}

// 5. 구동 타이밍 바인딩
window.addEventListener("DOMContentLoaded", () => {
  loadLanguage(currentLang);
});
