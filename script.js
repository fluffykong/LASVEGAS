const diceImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Dice-1-b.svg/512px-Dice-1-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Dice-2-b.svg/512px-Dice-2-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Dice-3-b.svg/512px-Dice-3-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Dice-4-b.svg/512px-Dice-4-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Dice-5-b.svg/512px-Dice-5-b.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Dice-6-b.svg/512px-Dice-6-b.svg.png"
];

const casinos = [];
let currentPlayer = 1; // 현재 턴 (1=빨강, 2=파랑)
let diceLeft = { 1: 8, 2: 8, neutral1: 2, neutral2: 2 };
let money = { 1: 0, 2: 0 }; // Player1=빨강, Player2=파랑
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
let lastRoundWinner = 1; // 다음 라운드 시작 플레이어

// ✅ BGM 버튼 이벤트
bgmButton.addEventListener("click", () => {
  if (!bgmPlaying) {
    bgm.volume = 0.4;
    bgm.play().then(() => {
      bgmPlaying = true;
      bgmButton.innerText = "🎵 BGM OFF";
    }).catch(err => {
      console.log("🎵 BGM 시작 차단:", err);
      alert("🔊 첫 클릭에서는 BGM이 자동재생되지 않을 수 있어요. 한 번 더 눌러주세요!");
    });
  } else {
    bgm.pause();
    bgmPlaying = false;
    bgmButton.innerText = "🎵 BGM ON";
  }
});

initGame();

// ✅ 게임 초기화
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
    casinos[i] = { p1: 0, p2: 0, neutral: 0, money: [] };
  }
  distributeMoney();
  document.getElementById("message").innerText = `🎉 Player ${currentPlayer} 차례!`;

  fireworksCanvas = document.getElementById("fireworks");
  ctx = fireworksCanvas.getContext("2d");
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  animateFireworks();
}

document.getElementById("roll-btn").addEventListener("click", rollDice);

// ✅ 점수 배치
function distributeMoney() {
  for (let i = 1; i <= 6; i++) {
    let firstCash = Math.floor(Math.random() * 50 + 10) * 1000;
    casinos[i].money.push(firstCash);

    // 30,000 미만이면 한 장 더 깔기
    if (firstCash < 30000) {
      let secondCash;
      do {
        secondCash = Math.floor(Math.random() * 50 + 10) * 1000;
      } while (firstCash + secondCash < 30000);
      casinos[i].money.push(secondCash);
    }
    updateMoneyDisplay(i);
  }
}

function updateMoneyDisplay(i) {
  const moneyDiv = document.getElementById(`money-${i}`);
  moneyDiv.innerHTML = casinos[i].money.map(m => `💵 $${m.toLocaleString()}`).join("<br>");
}

/* 🎲 주사위 굴리기 */
function rollDice() {
  if (diceLeft[currentPlayer] <= 0 && diceLeft[`neutral${currentPlayer}`] <= 0) return;

  rollSound.currentTime = 0;
  rollSound.volume = 1.0;
  rollSound.play().catch(err => console.log("🎲 주사위 소리 차단:", err));

  const resultDiv = document.getElementById("dice-result");
  resultDiv.innerHTML = "";

  // 굴리기 전 애니메이션
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
    for (let i = 0; i < diceLeft[currentPlayer]; i++) {
      rolledDice.push({ value: Math.floor(Math.random() * 6) + 1, type: currentPlayer });
    }
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

  [...new Set(rolledDice.map(d => d.value))].forEach(num => {
    let btn = document.createElement("button");
    btn.innerHTML = `<img src="${diceImages[num-1]}" width="30" style="border:1px solid black; border-radius:5px; background:white;"> (${num})`;
    btn.onclick = () => placeDice(num);
    area.appendChild(btn);
  });
}

function placeDice(num) {
  let selected = rolledDice.filter(d => d.value === num);

  selected.forEach(die => {
    if (die.type === "neutral") {
      casinos[num].neutral += 1;
    } else {
      casinos[num][`p${die.type}`] += 1; // type=1은 빨강, type=2는 파랑
    }
  });

  let casinoDiv = document.getElementById(`casino-${num}`);
  selected.forEach(die => {
    let diceDiv = document.createElement("div");
    diceDiv.className = "dice";
    diceDiv.innerHTML = `<img src="${diceImages[die.value-1]}" 
      style="border: 2px solid ${die.type === 1 ? '#ff4d4d' : die.type === 2 ? '#4db8ff' : 'green'}; border-radius: 5px; background:white;">`;
    casinoDiv.appendChild(diceDiv);
  });

  let normalDiceUsed = selected.filter(d => d.type !== "neutral").length;
  let neutralDiceUsed = selected.filter(d => d.type === "neutral").length;

  diceLeft[currentPlayer] -= normalDiceUsed;
  diceLeft[`neutral${currentPlayer}`] -= neutralDiceUsed;

  document.getElementById(`p${currentPlayer}-dice`).innerText =
    diceLeft[currentPlayer] + (diceLeft[`neutral${currentPlayer}`] > 0 ? ` (+${diceLeft[`neutral${currentPlayer}`]}🟢)` : "");

  document.getElementById("choice-area").innerHTML = "";

  // 라운드 종료 체크
  if ((diceLeft[1] <= 0 && diceLeft["neutral1"] <= 0) &&
      (diceLeft[2] <= 0 && diceLeft["neutral2"] <= 0)) {
    endRound();
    return;
  }

  // 턴 넘김 (순서만 변경)
  do {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } while (diceLeft[currentPlayer] <= 0 && diceLeft[`neutral${currentPlayer}`] <= 0);

  document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;
}

