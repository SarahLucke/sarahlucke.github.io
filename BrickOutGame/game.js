
var canvas = document.getElementById("DrawingArea");
// 2D-rendering context:
var ctx = canvas.getContext("2d");
var phpEnabled = false;

//defining states:
const INIT = 0;
const STOP = 1;
const RUN = 2;
const SCORE = 3;
var state = INIT;

// starting point:
var x;
var y;
// defining movement:
var dx;
var dy;
const speed = 0.3; // speed in px/ms:
var angle = 130; // in deg
// ball radius:
const ballRadius = 10;
// paddle properties:
const paddleHeight = 10;
const paddleWidth = 75;
var paddleX;

// mouse event
canvas.addEventListener("mousemove", mouseMoveHandler, false);
function mouseMoveHandler(e) {
  if(state==STOP){
    state = RUN;
  }
  var relativeX = parseInt(e.clientX - canvas.offsetLeft - document.getElementById("center").offsetLeft);
  if(relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - paddleWidth/2;
      if(paddleX+paddleWidth >= canvas.width) {
        paddleX = canvas.width-paddleWidth;
      }
      else if(paddleX <= 0) {
        paddleX = 0;
      }
  }
}
canvas.addEventListener("mouseout", mouseOutHandler, false);
function mouseOutHandler(e) {
  state = STOP;
}

// brick properties:
const brickRowCount = 7;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
var bricks = [];

const standardTimeout_ms=30/speed;

const gamefont = "Georgia";

var score;
var fullTime;
var timeLast;
var timeDif;

StateMachine();

function StateMachine(){
  switch(state){
    case INIT:
      //write highscore table:
      document.getElementById("highscores").innerHTML = "";
      if(document.getElementById("normal").checked==true){
          getTable();
      }
      // reload paddle position
      paddleX = (canvas.width-paddleWidth)/2;
      // reload ball position
      angle = 130;
      x = canvas.width/2;
      y = canvas.height-30;
      dx = 1;
      dy = -1;
      // reload bricks
      for(col=0; col<brickColumnCount; col++) {
          bricks[col] = [];
          for(row=0; row<brickRowCount; row++){
            bricks[col][row] = { x: 0, y: 0, type:0, timeout:0 };
            bricks[col][row].x = (col*(brickWidth+brickPadding))+brickOffsetLeft;
            bricks[col][row].y = (row*(brickHeight+brickPadding))+brickOffsetTop;
            // random bricks:
            if(document.getElementById("mixed").checked==true){
              bricks[col][row].type = Math.floor(Math.random() * 4);
            }
            // original brick layout:
            if(document.getElementById("normal").checked==true){
              if(row<2){
                bricks[col][row].type = 3;
              }else if(row<5){
                bricks[col][row].type = 2;
              }else if(row<7){
                bricks[col][row].type = 1;
              }
            }
          }
      }
      // clear canvas:
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw everything:
      drawBricks();
      drawBall();
      drawPaddle();
      // set remaining variables:
      score = 0;
      fullTime = 0;
      timeLast = Date.now();
      // start as stopped game:
      state = STOP;
    break;
    case STOP:
      timeLast = Date.now();
      ctx.font = "30px " + gamefont;
      ctx.textAlign = "center";
      ctx.fillStyle = "red";
      ctx.fillText("GAME PAUSED",canvas.width/2,canvas.height/2);
    break;
    case RUN:
      timeDif = Date.now()-timeLast;
        timeLast = Date.now();
      fullTime += timeDif;
      // clear canvas:
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw everything:
      drawBricks();
      drawBall();
      drawPaddle();
      // check for game finish:
      if(!CheckGameFinish()){
        UpdateBallPosition();
        CheckBrickCollision();
      }
      // write score info (of last iteration):
      score = (fullTime/1000).toFixed(1);
      ctx.font = "20px " + gamefont;
      ctx.textAlign = "left";
      ctx.fillStyle = "black";
      ctx.fillText(score,10,50);
    break;
    case SCORE:
      document.getElementById("popup").style.display = "block";
      document.getElementById("name").focus();
    break;
  }
  //run again:
  requestAnimationFrame(StateMachine);
}

