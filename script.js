const fullAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let availableLetters = [...fullAlphabet];
let usedLetters = [];
let currentLetter = '';
let gameCleared = false;
let lastPressed = '';
let correctAudio = null;
let wrongAudio = null;

const progress = document.getElementById("progress");
const letterElem = document.getElementById("letter");
const messageElem = document.getElementById("message");
const congratsElem = document.getElementById("congrats");
const correctLettersElem = document.getElementById("correct-letters");
const recordingStatus = document.getElementById("recording-status");
const characterImg = document.getElementById("character");
const speechBubble = document.getElementById("speech-bubble");

function getRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}
function getRandomStrongColor() {
  const colors = [
    "#FF0000", "#00AAFF", "#00CC00", "#FFAA00",
    "#9900FF", "#FF0099", "#0000FF", "#FF6600", "#0066FF", "#009900"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
function updateProgress() {
  progress.textContent = `${usedLetters.length + 1} / 26`;
}
function pickNewLetter() {
  if (availableLetters.length === 0) {
    showCongrats();
    return;
  }
  const index = Math.floor(Math.random() * availableLetters.length);
  currentLetter = availableLetters.splice(index, 1)[0];
  const textColor = getRandomStrongColor();
  const shadowColor = getRandomPastelColor();
  letterElem.textContent = currentLetter;
  letterElem.style.color = textColor;
  letterElem.style.textShadow = `
    0 0 10px ${shadowColor},
    0 0 20px ${shadowColor},
    0 0 30px ${shadowColor},
    0 0 40px ${shadowColor}
  `;
  messageElem.textContent = '';
  updateProgress();
  updateCharacter();
}
function updateCharacter() {
  const count = usedLetters.length;
  if (count < 5) {
    characterImg.src = "images/img1.png";
    speechBubble.textContent = "がんばってね！";
  } else if (count < 10) {
    characterImg.src = "images/img2.png";
    speechBubble.textContent = "いい調子！";
  } else if (count < 15) {
    characterImg.src = "images/img3.png";
    speechBubble.textContent = "あと半分！";
  } else if (count < 20) {
    characterImg.src = "images/img4.png";
    speechBubble.textContent = "もうちょっと！";
  } else {
    characterImg.src = "images/img5.png";
    speechBubble.textContent = "さいごまでがんばろう！";
  }
}
function showStars(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.textContent = "⭐";
    const angle = Math.random() * 2 * Math.PI;
    const radius = 100 + Math.random() * 100;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty('--x', `${offsetX}px`);
    star.style.setProperty('--y', `${offsetY}px`);
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1000);
  }
}
function showCongrats() {
  gameCleared = true;
  congratsElem.textContent = "コンプリート！🎉";
  const rect = letterElem.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  showStars(centerX, centerY, 100);
  setTimeout(() => {
    congratsElem.textContent = "";
    gameCleared = false;
    availableLetters = [...fullAlphabet];
    usedLetters = [];
    correctLettersElem.textContent = "";
    updateProgress();
    pickNewLetter();
  }, 5000);
}
document.addEventListener("keydown", (e) => {
  if (gameCleared) return;
  const pressed = e.key.toUpperCase();
  if (pressed === lastPressed) return;
  lastPressed = pressed;
  if (pressed === currentLetter) {
    usedLetters.push(currentLetter);
  
    // 正解文字を整形して表示（13個ごとに改行）
    let formatted = "";
    for (let i = 0; i < usedLetters.length; i++) {
      formatted += usedLetters[i] + " ";
      if ((i + 1) % 13 === 0) formatted += "<br>";
    }
    correctLettersElem.innerHTML = formatted;
  
    messageElem.textContent = "すごいね！🎉";
    if (correctAudio) {
      correctAudio.currentTime = 0;
      correctAudio.play();
    }
  
    const rect = letterElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    showStars(centerX, centerY);
  
    setTimeout(() => {
      lastPressed = '';
      pickNewLetter();
    }, 500);
  } else {
    messageElem.textContent = `ちがうよ〜！（押したのは：${pressed}）`;
    if (wrongAudio) {
      wrongAudio.currentTime = 0;
      wrongAudio.play();
    }
    setTimeout(() => lastPressed = '', 200);
  }
});
pickNewLetter();

let mediaRecorder;
let audioChunks = [];
function startRecording(callback) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      callback(new Audio(url));
      recordingStatus.textContent = "録音完了 ✅";
    };
    mediaRecorder.start();
    recordingStatus.textContent = "録音中...もう一度押すと停止";
  }).catch(() => {
    alert("マイクへのアクセスが拒否されました。");
  });
}
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}
document.getElementById("record-correct-btn").addEventListener("click", () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    startRecording(audio => correctAudio = audio);
  } else {
    stopRecording();
  }
});
document.getElementById("record-wrong-btn").addEventListener("click", () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    startRecording(audio => wrongAudio = audio);
  } else {
    stopRecording();
  }
});