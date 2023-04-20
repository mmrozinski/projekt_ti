const c = document.getElementById("mainCanvas");
const ctx = c.getContext("2d");

var T = 0;

var lastTimestamp = 0.;
var deltaTime = 0.;
var animationSpeedSlider = document.getElementById("animationSpeedSlider");

var x0 = 0;
var y0 = c.height;
var x = x0;
var y = y0;
var angleSlider = document.getElementById("angleSlider");
var speedSlider = document.getElementById("speedSlider");
var heightSlider = document.getElementById("heightSlider");
var g = 0.0005;

var arrowLength = 100;

var doAnimate = false;
var done = false;

var startButton = document.getElementById("start");

startButton.addEventListener("click", startPress);

window.onload = init;

function init() {
    window.requestAnimationFrame(animationLoop);
}

function startPress() {
    if (doAnimate) {
        //stop
        x = x0;
        y = y0;
        T = 0;
        startButton.value = "Start";
        enableInputs();
    } else {
        //start
        startButton.value = "Reset";
        disableInputs();
    }
    doAnimate = !doAnimate;
    done = false;
}

function animationLoop(timestamp) {
    deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    update();
    draw();
    window.requestAnimationFrame(animationLoop);
}

function update() {
    if (T === 0) {
        y0 = c.height - heightSlider.value;
        y = y0;

        if (heightSlider.value > 0) {
            angleSlider.min = -90;
        }
        else {
            angleSlider.min = 0;
        }
    }
    if (doAnimate && !done) {
        const animationSpeed = animationSpeedSlider.value;
        const speed = speedSlider.value;
        const angle = angleSlider.value;


        T += animationSpeed * deltaTime;
        x = speed * Math.cos(-angle * Math.PI / 180.) * T + x0;
        y = 0.5 * g * T * T + speed * Math.sin(-angle * Math.PI / 180.) * T + y0;

        if (T > 0 && c.height - y <= 0) {
            y = c.height;
            done = true;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();

    const speed = speedSlider.value;
    const angle = angleSlider.value;

    if (T === 0) {  //for the starting moment draw the arrow for aiming
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + Math.cos(-angle * Math.PI / 180.) * arrowLength,
            y0 + Math.sin(-angle * Math.PI / 180.) * arrowLength);
        ctx.closePath();
        ctx.strokeStyle = "red";
        ctx.stroke();
    } else {  //during the travel of the projectile draw its trajectory
        const curveInterval = 10;
        let p1 = {x: x0, y: y0};
        let p2 = {x: x0, y: y0};


        for (let t = 0; t <= T; t += curveInterval) {
            p2.x = speed * Math.cos(-angle * Math.PI / 180.) * t + x0;
            p2.y = 0.5 * g * t * t + speed * Math.sin(-angle * Math.PI / 180.) * t + y0;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            p1.x = p2.x;
            p1.y = p2.y;
        }

    }
}

function disableInputs() {
    //animationSpeedSlider.disabled = true;
    speedSlider.disabled = true;
    angleSlider.disabled = true;
    heightSlider.disabled = true;
}

function enableInputs() {
    //animationSpeedSlider.disabled = false;
    speedSlider.disabled = false;
    angleSlider.disabled = false;
    heightSlider.disabled = false;
}
