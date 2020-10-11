
getTable();
var canvas = document.getElementById("DrawingArea");
// 2D-rendering context:
var ctx = canvas.getContext("2d");
var phpEnabled = false;

var stop = false;
var finish = false;

// defining snake properties
var snake = [];
const initSnakeLength = 3;
const snakeJointSize = 10;

var yumThereFlag = false;
var yum = {x:0,y:0};
const YumDistance = 3;

// defining movement:
var dx;
var dy;
var timeLast = Date.now();
const msPerJointMove = 80;
var waitingForStep = false;

const gamefont = "Georgia";

// add key events:
document.addEventListener("keydown", KeyHandle, false);
function KeyHandle(e) {
  switch (e.keyCode){
    case 37://arrow left
    case 65:// key a
      if((dy!=0)&&(waitingForStep==false)){
        dx=-(snakeJointSize);
        dy=0;
        waitingForStep=true;
      }
      break;
    case 38://arrow up
    case 87:// key w
      if((dx!=0)&&(waitingForStep==false)){
        dx=0;
        dy=-(snakeJointSize);
        waitingForStep=true;
      }
      break;
    case 39://arrow right
    case 68:// key d
      if((dy!=0)&&(waitingForStep==false)){
        dx=(snakeJointSize);
        dy=0;
        waitingForStep=true;
      }
      break;
    case 40://arrow down
    case 83:// key s
      if((dx!=0)&&(waitingForStep==false)){
        dx=0;
        dy=(snakeJointSize);
        waitingForStep=true;
      }
      break;
    case 80://p key
      if(stop==true){
        stop=false;
      }else {
          stop=true;
        }
      break;
    case 13: // enter key
      if(finish==true){
        document.getElementById("submit").click();
      }
    default:
  }
}


refresh();

// functions ************************************************
function refresh(){
  dx=snakeJointSize;
  dy=0;
  // reload snake
  snake = [];
  snake[0] = {x: Math.ceil(canvas.width/(2*snakeJointSize))*snakeJointSize,
    y: Math.ceil(canvas.height/(2*snakeJointSize))*snakeJointSize};
  for(var idx=1; idx<initSnakeLength; idx++) {
    snake[idx] = {x: snake[idx-1].x-snakeJointSize, y: snake[idx-1].y};
  }
  // clear canvas:
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw grid:
  drawGrid();
  // draw snake
  drawSnake();
  // start as stopped game
  stop = true;
  finish = false;

  draw();
}

function draw() {
  if(finish!=true){
    if(stop == true){
      ctx.font = "30px " + gamefont;
      ctx.textAlign = "center";
      ctx.fillStyle = "red";
      ctx.fillText("GAME PAUSED",canvas.width/2,canvas.height/2);
          timeLast = Date.now();
    }
    if(stop == false){
      var timeDif = Date.now()-timeLast;
      if(timeDif>=msPerJointMove){
          timeLast = Date.now();
        // clear canvas:
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // draw grid:
        drawGrid();
        drawSnake();
        drawYum();
        ctx.font = "20px " + gamefont;
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        ctx.fillText(snake.length,10,20);
        if(!CheckGameFinish()){
          UpdateSnakePosition();
        }else{
          finish = true;
        }
      }
    }
    // rendering control:
    requestAnimationFrame(draw);
  }
}

function drawGrid(){
for (var x = 0; x <= canvas.width; x += snakeJointSize) {
    ctx.moveTo(0.5 + x, 0);
    ctx.lineTo(0.5 + x, canvas.height);
}


for (var x = 0; x <= canvas.height; x += snakeJointSize) {
    ctx.moveTo(0, 0.5 + x);
    ctx.lineTo(canvas.width, 0.5 + x);
}

ctx.strokeStyle = "#bfbfbf";
ctx.stroke();
}

function UpdateSnakePosition(){
    var nx = snake[0].x+dx;
    if(nx>canvas.width-snakeJointSize){
      nx = 0;
    }
    if(nx<0){
      nx = canvas.width-snakeJointSize;
    }
    var ny = snake[0].y+dy;
    if(ny>canvas.height-snakeJointSize){
      ny = 0;
    }
    if(ny<0){
      ny = canvas.height-snakeJointSize;
    }
    // add new joint at start (in specified direction):
    snake.unshift({x: nx, y: ny});
    if(yumThereFlag==true){
      if((yum.x==snake[0].x)&&(yum.y==snake[0].y)){
        // eat yum = don't remove last joint
        yumThereFlag = false;
      }else{
        // remove last joint:
        snake.pop();
      }
    }else{
      // remove last joint:
      snake.pop();
    }
    waitingForStep = false;
}

