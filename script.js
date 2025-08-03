const diceImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Dice-1-b.svg/512px-Dice-1-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Dice-2-b.svg/512px-Dice-2-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Dice-3-b.svg/512px-Dice-3-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Dice-4-b.svg/512px-Dice-4-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Dice-5-b.svg/512px-Dice-5-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Dice-6-b.svg/512px-Dice-6-b.svg.png"
];

const casinos = [];
let currentPlayer = 1;
let diceLeft = { 1: 8, 2: 8, neutral1: 2, neutral2: 2 }; 
let money = { 1: 0, 2: 0 };
let round = 1;
let rolledDice = [];
let roundResults = [];

// 🎆 폭죽 효과
let fireworksCanvas, ctx;
let particles = [];

// 🔊 사운드
const bgm = document.getElementById("bgm");
const bgmButton = document.getElementById("bgm-toggle");
const clapSound = document.getElementById("clap-sound");
const rollSound = document.getElementById("roll-sound");

let bgmPlaying = false;

// ✅ BGM 토글
bgmButton.addEventListener("click", () => {
  if (!bgmPlaying) {
    bgm.volume = 0.4;
    bgm.play().then(() => {
      bgmPlaying = true;
      bgmButton.innerText = "🎵 BGM OFF";
    }).catch(err => {
      console.log("BGM 자동재생 차단:", err);
    });
  } else {
    bgm.pause();
    bgmPlaying = false;
    bgmButton.innerText = "🎵 BGM ON";
  }
});

initGame();

function initGame() {
  const board = document.getElementById("casino-board");
  board.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    let div = document.createElement("div");
    div.className = "casino";
    div.id = `casino-${i}`;
    div.innerHTML = `
      <div class="casino-header">
        <img class="chip" src="https://i.imgur.com/tqQY3Up.png" width="30">
        <span class="casino-number">🎰 ${i}</span>
      </div>
      <div class="money" id="money-${i}"></div>
    `;
    board.appendChild(div);
    casinos[i] = { p1: 0, p2: 0, neutral: 0, money: 0 };
  }
  distributeMoney();
  document.getElementById("message").innerText = `🎉 Player 1 차례!`;

  fireworksCanvas = document.getElementById("fireworks");
  ctx = fireworksCanvas.getContext("2d");
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  animateFireworks();
}

document.getElementById("roll-btn").addEventListener("click", rollDice);

function distributeMoney() {
  for (let i = 1; i <= 6; i++) {
    let cash = Math.floor(Math.random() * 50 + 10) * 1000;
    casinos[i].money = cash;
    document.getElementById(`money-${i}`).innerText = `💵 $${cash.toLocaleString()}`;
  }
}

/* 🎲 주사위 굴릴 때 효과음 + 회전 효과 */
function rollDice() {
  // ✅ 남은 주사위 없으면 리턴
  if (diceLeft[currentPlayer] <= 0 && diceLeft[`neutral${currentPlayer}`] <= 0) return;

  // ✅ 🎲 효과음
  rollSound.currentTime = 0;
  rollSound.volume = 1.0;
  rollSound.play().catch(err => {
    console.log("🎲 주사위 소리 차단됨:", err);
  });

  const resultDiv = document.getElementById("dice-result");
  resultDiv.innerHTML = "";

  // 🎲 회전 주사위 표시
  for (let i = 0; i < 5; i++) {
    let dummyDice = document.createElement("img");
    dummyDice.src = diceImages[Math.floor(Math.random() * 6)];
    dummyDice.classList.add("rolling");
    dummyDice.style.width = "42px";
    dummyDice.style.margin = "2px";
    dummyDice.style.border = "2px solid black";
    dummyDice.style.borderRadius = "8px";
    dummyDice.style.background = "white";
    resultDiv.appendChild(dummyDice);
  }

  setTimeout(() => {
    rolledDice = [];

    // ✅ 플레이어 색 주사위 굴림
    for (let i = 0; i < diceLeft[currentPlayer]; i++) {
      rolledDice.push({ value: Math.floor(Math.random() * 6) + 1, type: currentPlayer });
    }
    // ✅ 중립 주사위 굴림
    for (let i = 0; i < diceLeft[`neutral${currentPlayer}`]; i++) {
      rolledDice.push({ value: Math.floor(Math.random() * 6) + 1, type: "neutral" });
    }

    resultDiv.innerHTML = `Player ${currentPlayer} rolled: ` + 
      rolledDice.map(d => `<img src="${diceImages[d.value-1]}" width="42" 
        style="margin:2px; border:2px solid ${d.type === 1 ? '#ff4d4d' : d.type === 2 ? '#4db8ff' : 'green'}; border-radius:8px; background:white;">`).join(" ");

    showChoiceButtons();
  }, 700);
}

function showChoiceButtons() {
  const area = document.getElementById("choice-area");
  area.innerHTML = "<p>🎯 어떤 숫자 카지노에 둘까요?</p>";

  // 중복 제거 후 버튼 생성
  [...new Set(rolledDice.map(d => d.value))].forEach(num => {
    let btn = document.createElement("button");
    btn.innerHTML = `<img src="${diceImages[num-1]}" width="30" style="border:1px solid black; border-radius:5px; background:white;"> (${num})`;
    btn.onclick = () => placeDice(num);
    area.appendChild(btn);
  });
}

