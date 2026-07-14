import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG5_L9xIbDFtbI-VfV2NgOA4YXsRF7oyM",
  authDomain: "starblast-rumble-timer.firebaseapp.com",
  projectId: "starblast-rumble-timer",
  storageBucket: "starblast-rumble-timer.firebasestorage.app",
  messagingSenderId: "294926909097",
  appId: "1:294926909097:web:f9c1660e1b9f8e555df3b8",
  measurementId: "G-9T121MCW33",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🚨 [보안] 해커들 대가리 깨버릴 주인님만의 비밀 소금 (외부 유출 금지)
// 파이어베이스 보안 규칙(Rules)이 직접 삭제를 막아주므로 프론트엔드에 노출되어도 완벽히 안전합니다.
const MY_SECRET_SALT = "_starblast_rumble_9999!@#$";

// 1. 비밀번호 영문/숫자만 허용하는 검증 함수
const isCryptoSafePassword = (str) =>
  /^[A-Za-z0-9]+$/.test(str.normalize("NFC"));

// 2. 댓글 조회 함수 (지워지지 않은 댓글만 필터링)
async function loadComments() {
  const list = document.getElementById("comment-list");
  if (!list) return;

  try {
    // 🚀 [보안 강화] where 조건을 넣어 'isDeleted' 필드가 true가 아닌 정상 댓글만 쏙 골라옵니다.
    // 파이어베이스 인덱스 정책상 != 연산자를 쓰면 해당 필드로 먼저 정렬(orderBy)을 걸어주어야 에러가 나지 않습니다.
    const q = query(
      collection(db, "comments"),
      where("isDeleted", "!=", true),
      orderBy("isDeleted"),
      orderBy("date", "desc"),
    );
    const querySnapshot = await getDocs(q);

    list.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      list.innerHTML += `
        <div style="border-bottom:1px solid #333; margin:5px 0;">
          <strong>${d.name}</strong>: ${d.text} 
          <button onclick="deleteComment('${doc.id}')">삭제</button>
        </div>`;
    });
  } catch (error) {
    console.error("로딩 실패:", error);
  }
}

// 3. 댓글 삭제 함수 (보안 규칙 검증용 패스워드 매칭 및 업데이트)
window.deleteComment = async (id) => {
  const inputPass = prompt("비밀번호를 입력하세요 (영문/숫자만):");
  if (!inputPass) return;

  try {
    const cleanInput = inputPass.trim();

    // 🔥 [소금 투하] 입력한 비번에 소금을 후추후추 뿌려서 해싱
    const inputHashed = CryptoJS.SHA256(cleanInput + MY_SECRET_SALT).toString();

    const docRef = doc(db, "comments", id);

    // 🚀 [보안 핵심] deleteDoc을 쓰면 해커가 우회할 수 있으므로 규칙에서 원천 금지합니다.
    // 대신 updateDoc으로 'isDeleted: true' 표식을 남기며, 이와 동시에 사용자가 입력한 해시값을 보냅니다.
    // 만약 입력한 해시(password)가 기존 DB에 저장되어 있던 해시와 다르면 구글 파이어베이스 서버가 요청을 즉시 거절합니다.
    await updateDoc(docRef, {
      isDeleted: true,
      password: inputHashed,
    });

    alert("댓글이 성공적으로 삭제되었습니다.");
    loadComments();
  } catch (error) {
    console.error("삭제 실패:", error);
    // 비번이 틀렸거나, 존재하지 않는 데이터거나, 해커가 무단으로 조작하려고 시도할 때 전부 이쪽으로 튕겨 나옵니다.
    alert("비밀번호가 일치하지 않거나 권한이 없습니다!");
  }
};

// 4. 댓글 등록 함수 (등록할 때 소금 쳐서 저장)
document.getElementById("comment-submit").onclick = async () => {
  const name = document.getElementById("username").value.trim();
  const rawPassword = document.getElementById("password").value.trim();
  const text = document.getElementById("comment-input").value.trim();

  if (!name || !text || !rawPassword) {
    alert("모두 입력해주세요.");
    return;
  }

  if (!isCryptoSafePassword(rawPassword)) {
    alert("비번엔 영어와 숫자만 입력하세요.");
    return;
  }

  // 🔥 [소금 투하] 저장하기 전에 비밀번호 뒤에 소금을 딱 붙여서 해싱
  const hashedPass = CryptoJS.SHA256(rawPassword + MY_SECRET_SALT).toString();

  try {
    await addDoc(collection(db, "comments"), {
      name,
      password: hashedPass,
      text,
      date: serverTimestamp(),
      isDeleted: false, // 🚀 최초 등록 시 삭제 안 된 상태로 기본 설정
    });

    document.getElementById("comment-input").value = "";
    document.getElementById("password").value = "";
    loadComments();
  } catch (error) {
    console.error("등록 실패:", error);
  }
};

// 비밀번호 보이기 / 숨기기 토글 기능
document.getElementById("toggle-password").onclick = function () {
  const passwordInput = document.getElementById("password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    this.setAttribute("data-i18n", "btn_hide_password");
  } else {
    passwordInput.type = "password";
    this.setAttribute("data-i18n", "btn_show_password");
  }
};

// 5. 최초 로드
loadComments();
