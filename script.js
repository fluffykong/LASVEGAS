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
let diceLeft = { 1: 8, 2: 8 };
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

// BGM 상태
let bgmPlaying = false;

// ✅ BGM 토글
bgmButton.addEventListener("click", () => {
  if (!bgmPlaying) {
    bgm.volume = 0.4;
    bgm.play().then(() => {
      bgmPlaying = true;
      bgmButton.innerText = "🎵 BGM OFF";
    }).catch(err => {
      alert("🔈 브라우저 자동재생 정책 때문에 첫 클릭 후 다시 눌러주세요.");
      console.log("BGM 차단:", err);
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
    casinos[i] = { p1: 0, p2: 0, money: 0 };
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
  if (diceLeft[currentPlayer] <= 0) return;

  // ✅ 🎲 주사위 소리 재생
  rollSound.currentTime = 0;
  rollSound.volume = 1.0;
  rollSound.play().catch(err => {
    alert("🎲 주사위 효과음 재생을 위해 한 번 더 눌러주세요!");
    console.log("Roll Sound 차단:", err);
  });

  const resultDiv = document.getElementById("dice-result");
  resultDiv.innerHTML = "";

  // 🎲 가짜 주사위 5개 (회전 애니메이션)
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

  // 🎯 0.7초 후 실제 주사위 결과 표시
  setTimeout(() => {
    rolledDice = [];
    for (let i = 0; i < diceLeft[currentPlayer]; i++) {
      rolledDice.push(Math.floor(Math.random() * 6) + 1);
    }

    resultDiv.innerHTML = `Player ${currentPlayer} rolled: ` + 
      rolledDice.map(num => `<img src="${diceImages[num-1]}" width="42" 
      style="margin:2px; border:2px solid black; border-radius:8px; background:white; box-shadow:0 0 5px rgba(0,0,0,0.8);">`).join(" ");

    showChoiceButtons();
  }, 700);
}

function showChoiceButtons() {
  const area = document.getElementById("choice-area");
  area.innerHTML = "<p>🎯 어떤 숫자 카지노에 둘까요?</p>";
  [...new Set(rolledDice)].forEach(num => {
    let btn = document.createElement("button");
    btn.innerHTML = `<img src="${diceImages[num-1]}" width="30" style="border:1px solid black; border-radius:5px; background:white;"> (${num})`;
    btn.onclick = () => placeDice(num);
    area.appendChild(btn);
  });
}

function placeDice(num) {
  let count = rolledDice.filter(d => d === num).length;
  casinos[num][`p${currentPlayer}`] += count;

  let casinoDiv = document.getElementById(`casino-${num}`);
  for (let i = 0; i < count; i++) {
    let diceDiv = document.createElement("div");
    diceDiv.className = "dice";
    diceDiv.innerHTML = `<img src="${diceImages[num-1]}" 
      style="border: 2px solid ${currentPlayer === 1 ? '#ff4d4d' : '#4db8ff'}; border-radius: 5px; background:white; box-shadow:0 0 5px rgba(0,0,0,0.8);">`;
    casinoDiv.appendChild(diceDiv);
  }

  diceLeft[currentPlayer] -= count;
  document.getElementById(`p${currentPlayer}-dice`).innerText = diceLeft[currentPlayer];
  document.getElementById("choice-area").innerHTML = "";

  if (diceLeft[1] === 0 && diceLeft[2] === 0) {
    endRound();
    return;
  }

  do {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  } while (diceLeft[currentPlayer] === 0);

  document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;
}

function endRound() {
  document.getElementById("message").innerText = "💰 라운드 종료! 점수 계산 중...";

  // 점수 계산
  for (let i = 1; i <= 6; i++) {
    let p1 = casinos[i].p1;
    let p2 = casinos[i].p2;
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

    // 👏 박수소리 확실히 재생
    clapSound.currentTime = 0;
    clapSound.volume = 1.0;
    clapSound.play().catch(err => {
      alert("👏 박수소리가 차단되었습니다. 화면을 탭하고 다시 눌러주세요!");
      console.log("박수소리 차단:", err);
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
  diceLeft = { 1: 8, 2: 8 };
  casinos.forEach(c => { if (c) { c.p1 = 0; c.p2 = 0; } });
  initGame();
  document.getElementById("p1-dice").innerText = "8";
  document.getElementById("p2-dice").innerText = "8";
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