// functions ************************************************
function UpdateBallPosition(){
  // bounce from top edge:
  if(y + dy < ballRadius) {
    angle = 180-angle;
    // check if it hits paddle on bottom edge:
  } else if(y + dy > canvas.height-paddleHeight-ballRadius) {
      if(x > paddleX && x < paddleX + paddleWidth) {
        // adjust angle depending on hit point on paddle:
        var percentage=0;
        percentage = ((x-paddleX)*2/paddleWidth)-1;
        angle = 180-angle-(percentage*45);
        // prevent "overflow":
        if(angle<100 && angle>=0){
          angle=Math.sign(angle)*100;
        }
        if(angle>260 && angle<=360){
          angle=Math.sign(angle)*260;
        }

      }
  }
  // bounce from sides:
  if((x + dx > canvas.width-ballRadius) || (x + dx < 0+ballRadius)) {
    angle = 360-angle;
  }

  // no angles > 360 deg:
  angle = angle%360;

  // update position:
  dx=Math.sin(angle*Math.PI/180)*timeDif*speed;
  dy=Math.cos(angle*Math.PI/180)*timeDif*speed;
  x += dx;
  y += dy;

// check timeouts:
  for(col=0; col<brickColumnCount; col++) {
      for(row=0; row<brickRowCount; row++) {
        bricks[col][row].timeout -= timeDif;
        if(Math.sign(bricks[col][row].timeout)<=0){
          bricks[col][row].timeout = 0;
        }
      }
    }
}

function drawBall(){
  // draw new shape:
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(col=0; col<brickColumnCount; col++) {
        for(row=0; row<brickRowCount; row++) {
            if(bricks[col][row].type != 0) {
                ctx.beginPath();
                ctx.rect(bricks[col][row].x, bricks[col][row].y, brickWidth, brickHeight);
                switch (bricks[col][row].type) {
                  case 1:
                    ctx.fillStyle = "green";
                    break;
                  case 2:
                    ctx.fillStyle = "orange";
                    break;
                  case 3:
                    ctx.fillStyle = "red";
                    break;
                  default:
                    ctx.fillStyle = "gray";
                    break;
                }
                ctx.fill();
                ctx.closePath();
              }
        }
    }
}

function CheckGameFinish() {
    var deadBricks = 0;
    for(col=0; col<brickColumnCount; col++) {
      for(row=0; row<brickRowCount; row++){
        if(bricks[col][row].type == 0){
          deadBricks++;
        }
      }
    }
    if(deadBricks == brickRowCount*brickColumnCount) {
        alert("YOU WIN, CONGRATULATIONS!");
        if(document.getElementById("normal").checked==true){
          state = SCORE;
        }else{
          state = INIT;
        }
        return true;
    }
    if (y + dy > canvas.height-ballRadius) {
       alert("GAME OVER");
       state = INIT;
       return true;
    }
    return false;
}

function CheckBrickCollision() {
    for(col=0; col<brickColumnCount; col++) {
        for(row=0; row<brickRowCount; row++) {
            var b = bricks[col][row];
            if((b.type != 0) && (b.timeout == 0)){
              if (
             // right bound of ball in brick:
             (x+ballRadius > b.x &&
             x+ballRadius < b.x+brickWidth &&
             y > b.y &&
             y < b.y+brickHeight)||
             // left bound of ball in brick:
             (x-ballRadius > b.x &&
             x-ballRadius < b.x+brickWidth &&
             y > b.y &&
             y < b.y+brickHeight)) {
                 angle = 360-angle;
                 b.type--;
                 b.timeout = standardTimeout_ms;
             }else if(//upper bound of ball in brick:
                (y-ballRadius > b.y &&
                y-ballRadius < b.y+brickHeight &&
                x > b.x &&
                x < b.x+brickWidth)||
                // lower bound of ball in brick:
                (y+ballRadius > b.y &&
                y+ballRadius < b.y+brickHeight &&
                x > b.x &&
                x < b.x+brickWidth)){
                  angle = 180-angle;
                  b.type--;
                  b.timeout = standardTimeout_ms;
              }
          }
        }
    }
}

function sendName(){
  var name = document.getElementById("name").value;

  if(phpEnabled==true){
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "HighscoreHandle.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var data = 'name=' + name + '&score=' + score;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("highscores").innerHTML = this.responseText;
            state = INIT;
        }
    };

    xhttp.send(data);
  } else {
    document.getElementById("highscores").innerHTML = "<p>php disabled</p>";
  }
  document.getElementById("popup").style.display = "none";
}

function getTable(){

  if(phpEnabled==true){
    if(document.getElementById("normal").checked==true){
      var xhttp = new XMLHttpRequest();
      xhttp.open("GET", "HighscoreHandle.php", true);

      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              document.getElementById("highscores").innerHTML = this.responseText;
          }
      };

      xhttp.send();
    }
  } else{
    document.getElementById("highscores").innerHTML = "<p>php disabled</p>";
  }
}

function closePopup(){
  document.getElementById("popup").style.display = "none";
  state = INIT;
}

function refresh(){
  state = INIT;
}
