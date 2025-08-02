const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const casinos = [];
let currentPlayer = 1;
let diceLeft = {1: 8, 2: 8};
let money = {1: 0, 2: 0};
let round = 1;
let rolledDice = [];

initGame();

function initGame() {
  const board = document.getElementById("casino-board");
  board.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    let div = document.createElement("div");
    div.className = "casino";
    div.id = `casino-${i}`;
    div.innerHTML = `<div class="money" id="money-${i}"></div>`;
    board.appendChild(div);
    casinos[i] = { p1: 0, p2: 0, money: 0 };
  }
  distributeMoney();
  document.getElementById("message").innerText = `🎉 Player 1 차례!`;
}

function distributeMoney() {
  for (let i = 1; i <= 6; i++) {
    let cash = Math.floor(Math.random() * 50 + 10) * 1000;
    casinos[i].money = cash;
    document.getElementById(`money-${i}`).innerText = `💵 $${cash.toLocaleString()}`;
  }
}

document.getElementById("roll-btn").addEventListener("click", rollDice);

function rollDice() {
  if (diceLeft[currentPlayer] <= 0) {
    alert(`Player ${currentPlayer} has no dice left!`);
    return;
  }

  // 🔊 주사위 굴리는 소리 재생
  document.getElementById("roll-sound").play();

  rolledDice = [];
  for (let i = 0; i < diceLeft[currentPlayer]; i++) {
    rolledDice.push(Math.floor(Math.random() * 6) + 1);
  }

  const resultDiv = document.getElementById("dice-result");
  resultDiv.innerText = "🎲 주사위 굴리는 중...";
  setTimeout(() => {
    // 주사위 아이콘 표시
    const diceIcons = rolledDice.map(num => diceFaces[num-1]).join(" ");
    resultDiv.innerText = `Player ${currentPlayer} rolled: ${diceIcons}`;
    showChoiceButtons();
  }, 600);
}

function showChoiceButtons() {
  const area = document.getElementById("choice-area");
  area.innerHTML = "<p>🎯 어떤 숫자 카지노에 둘까요?</p>";
  let uniqueNumbers = [...new Set(rolledDice)];
  uniqueNumbers.forEach(num => {
    let btn = document.createElement("button");
    btn.innerText = `${diceFaces[num-1]} (${num})`;
    btn.onclick = () => placeDice(num);
    area.appendChild(btn);
  });
}

function placeDice(num) {
  let count = rolledDice.filter(d => d === num).length;
  casinos[num][`p${currentPlayer}`] += count;

  // 🎲 주사위 배치
  let casinoDiv = document.getElementById(`casino-${num}`);
  for (let i = 0; i < count; i++) {
    let diceIcon = document.createElement("div");
    diceIcon.className = "dice";
    diceIcon.innerText = diceFaces[num-1];
    diceIcon.style.color = currentPlayer === 1 ? "#ff4d4d" : "#4db8ff";
    casinoDiv.appendChild(diceIcon);
  }

  // 주사위 감소
  diceLeft[currentPlayer] -= count;
  document.getElementById(`p${currentPlayer}-dice`).innerText = diceLeft[currentPlayer];
  document.getElementById("choice-area").innerHTML = "";

  // 턴 교체 or 라운드 종료
  if (diceLeft[1] === 0 && diceLeft[2] === 0) {
    endRound();
  } else {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.getElementById("message").innerText = `🎯 Player ${currentPlayer} 차례!`;
  }
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
  } else {
    endGame();
  }
}

function flashMoney(casinoNum) {
  const moneyDiv = document.getElementById(`money-${casinoNum}`);
  moneyDiv.classList.add("flash");

  // 🔊 돈 획득 효과음
  document.getElementById("cash-sound").play();

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
