const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_OFFSET = 20;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 14;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

// Left paddle (player)
let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Right paddle (AI)
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Animation id
var gameLoopId;

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
    ctx.fill();
}

function resetBall() {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = (Math.random()*4 + 2) * (Math.random() > 0.5 ? 1 : -1);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Mouse controls for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddleY = clamp(mouseY - PADDLE_HEIGHT/2, 0, HEIGHT - PADDLE_HEIGHT);
});

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Prevent scrolling on touch

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0]; // Get the first touch point
    let touchY = touch.clientY - rect.top;

    leftPaddleY = clamp(touchY - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
}, { passive: false }); // passive: false is needed to allow preventDefault

function aiMove() {
    // Basic AI follows the ball but with a maximum speed
    let target = ballY - PADDLE_HEIGHT / 2 + BALL_SIZE / 2;
    let delta = target - rightPaddleY;
    rightPaddleY += clamp(delta, -PADDLE_SPEED, PADDLE_SPEED);
    rightPaddleY = clamp(rightPaddleY, 0, HEIGHT - PADDLE_HEIGHT);
}

function update() {
    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls
    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY *= -1;
    }
    if (ballY + BALL_SIZE >= HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballSpeedY *= -1;
    }

    // Ball collision with left paddle
    if (
        ballX <= PADDLE_OFFSET + PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_OFFSET + PADDLE_WIDTH;
        ballSpeedX *= -1;
        // Add some "spin" based on hit position
        let hitPos = (ballY + BALL_SIZE/2) - (leftPaddleY + PADDLE_HEIGHT/2);
        ballSpeedY += hitPos * 0.08;
    }

    // Ball collision with right paddle
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_OFFSET - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_OFFSET - PADDLE_WIDTH - BALL_SIZE;
        ballSpeedX *= -1;
        let hitPos = (ballY + BALL_SIZE/2) - (rightPaddleY + PADDLE_HEIGHT/2);
        ballSpeedY += hitPos * 0.08;
    }

    if (ballX + BALL_SIZE < 0) {        
        var score = document.getElementById("cpu-score").innerHTML;
        document.getElementById("cpu-score").innerHTML = Number(score) + 1;

        document.getElementById("audio-fail").play();
    } else if (ballX > WIDTH) {        
        var score = document.getElementById("player-score").innerHTML;
        document.getElementById("player-score").innerHTML = Number(score) + 1;

        document.getElementById("audio-success").play();
    }

    // Ball out of bounds (score)
    if (ballX + BALL_SIZE < 0 || ballX > WIDTH) {
        resetBall();
        increaseLevel();
    }

    aiMove();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddles
    drawRect(PADDLE_OFFSET, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#FFD700");
    drawRect(WIDTH - PADDLE_OFFSET - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#00BFFF");

    // Draw ball
    drawBall(ballX, ballY, BALL_SIZE, "#FFF");

    // Draw middle line
    ctx.strokeStyle = "#444";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(WIDTH/2, 0);
    ctx.lineTo(WIDTH/2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameLoop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function addResetButton() {
    reset.addEventListener("click", () => {
        ballSpeedX = 1;
        ballSpeedY = 1;

        document.getElementById("player-score").innerHTML = 0;
        document.getElementById("cpu-score").innerHTML = 0;

        resetBall();
        draw();

        document.getElementById("number-level").innerHTML = 0;
    });
}

function increaseLevel() {
    var level = document.getElementById("number-level").innerHTML;
    document.getElementById("number-level").innerHTML = Number(level) + 1;

    update();
}

function addEventListeners() {
    document.getElementById("start").addEventListener("click", () => {
        document.getElementById("audio-start").play();

        gameLoop();
        addResetButton();

        document.getElementById("end").addEventListener("click", () => {
            cancelAnimationFrame(gameLoopId);
        });
    });
}
addEventListener("DOMContentLoaded", () => {
    draw();
    addEventListeners()
});
