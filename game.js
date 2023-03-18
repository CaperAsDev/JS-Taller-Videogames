const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");
const vidasDiv = document.querySelector(".lifes");

const playerPosition = {
  x: undefined,
  y: undefined,
};
const startPosition = {
  x: undefined,
  y: undefined,
};
const endPosition = {
  x: undefined,
  y: undefined,
};
let bombsPosition = [];
let currentLvl = 0;
let lifes = 3;

let canvasSize;
let blocksSize;

window.addEventListener("load", startGame);

function startGame() {
  sizing();
  addEvents();
  window.addEventListener("resize", sizing);
}
function sizing() {
  let windowHeight = window.innerHeight;
  let windowWidth = window.innerWidth;
  if (windowHeight > windowWidth) {
    canvasSize = windowWidth * 0.9;
  } else {
    canvasSize = windowHeight * 0.7;
  }

  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);
  blocksSize = canvasSize / 10;
  console.log("bloque: " + blocksSize);
  console.log("canvas: " + canvasSize);
  initialPaint();
  return blocksSize;
}
function initialPaint(lvl = 0) {
  game.font = blocksSize * 0.9 + "px impact";

  const map = maps[lvl].trim();
  const mapRows = map.split("\n").map((row) => row.trim());
  printLifes();

  for (let row = 0.85; row <= mapRows.length; row++) {
    for (let column = 0; column < 10; column++) {
      const emoji = emojis[mapRows[Math.floor(row)][Math.floor(column)]];
      game.fillText(emoji, blocksSize * column, blocksSize * row);

      if (emoji == "🚪") {
        game.fillText(emojis["PLAYER"], blocksSize * column, blocksSize * row);
        definePositions(playerPosition, column, row);
        definePositions(startPosition, column, row);
      } else if (emoji == "🎁") {
        definePositions(endPosition, column, row);
      } else if (emoji == "💣") {
        bombsPosition.push({ x: blocksSize * column, y: blocksSize * row });
      }
    }
  }
}
function definePositions(obj, col, row) {
  obj.x = blocksSize * col;
  obj.y = blocksSize * row;
}
function addEvents() {
  let buttonsNodes = document.querySelectorAll(".btns button");
  let buttonsTags = Array.from(buttonsNodes);
  buttonsTags.forEach((button) => {
    button.addEventListener("click", (e) => {
      moveCharacter(e.target.id, blocksSize);
    });
  });

  document.addEventListener("keydown", (e) => {
    moveCharacter(e.code, blocksSize);
  });
}
function moveCharacter(dir) {
  game.clearRect(
    playerPosition.x,
    playerPosition.y - blocksSize * 0.85,
    blocksSize,
    blocksSize
  );

  if (detectColission(startPosition)) {
    game.fillText(emojis["O"], startPosition.x, startPosition.y);
  }

  if (dir == "ArrowUp") playerPosition.y = playerPosition.y - blocksSize;
  else if (dir == "ArrowRight")
    playerPosition.x = playerPosition.x + blocksSize;
  else if (dir == "ArrowDown") playerPosition.y = playerPosition.y + blocksSize;
  else if (dir == "ArrowLeft") playerPosition.x = playerPosition.x - blocksSize;

  movementControl();

  game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);

  if (detectColission(endPosition)) {
    currentLvl >= 2 ? (currentLvl = 0) : currentLvl++;
    bombsPosition = [];
    game.clearRect(0, 0, canvasSize, canvasSize);
    initialPaint(currentLvl);
    console.log("You win!!");
  }

  const explotion = bombsPosition.some((bomb) => detectColission(bomb));

  if (explotion) {
    lifes--;
    printLifes();
    if (lifes !== 0) {
      game.clearRect(
        playerPosition.x,
        playerPosition.y - blocksSize * 0.85,
        blocksSize,
        blocksSize
      );

      game.fillText("💥", playerPosition.x, playerPosition.y);

      playerPosition.x = startPosition.x;
      playerPosition.y = startPosition.y;
      game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);

      console.log("You lose!! 💥 one life... total lifes remining: " + lifes);
    } else {
      console.log("Game lost 😵‍💫");
      bombsPosition = [];
      lifes = 3;
      currentLvl = 0;
      game.clearRect(0, 0, canvasSize, canvasSize);
      initialPaint(currentLvl);
    }
  }
}
console.log(-4 < -2);
function movementControl() {
  if (playerPosition.x < -2) playerPosition.x = playerPosition.x + blocksSize;
  else if (playerPosition.x > canvasSize)
    playerPosition.x = playerPosition.x - blocksSize;
  else if (playerPosition.y < -2)
    playerPosition.y = playerPosition.y + blocksSize;
  else if (playerPosition.y > canvasSize)
    playerPosition.y = playerPosition.y - blocksSize;
}

function detectColission({ x, y }) {
  if (
    playerPosition.x - x <= blocksSize * 0.05 &&
    playerPosition.y - y <= blocksSize * 0.05 &&
    playerPosition.x + blocksSize - x >= blocksSize * 0.05 &&
    playerPosition.y + blocksSize - y >= blocksSize * 0.05
  ) {
    return true;
  } else {
    return false;
  }
}
function printLifes() {
  vidasDiv.innerHTML = "❤️".repeat(lifes);
}