/* ✅ 라운드 종료 → 점수 계산 */
function endRound() {
  document.getElementById("message").innerText = "💰 라운드 종료! 점수 계산 중...";
  let p1RoundScore = 0;
  let p2RoundScore = 0;

  for (let i = 1; i <= 6; i++) {
    let p1 = casinos[i].p1; // 빨강
    let p2 = casinos[i].p2; // 파랑
    let neutral = casinos[i].neutral;

    // 1️⃣ 중립이 가장 많으면 → 점수 없음
    if (neutral > p1 && neutral > p2) continue;

    // 2️⃣ 세 값이 모두 같으면 → 무승부
    if (p1 === p2 && p2 === neutral) continue;

    // ✅ 3️⃣ 중립과 같은 수인 플레이어 제거
    if (p1 === neutral && p1 > 0) {
      p1 = 0;
      neutral = 0;
    } else if (p2 === neutral && p2 > 0) {
      p2 = 0;
      neutral = 0;
    }

    // ✅ 4️⃣ 남은 주사위로 승자 판정 및 점수 분배
    const boardMoney = casinos[i].money;

    if (p1 > p2 && p1 > neutral) {
      if (boardMoney.length === 2) {
        if (p2 > 0) {
          // 두 명 다 올림 → 큰 점수 Player1, 작은 점수 Player2
          const high = Math.max(...boardMoney);
          const low = Math.min(...boardMoney);
          money[1] += high;
          money[2] += low;
          p1RoundScore += high;
          p2RoundScore += low;
        } else {
          // Player1만 남음 → 큰 점수 하나만 획득
          const onlyOne = Math.max(...boardMoney);
          money[1] += onlyOne;
          p1RoundScore += onlyOne;
        }
      } else {
        money[1] += boardMoney[0];
        p1RoundScore += boardMoney[0];
      }
    } else if (p2 > p1 && p2 > neutral) {
      if (boardMoney.length === 2) {
        if (p1 > 0) {
          // 두 명 다 올림 → 큰 점수 Player2, 작은 점수 Player1
          const high = Math.max(...boardMoney);
          const low = Math.min(...boardMoney);
          money[2] += high;
          money[1] += low;
          p2RoundScore += high;
          p1RoundScore += low;
        } else {
          // Player2만 남음 → 큰 점수 하나만 획득
          const onlyOne = Math.max(...boardMoney);
          money[2] += onlyOne;
          p2RoundScore += onlyOne;
        }
      } else {
        money[2] += boardMoney[0];
        p2RoundScore += boardMoney[0];
      }
    }
    // ⚖️ p1 === p2 → 무승부 → 점수 없음
  }

  // ✅ 라운드 승자 기록 (다음 라운드 선 플레이어)
  if (p1RoundScore > p2RoundScore) {
    lastRoundWinner = 1;
  } else if (p2RoundScore > p1RoundScore) {
    lastRoundWinner = 2;
  } else {
    lastRoundWinner = 1;
  }

  // ✅ 점수판 업데이트
  let overallWinner = (money[1] > money[2]) ? "Player 1" :
                      (money[2] > money[1]) ? "Player 2" : "Draw";

  roundResults.push({ round, p1: money[1], p2: money[2], winner: overallWinner });
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
    document.getElementById("message").innerText = `🎉 게임 종료! 🏆 ${overallWinner} 승리!`;

    clapSound.currentTime = 0;
    clapSound.volume = 1.0;
    clapSound.play().catch(err => console.log("👏 박수소리 차단:", err));

    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    document.getElementById("roll-btn").disabled = true;
  }
}

/* ✅ 다음 라운드 시작 */
function startNextRound() {
  round++;
  document.getElementById("round-num").innerText = round;

  diceLeft = { 1: 8, 2: 8, neutral1: 2, neutral2: 2 };
  casinos.forEach(c => { if (c) { c.p1 = 0; c.p2 = 0; c.neutral = 0; c.money = []; } });
  initGame();

  document.getElementById("p1-dice").innerText = "8 (+2🟢)";
  document.getElementById("p2-dice").innerText = "8 (+2🟢)";
  currentPlayer = lastRoundWinner; // ✅ 다음 라운드 선 플레이어만 변경

  document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;

  const nextBtn = document.getElementById("next-round-btn");
  if (nextBtn) nextBtn.remove();
}

/* ✅ 점수판 갱신 */
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

/* 🎆 폭죽 효과 */
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
