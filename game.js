const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");
const vidasDiv = document.querySelector(".lifes");
const statusTime = document.querySelector(".status__time");
const statusRecord = document.querySelector(".status__record");

const playerPosition = {
  x: undefined,
  y: undefined,
  col: undefined,
  row: undefined,
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

let record;
let mytime;
let timeStart;
let timeInterval;

let canvasSize;
let blocksSize;

window.addEventListener("load", startGame);

function startGame() {
  record = JSON.parse(localStorage.getItem("timeRecord"));
  statusRecord.innerHTML = record?.string || "Aun no hay record";
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
  initialPaint(currentLvl);
  return blocksSize;
}
function initialPaint(lvl = 0) {
  bombsPosition = [];
  game.font = blocksSize * 0.9 + "px impact";

  const map = maps[lvl].trim();
  const mapRows = map.split("\n").map((row) => row.trim());
  printLifes();

  for (let row = 0.85; row <= mapRows.length; row++) {
    for (let column = 0; column < 10; column++) {
      const emoji = emojis[mapRows[Math.floor(row)][Math.floor(column)]];
      game.fillText(emoji, blocksSize * column, blocksSize * row);

      if (emoji == "🚪") {
        if (playerPosition.col == undefined) {
          definePositions(playerPosition, column, row);
          playerPosition.row = row;
          playerPosition.col = column;
          startPosition.row = row;
          startPosition.col = column;
        } else {
          definePositions(
            playerPosition,
            playerPosition.col,
            playerPosition.row
          );
        }
        game.fillText(
          emojis["PLAYER"],
          blocksSize * playerPosition.col,
          blocksSize * playerPosition.row
        );
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
function startTimeCounter() {
  timeInterval = setInterval(showTime, 100);
  return Date.now();
}
function gameFinished(status) {
  currentLvl = 0;
  playerPosition.row = undefined;
  playerPosition.col = undefined;
  clearInterval(timeInterval);
  timeStart = undefined;
  if (status == "won") {
    if (record) {
      let better =
        mytime.min <= record.min
          ? mytime.seg < record.seg
            ? true
            : mytime.seg == record.seg
            ? mytime.cent < record.cent
            : false
          : false;
      console.log(better);
      if (better) {
        localStorage.setItem("timeRecord", JSON.stringify(mytime));
        alert("lograste un nuevo record");
        statusRecord.innerHTML = mytime.string;
      }
    } else {
      localStorage.setItem("timeRecord", JSON.stringify(mytime));
      statusRecord.innerHTML = mytime.string;
    }
  }
}
function moveCharacter(dir) {
  timeStart = timeStart || startTimeCounter();
  game.clearRect(
    playerPosition.x,
    playerPosition.y - blocksSize * 0.85,
    blocksSize,
    blocksSize
  );

  if (detectColission(startPosition)) {
    game.fillText(emojis["O"], startPosition.x, startPosition.y);
  }

  if (dir == "ArrowUp") {
    playerPosition.y = playerPosition.y - blocksSize;
    playerPosition.row = playerPosition.row - 1;
  } else if (dir == "ArrowRight") {
    playerPosition.x = playerPosition.x + blocksSize;
    playerPosition.col = playerPosition.col + 1;
  } else if (dir == "ArrowDown") {
    playerPosition.y = playerPosition.y + blocksSize;
    playerPosition.row = playerPosition.row + 1;
  } else if (dir == "ArrowLeft") {
    playerPosition.x = playerPosition.x - blocksSize;
    playerPosition.col = playerPosition.col - 1;
  }

  movementControl();

  game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);

  if (detectColission(endPosition)) {
    currentLvl >= maps.length - 1 ? gameFinished("won") : currentLvl++;
    bombsPosition = [];
    game.clearRect(0, 0, canvasSize, canvasSize);
    playerPosition.col = undefined;
    initialPaint(currentLvl);
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
      playerPosition.row = startPosition.row;
      playerPosition.col = startPosition.col;
      game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);
    } else {
      bombsPosition = [];
      lifes = 3;
      gameFinished("fail");
      statusTime.innerHTML = "0";
      game.clearRect(0, 0, canvasSize, canvasSize);
      initialPaint(currentLvl);
    }
  }
}
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
function showTime() {
  statusTime.innerHTML = formatTime(Date.now() - timeStart).string;
  mytime = formatTime(Date.now() - timeStart);
}
function formatTime(ms) {
  //?Para entender esta conversion de milisegundos a otros me tomo un poco pero haciendo el simi a como funcionan los milimetros y centimetros me fue mas facil de entender
  //* parseInt nos convierte el numero a un entero o base decimal y el modulo (%) nos ayuda a que el valor solo llegue a 100 en el caso de los centisegundos y 60 en el caso de los segundos: esto es porque son los valores sobrantes de la division.
  const cent = parseInt(ms / 10) % 100; //centisegundos
  const seg = parseInt(ms / 1000) % 60; //segundos
  const min = parseInt(ms / 60000); //minutos

  //El metodo slice en string con argumento negativo toma desde el final de string las posiciones indicadas, en este caso toma los dos valores de derecha a izq, esto hace que cuando pase a ser de dos unidades el valor ya no veamos el 0 del inicio
  const centStr = `0${cent}`.slice(-2);
  const segStr = `0${seg}`.slice(-2);
  const minStr = `0${min}`.slice(-2);

  const time = { min, seg, cent, string: `${minStr}:${segStr}:${centStr}` };
  return time;
}
