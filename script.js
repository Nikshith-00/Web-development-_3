const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const modeButtons = document.querySelectorAll(".mode");
const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawScoreEl = document.getElementById("drawScore");

const wins = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let mode = "ai";
let scores = { X: 0, O: 0, draws: 0 };

cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);

    if (gameOver || board[index] !== "") return;
    if (mode === "ai" && currentPlayer === "O") return;

    makeMove(index, currentPlayer);

    if (!gameOver && mode === "ai" && currentPlayer === "O") {
      statusText.textContent = "Computer is thinking...";
      setTimeout(computerMove, 400);
    }
  });
});

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;

    modeButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    resetGame();
  });
});

resetBtn.addEventListener("click", resetGame);

function makeMove(index, player) {
  board[index] = player;
  render();

  const result = checkWinner();

  if (result) {
    finishGame(result.winner, result.line);
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";

  if (mode === "ai") {
    statusText.textContent =
      currentPlayer === "X" ? "Your turn — X" : "Computer's turn — O";
  } else {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function render() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.toggle("o", board[index] === "O");
    cell.disabled = board[index] !== "" || gameOver;
  });
}

function checkWinner() {
  for (const line of wins) {
    const [a, b, c] = line;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { winner: board[a], line };
    }
  }

  if (board.every(cell => cell !== "")) {
    return { winner: "draw", line: [] };
  }

  return null;
}

function finishGame(winner, line) {
  gameOver = true;

  if (winner === "draw") {
    scores.draws++;
    statusText.textContent = "It's a draw! 🤝";
  } else {
    scores[winner]++;
    statusText.textContent =
      mode === "ai"
        ? (winner === "X" ? "You win! 🎉" : "Computer wins! 🤖")
        : `Player ${winner} wins! 🎉`;

    line.forEach(index => cells[index].classList.add("winner"));
  }

  updateScores();
  render();
}

function computerMove() {
  if (gameOver || mode !== "ai" || currentPlayer !== "O") return;

  const bestMove = findBestMove();
  makeMove(bestMove, "O");
}

function findBestMove() {
  // Try to win.
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (checkWinner()?.winner === "O") {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }

  // Block the player.
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (checkWinner()?.winner === "X") {
        board[i] = "";
        return i;
      }
      board[i] = "";
    }
  }

  // Prefer center.
  if (board[4] === "") return 4;

  // Prefer corners.
  const corners = [0, 2, 6, 8].filter(i => board[i] === "");
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Any remaining cell.
  const available = board
    .map((value, index) => value === "" ? index : null)
    .filter(index => index !== null);

  return available[Math.floor(Math.random() * available.length)];
}

function updateScores() {
  xScoreEl.textContent = scores.X;
  oScoreEl.textContent = scores.O;
  drawScoreEl.textContent = scores.draws;
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;

  cells.forEach(cell => {
    cell.classList.remove("winner");
  });

  statusText.textContent =
    mode === "ai" ? "Your turn — X" : "Player X's turn";

  render();
}