function drawSnake(){
  var pointX = snake[0].x+1;
  var pointY = snake[0].y+1;
  // draw head
  ctx.beginPath();
  ctx.moveTo(pointX, pointY);
  // snake is in same column as yum:
  if(yum.x+1 == pointX){
    switch(dy){
      // going down:
      case snakeJointSize:
        if(((yum.y+1-pointY)<=(YumDistance*snakeJointSize))&&((yum.y+1-pointY)>0)){
          ctx.lineTo(pointX+snakeJointSize-1, pointY);
          ctx.lineTo(pointX+snakeJointSize-1, pointY+snakeJointSize-1);
          ctx.lineTo(pointX+(snakeJointSize-1)/2, pointY+(snakeJointSize-1)/2);
          ctx.lineTo(pointX, pointY+snakeJointSize-1);
        }else{
          ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
        }
      break;
      // going up:
      case -(snakeJointSize):
        if(((yum.y+1-pointY)>=-(YumDistance*snakeJointSize))&&((yum.y+1-pointY)<0)){
          ctx.lineTo(pointX+(snakeJointSize-1)/2, pointY+(snakeJointSize-1)/2);
          ctx.lineTo(pointX+snakeJointSize-1, pointY);
          ctx.lineTo(pointX+snakeJointSize-1, pointY+snakeJointSize-1);
          ctx.lineTo(pointX, pointY+snakeJointSize-1);
        }else{
          ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
        }
      break;
      default:
        ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
      break;
    }
  // snake is in same row as yum:
  }else if(yum.y+1 == pointY){
    switch(dx){
      // going right:
      case snakeJointSize:
        if(((yum.x+1-pointX)<=(YumDistance*snakeJointSize))&&((yum.x+1-pointX)>0)){
          ctx.lineTo(pointX+snakeJointSize-1, pointY);
          ctx.lineTo(pointX+(snakeJointSize-1)/2, pointY+(snakeJointSize-1)/2);
          ctx.lineTo(pointX+snakeJointSize-1, pointY+snakeJointSize-1);
          ctx.lineTo(pointX, pointY+snakeJointSize-1);
        }else{
          ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
        }
      break;
      // going left:
      case -(snakeJointSize):
        if(((yum.x+1-pointX)>=-(YumDistance*snakeJointSize))&&((yum.x+1-pointX)<0)){
          ctx.lineTo(pointX+snakeJointSize-1, pointY);
          ctx.lineTo(pointX+snakeJointSize-1, pointY+snakeJointSize-1);
          ctx.lineTo(pointX, pointY+snakeJointSize-1);
          ctx.lineTo(pointX+(snakeJointSize-1)/2, pointY+(snakeJointSize-1)/2);
        }else{
          ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
        }
      break;
      default:
        ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
      break;
    }
  }else{
    ctx.rect(pointX, pointY, snakeJointSize-1, snakeJointSize-1);
  }
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

    // draw remaining snake:
  for(var i=1; i<snake.length; i++){
    ctx.beginPath();
    ctx.rect(snake[i].x+1, snake[i].y+1, snakeJointSize-1, snakeJointSize-1);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }
}

function drawYum() {
  if(yumThereFlag==false){
    yum.x = Math.ceil(Math.random() *
    (canvas.width-snakeJointSize-1)/snakeJointSize)*snakeJointSize;
    yum.y = Math.ceil(Math.random() *
    (canvas.height-snakeJointSize-1)/snakeJointSize)*snakeJointSize;
    yumThereFlag=true;
  }
  ctx.beginPath();
  ctx.rect(yum.x+1, yum.y+1, snakeJointSize-1, snakeJointSize-1);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

}

function CheckGameFinish() {
  for(var i=1; i<snake.length; i++){
    if((snake[0].x==snake[i].x)&&(snake[0].y==snake[i].y)){
      alert("GAME OVER\n" + snake.length + " joints");
        // make popup visible
      document.getElementById("popup").style.display = "block";
      document.getElementById("name").focus();
      return true;
    }
  }
  return false;
}

function sendName(){
  document.getElementById("popup").style.display = "none";
  var name = document.getElementById("name").value;

  if(phpEnabled==true){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "HighscoreHandle.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var data = 'name=' + name + '&score=' + snake.length;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("highscores").innerHTML = this.responseText;
            refresh();
        }
    };

    xhttp.send(data);
  }else{
    document.getElementById("highscores").innerHTML = "<p>php disabled</p>";
  }
}

function getTable(){
  if(phpEnabled==true){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "HighscoreHandle.php", true);

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("highscores").innerHTML = this.responseText;
        }
    };

    xhttp.send();
  } else {
    document.getElementById("highscores").innerHTML = "php disabled";
  }
}

function closePopup(){
  document.getElementById("popup").style.display = "none";
  refresh();
}