function placeDice(num) {
  // 선택된 눈금
  let selected = rolledDice.filter(d => d.value === num);

  // 카지노에 추가
  selected.forEach(die => {
    if (die.type === "neutral") {
      casinos[num].neutral += 1;
    } else {
      casinos[num][`p${die.type}`] += 1;
    }
  });

  // 🎲 UI에 주사위 표시
  let casinoDiv = document.getElementById(`casino-${num}`);
  selected.forEach(die => {
    let diceDiv = document.createElement("div");
    diceDiv.className = "dice";
    diceDiv.innerHTML = `<img src="${diceImages[die.value-1]}" 
      style="border: 2px solid ${die.type === 1 ? '#ff4d4d' : die.type === 2 ? '#4db8ff' : 'green'}; border-radius: 5px; background:white;">`;
    casinoDiv.appendChild(diceDiv);
  });

  // 🎲 남은 주사위 차감
  let normalDiceUsed = selected.filter(d => d.type !== "neutral").length;
  let neutralDiceUsed = selected.filter(d => d.type === "neutral").length;

  diceLeft[currentPlayer] -= normalDiceUsed;
  diceLeft[`neutral${currentPlayer}`] -= neutralDiceUsed;

  document.getElementById(`p${currentPlayer}-dice`).innerText =
    diceLeft[currentPlayer] + (diceLeft[`neutral${currentPlayer}`] > 0 ? ` (+${diceLeft[`neutral${currentPlayer}`]}🟢)` : "");

  document.getElementById("choice-area").innerHTML = "";

  // ✅ 라운드 종료 체크
  if ((diceLeft[1] <= 0 && diceLeft["neutral1"] <= 0) &&
      (diceLeft[2] <= 0 && diceLeft["neutral2"] <= 0)) {
    endRound();
    return;
  }

  // ✅ 턴 넘김
  do {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } while (diceLeft[currentPlayer] <= 0 && diceLeft[`neutral${currentPlayer}`] <= 0);

  document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;
}

function endRound() {
  document.getElementById("message").innerText = "💰 라운드 종료! 점수 계산 중...";

  // ✅ 점수 계산
  for (let i = 1; i <= 6; i++) {
    let p1 = casinos[i].p1;
    let p2 = casinos[i].p2;
    // ✅ 중립 주사위는 점수 계산에 불포함
    if (p1 > p2) money[1] += casinos[i].money;
    else if (p2 > p1) money[2] += casinos[i].money;
  }

  let winner = (money[1] > money[2]) ? "Player 1" : (money[2] > money[1]) ? "Player 2" : "Draw";

  roundResults.push({ round, p1: money[1], p2: money[2], winner });
  updateScoreboard();

  document.getElementById("p1-money").innerText = money[1].toLocaleString();
  document.getElementById("p2-money").innerText = money[2].toLocaleString();

  if (round < 4) {
    const controls = document.getElementById("controls");
    let nextBtn = document.createElement("button");
    nextBtn.id = "next-round-btn";
    nextBtn.innerText = "👉 다음 라운드 시작";
    nextBtn.onclick = () => startNextRound();
    controls.appendChild(nextBtn);
  } else {
    // ✅ 최종 라운드 종료 → 폭죽 + 박수소리
    document.getElementById("message").innerText = `🎉 게임 종료! 🏆 ${winner} 승리!`;

    // 👏 박수소리 재생
    clapSound.currentTime = 0;
    clapSound.volume = 1.0;
    clapSound.play().catch(err => {
      console.log("👏 박수소리 차단됨:", err);
    });

    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    document.getElementById("roll-btn").disabled = true;
  }
}

function startNextRound() {
  round++;
  document.getElementById("round-num").innerText = round;

  diceLeft = { 1: 8, 2: 8, neutral1: 2, neutral2: 2 };
  casinos.forEach(c => { if (c) { c.p1 = 0; c.p2 = 0; c.neutral = 0; } });
  initGame();
  document.getElementById("p1-dice").innerText = "8 (+2🟢)";
  document.getElementById("p2-dice").innerText = "8 (+2🟢)";
  currentPlayer = 1;

  const nextBtn = document.getElementById("next-round-btn");
  if (nextBtn) nextBtn.remove();
}

function updateScoreboard() {
  const tbody = document.getElementById("scoreboard-body");
  tbody.innerHTML = "";
  roundResults.forEach(r => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.round}</td>
      <td>${r.p1.toLocaleString()}</td>
      <td>${r.p2.toLocaleString()}</td>
      <td>${r.winner}</td>
    `;
    tbody.appendChild(row);
  });
}

/* 🎆 폭죽 관련 */
function createParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    dx: (Math.random() - 0.5) * 4,
    dy: (Math.random() - 0.5) * 4,
    life: 100
  };
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
