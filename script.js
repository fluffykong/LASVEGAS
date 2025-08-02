 // 🎲 흰색 바탕, 빨강 점 주사위 이미지 (가독성 높게 변경)
const diceImages = [
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-1.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-2.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-3.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-4.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-5.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Dice-red-6.svg"
];

const casinos = [];
let currentPlayer = 1;
let diceLeft = {1: 8, 2: 8};
let money = {1: 0, 2: 0};
let round = 1;
let rolledDice = [];
let bgmPlaying = false;

// 🎆 폭죽 효과 변수
let fireworksCanvas, ctx;
let particles = [];

initGame();

function initGame() {
  const board = document.getElementById("casino-board");
  board.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    let div = document.createElement("div");
    div.className = "casino";
    div.id = `casino-${i}`;
    div.innerHTML = `
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Casino_chip_icon.svg" width="35">
      <div class="money" id="money-${i}"></div>`;
    board.appendChild(div);
    casinos[i] = { p1: 0, p2: 0, money: 0 };
  }
  distributeMoney();
  document.getElementById("message").innerText = `🎉 Player 1 차례!`;

  // 🎆 폭죽 Canvas 초기화
  fireworksCanvas = document.getElementById("fireworks");
  ctx = fireworksCanvas.getContext("2d");
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  animateFireworks();
}

// 🎼 BGM 토글 버튼
document.getElementById("bgm-toggle").addEventListener("click", () => {
  let bgm = document.getElementById("bgm");
  if (!bgmPlaying) {
    bgm.volume = 0.4;
    bgm.play();
    bgmPlaying = true;
    document.getElementById("bgm-toggle").innerText = "🎵 BGM OFF";
  } else {
    bgm.pause();
    bgmPlaying = false;
    document.getElementById("bgm-toggle").innerText = "🎵 BGM ON";
  }
});

// 🎲 주사위 굴리기 버튼 클릭
document.getElementById("roll-btn").addEventListener("click", () => {
   let rollSound = document.getElementById("roll-sound");
   rollSound.currentTime = 0;
   rollSound.play().catch(err => console.log("Sound blocked:", err));
   rollDice();
});

function distributeMoney() {
  for (let i = 1; i <= 6; i++) {
    let cash = Math.floor(Math.random() * 50 + 10) * 1000;
    casinos[i].money = cash;
    document.getElementById(`money-${i}`).innerText = `💵 $${cash.toLocaleString()}`;
  }
}

function rollDice() {
  if (diceLeft[currentPlayer] <= 0) {
    alert(`Player ${currentPlayer} has no dice left!`);
    return;
  }

  rolledDice = [];
  for (let i = 0; i < diceLeft[currentPlayer]; i++) {
    rolledDice.push(Math.floor(Math.random() * 6) + 1);
  }

  const resultDiv = document.getElementById("dice-result");
  resultDiv.innerText = "🎲 주사위 굴리는 중...";
  
  setTimeout(() => {
    // 던진 주사위 결과 표시 (이미지)
    resultDiv.innerHTML = `Player ${currentPlayer} rolled: ` + 
      rolledDice.map(num => `<img src="${diceImages[num-1]}" width="40" style="margin:2px;">`).join(" ");
    showChoiceButtons();
  }, 600);
}

function showChoiceButtons() {
  const area = document.getElementById("choice-area");
  area.innerHTML = "<p>🎯 어떤 숫자 카지노에 둘까요?</p>";
  let uniqueNumbers = [...new Set(rolledDice)];
  uniqueNumbers.forEach(num => {
    let btn = document.createElement("button");
    btn.innerHTML = `<img src="${diceImages[num-1]}" width="30"> (${num})`;
    btn.onclick = () => placeDice(num);
    area.appendChild(btn);
  });
}

function placeDice(num) {
  let count = rolledDice.filter(d => d === num).length;
  casinos[num][`p${currentPlayer}`] += count;

  // 🎲 카지노에 주사위 표시
  let casinoDiv = document.getElementById(`casino-${num}`);
  for (let i = 0; i < count; i++) {
    let diceDiv = document.createElement("div");
    diceDiv.className = "dice";
    diceDiv.innerHTML = `<img src="${diceImages[num-1]}" 
       style="border: 2px solid ${currentPlayer === 1 ? '#ff4d4d' : '#4db8ff'}; border-radius: 5px;">`;
    casinoDiv.appendChild(diceDiv);
  }

  // 📜 게임 로그
  addLog(`Player ${currentPlayer} placed ${count} dice on Casino ${num}`);

  // 남은 주사위 줄이기
  diceLeft[currentPlayer] -= count;
  document.getElementById(`p${currentPlayer}-dice`).innerText = diceLeft[currentPlayer];
  document.getElementById("choice-area").innerHTML = "";

  // ✅ 라운드 끝났는지 확인
  if (diceLeft[1] === 0 && diceLeft[2] === 0) {
    endRound();
    return;
  }

  // ✅ 주사위 다 쓴 사람은 턴 스킵
  do {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } while (diceLeft[currentPlayer] === 0);

  document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;
}

function endRound() {
  document.getElementById("message").innerText = "💰 라운드 종료! 점수 계산 중...";

  for (let i = 1; i <= 6; i++) {
    let p1Count = casinos[i].p1;
    let p2Count = casinos[i].p2;

    if (p1Count === p2Count) continue;
    else if (p1Count > p2Count) {
      money[1] += casinos[i].money;
      flashMoney(i);
    } else {
      money[2] += casinos[i].money;
      flashMoney(i);
    }
  }

  document.getElementById("p1-money").innerText = money[1].toLocaleString();
  document.getElementById("p2-money").innerText = money[2].toLocaleString();

  if (round < 4) {
    round++;
    document.getElementById("round-num").innerText = round;
    diceLeft = {1: 8, 2: 8};
    casinos.forEach(c => { if (c) { c.p1 = 0; c.p2 = 0; } });
    initGame();
    document.getElementById("p1-dice").innerText = "8";
    document.getElementById("p2-dice").innerText = "8";
    currentPlayer = 1;
    startFireworks(); // 🎆 라운드 종료 시 폭죽
  } else {
    endGame();
    startFireworks(); // 🎆 게임 종료 폭죽
  }
}

function flashMoney(casinoNum) {
  const moneyDiv = document.getElementById(`money-${casinoNum}`);
  moneyDiv.classList.add("flash");

  // 🔊 돈 획득 효과음
  let cashSound = document.getElementById("cash-sound");
  cashSound.currentTime = 0;
  cashSound.play().catch(err => console.log("Cash sound blocked:", err));

  setTimeout(() => {
    moneyDiv.classList.remove("flash");
  }, 1000);
}

function endGame() {
  document.getElementById("message").innerText = "🎉 게임 종료!";
  if (money[1] > money[2]) {
    document.getElementById("message").innerText += " 🔴 Player 1 승리!";
  } else if (money[2] > money[1]) {
    document.getElementById("message").innerText += " 🔵 Player 2 승리!";
  } else {
    document.getElementById("message").innerText += " 🤝 무승부!";
  }
  document.getElementById("roll-btn").disabled = true;
}

// 📜 게임 로그 함수
function addLog(text) {
  const logList = document.getElementById("log-list");
  const li = document.createElement("li");
  li.innerText = text;
  logList.prepend(li);
}

// 🎆 폭죽 효과
function startFireworks() {
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * fireworksCanvas.width,
      y: Math.random() * fireworksCanvas.height / 2,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 100
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  particles.forEach((p, index) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    if (p.life <= 0) particles.splice(index, 1);
  });
  requestAnimationFrame(animateFireworks);
}
