const el = document.getElementById("brownie");

// Physics
let x, y, vx, vy;
const SPEED = 2.5;
const BOOST = 5;
let isHovered = false;

function randomDirection(speed) {
    const angle = Math.random() * 2 * Math.PI;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
}

function init() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;

    x = W / 2 - bw / 2;
    y = H / 2 - bh / 2;

    randomDirection(SPEED);
}

function step() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;

    x += vx;
    y += vy;

    if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
    } else if (x + bw >= W) {
        x = W - bw;
        vx = -Math.abs(vx);
    }

    if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
    } else if (y + bh >= H) {
        y = H - bh;
        vy = -Math.abs(vy);
    }

    el.style.left = x + "px";
    el.style.top = y + "px";

    requestAnimationFrame(step);

    if (isHovered && Math.random() < 0.05) randomDirection(SPEED * BOOST);
}

window.addEventListener("resize", () => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (x + el.offsetWidth > W) x = W - el.offsetWidth;
    if (y + el.offsetHeight > H) y = H - el.offsetHeight;
});

// Wait for fonts/layout before measuring
window.addEventListener("load", () => {
    init();
    requestAnimationFrame(step);
});

el.addEventListener("mouseenter", () => {
    if (isHovered) return;
    isHovered = true;
    // el.style.opacity = 0.1;
    vx *= BOOST;
    vy *= BOOST;
});

el.addEventListener("mouseleave", () => {
    if (!isHovered) return;
    isHovered = false;
    // el.style.opacity = 1;
    vx /= BOOST;
    vy /= BOOST;
});
