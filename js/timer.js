// js/timer.js 전체 코드

// [신규] 타이머 창 토글 시스템
function toggleContainer() {
  const container = document.getElementById("mainContainer");
  const openBtn = document.getElementById("openBtn");

  if (!container || !openBtn) return;

  if (container.style.display === "none") {
    container.style.display = "inline-block";
    openBtn.style.display = "none";
  } else {
    container.style.display = "none";
    openBtn.style.display = "block";
  }
}

// ==========================================
// 1. 무한 루프 럼블 스케줄러 스크립트
// ==========================================

const isDebug = false;
const debugTimeStr = "2026-05-18T00:00+09:00";
const BASE_START_TIME = new Date("2026-05-17T16:00:00Z").getTime();

function updateTimer() {
  // 💡 i18n 데이터가 아직 안 들어왔으면 뇌절 방지용 대기
  if (!i18n || !i18n.rumbleTitle) return;

  const t = i18n;
  let nowMs = isDebug ? new Date(debugTimeStr).getTime() : new Date().getTime();

  let targetStart = new Date("2026-05-17T16:00:00Z").getTime();
  let targetEnd = targetStart + 8 * 60 * 60 * 1000;

  const CYCLE = 64 * 60 * 60 * 1000;

  while (nowMs > targetEnd) {
    targetStart += CYCLE;
    targetEnd += CYCLE;
  }

  let displayTitle = "";
  let displayInfo = "";
  let displayCountdown = "";

  if (nowMs >= targetStart && nowMs <= targetEnd) {
    const timeRemaining = targetEnd - nowMs;

    displayTitle = t.rumbleTitle;
    displayInfo = t.rumbleInfo;
    displayCountdown = formatTime(timeRemaining) + (t.end || "");
  } else {
    const nextDate = new Date(targetStart);

    displayTitle = t.waitInfo;
    // 💡 보내주신 JSON의 y, m, d 키로 한국어/영어 날짜 포맷팅 반영
    displayInfo = `${t.start || ""}: ${nextDate.getFullYear()}${t.y || ""} ${nextDate.getMonth() + 1}${t.m || ""} ${nextDate.getDate()}${t.d || ""} (${getWeekday(nextDate)}) ${formatAMPM(nextDate)}`;
    displayCountdown = formatLongTime(nowMs, targetStart);
  }

  // 무지개 LED 로직
  const timerElement = document.getElementById("countdown");
  if (!timerElement) return;

  const timeLeftMs = targetStart - nowMs;
  const isLessToOneHour = timeLeftMs > 0 && timeLeftMs < 60 * 60 * 1000;
  const isRumbleActive = nowMs >= targetStart && nowMs <= targetEnd;

  timerElement.classList.remove("rumble", "rainbow");

  if (isRumbleActive) {
    timerElement.classList.add("rumble");
  } else if (isLessToOneHour) {
    timerElement.classList.add("rainbow");
    const minutesLeft = timeLeftMs / (1000 * 60);
    const speed = 0.2 + (minutesLeft / 60) * 1.8;
    timerElement.style.setProperty("--speed", `${speed}s`);
  } else {
    timerElement.style.removeProperty("--speed");
  }

  const h1Element = document.querySelector("h1");
  const infoElement = document.querySelector(".info");

  if (h1Element) h1Element.innerHTML = displayTitle;
  if (infoElement) infoElement.innerHTML = displayInfo;
  timerElement.innerHTML = displayCountdown;
}

// ------------ 시간 포맷 보조 함수들 (보내주신 JSON 키값 완전 매칭) ------------

function formatTime(ms) {
  const t = i18n || {};
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${hours}${t.h || ""} ${minutes}${t.min || ""} ${seconds}${t.s || ""}`;
}

function formatLongTime(nowMs, targetMs) {
  const t = i18n || {};
  const now = new Date(nowMs);
  const target = new Date(targetMs);

  let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  let tempDate = new Date(now.getTime());
  tempDate.setMonth(tempDate.getMonth() + months);
  if (tempDate > target) months--;

  let lastMonthDate = new Date(now.getTime());
  lastMonthDate.setMonth(lastMonthDate.getMonth() + months);
  let remainTime = targetMs - lastMonthDate.getTime();

  const days = Math.floor(remainTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainTime % (1000 * 60)) / 1000);

  let res = "";
  if (months > 0) res += `${months}${t.mo || ""}`;
  if (days > 0 || months > 0) res += `${days}${t.dayLabel || ""}`;

  return res + `${hours}${t.h || ""} ${minutes}${t.min || ""} ${seconds}${t.s || ""}${t.remain || ""}`;
}

function getWeekday(date) {
  return i18n && i18n.weekdays ? i18n.weekdays[date.getDay()] : "";
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? i18n.pm || "오후" : i18n.am || "오전";

  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${ampm} ${hours}:${minutes}`;
}

// 💡 1초마다 주기적으로 화면을 리프레시하도록 등록
setInterval(updateTimer, 1000);
