// js/lang.js

// 1. [변경] 로컬 스토리지나 브라우저 언어 대신, "현재 접속한 URL 경로"를 최우선으로 체크합니다.
const currentPath = window.location.pathname; // 예: /Starblast_Rumble_Timer/ko/
const pathSegments = currentPath.split("/").filter(Boolean);
const supportedLangs = ["ko", "zh", "ja", "en", "fr", "es", "de"];

// URL 경로 중에 지원하는 7개 언어가 포함되어 있는지 확인 (예: 'ko' 등)
const urlLang = pathSegments.find((segment) => supportedLangs.includes(segment));

let currentLang = localStorage.getItem("userLang");

if (urlLang) {
  // URL에 언어가 명시되어 있다면 무조건 그 언어를 최우선 적용합니다.
  currentLang = urlLang;
  localStorage.setItem("userLang", currentLang);
} else {
  // URL에 언어가 없다면 (예: 메인 root 주소로 그냥 접속했을 때) 기존 감지 로직 적용
  const browserLang = navigator.language || navigator.userLanguage || "en";
  const systemLang = browserLang.toLowerCase().substring(0, 2);

  if (!currentLang || currentLang !== systemLang) {
    currentLang = systemLang;
    localStorage.setItem("userLang", currentLang);
  }
}

let i18n = {};

// 3. 파일 직접 찔러보고 판단하는 로직
async function loadLanguage(lang) {
  try {
    const response = await fetch(`/Starblast_Rumble_Timer/locales/${lang}.json`);

    // 파일이 없으면 에러를 내서 catch 구문(영어 대체)으로 이동
    if (!response.ok) throw new Error(`File not found: /Starblast_Rumble_Timer/locales/${lang}.json`);

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
