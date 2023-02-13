// Configuration
let mouse = {
    x: 0, y: 0
}

document.addEventListener('mousemove', ({clientX, clientY}) => {
    mouse.x = clientX
    mouse.y = clientY
})
const canvas = document.getElementById('game');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

class Player {
    constructor(x, y, radius, color) {
        this.position = {
            x: x, y: y
        }
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill();
    }

    update() {
        this.position.x = mouse.x
        this.position.y = mouse.y
        this.draw()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.position = {
            x: x, y: y
        }
        this.radius = radius
        this.color = color
        this.velocity = {
            x: velocity.x, y: velocity.y
        }
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

}

class Turret {
    constructor(x, y, radius, color) {
        this.position = {
            x: x, y: y
        }
        this.radius = radius
        this.baseColor = color
        this.color = this.baseColor
        this.range = 300

        this.ang = Math.random() * 2 * Math.PI;
        this.lastShotTime = Date.now() - 200
    }

    shouldShoot() {
        return (Date.now() - this.lastShotTime >= 1000 + Math.random() * (500 - 200) + 200)
    }

    shot() {
        if (this.shouldShoot()) {
            this.lastShotTime = Date.now()
            let velocity = {
                x: Math.cos(this.ang) * -1, y: Math.sin(this.ang) * -1
            }

            projectiles.push(new Projectile(this.position.x + (this.radius + 15) * (Math.cos(this.ang) * -1), this.position.y + (this.radius + 15) * (Math.sin(this.ang) * -1), 8, "#DABFFF", {
                x: velocity.x * 1.1, y: velocity.y * 1.1
            }))
        }
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.strokeStyle = this.color
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo((this.position.x + (this.radius + 10) * (Math.cos(this.ang) * -1)), this.position.y + (this.radius + 10) * (Math.sin(this.ang) * -1));
        ctx.lineWidth = 20;
        ctx.stroke();


    }

    drawLine() {
        ctx.strokeStyle = this.color
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.setLineDash([5, 10]);  // Set the line dash to [2, 2]
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);  // Reset the line dash to solid line
    }

    update() {
        let distance = Math.sqrt(Math.pow(this.position.x - mouse.x, 2) + Math.pow(this.position.y - mouse.y, 2));
        if (distance < this.range) {
            this.ang = Math.atan2(this.position.y - mouse.y, this.position.x - mouse.x)
            this.color = "#E54B4B"
            this.shot()
            this.drawLine()
        } else {
            this.color = this.baseColor
        }
        this.draw()
    }
}

let turrets = [];
let projectiles = []
let player = new Player(window.innerWidth / 2, window.innerHeight / 2, 10, "#9055A2")

while (turrets.length < 20) { // Number of turrets you want to generate
    let x = Math.floor(Math.random() * (canvas.width - 2 * 30)) + 30;
    let y = Math.floor(Math.random() * (canvas.height - 2 * 30)) + 30;

    let isTooClose = false;
    turrets.forEach(turret => {
        let distance = Math.sqrt(Math.pow(x - turret.position.x, 2) + Math.pow(y - turret.position.y, 2));
        if (distance < 200) {
            isTooClose = true;
        }
    })

    if (!isTooClose) {
        turrets.push(new Turret(x, y, 30, "#FAF3DD"));
    }
}

let shakeDuration = 800;
let shakeStartTime = -1;

function preShake() {
    if (shakeStartTime === -1) return;
    let dt = Date.now() - shakeStartTime;
    if (dt > shakeDuration) {
        shakeStartTime = -1;
        return;
    }
    let easingCoef = dt / shakeDuration;
    let easing = Math.pow(easingCoef - 1, 3) + 1;
    ctx.save();
    let dx = easing * (Math.cos(dt * 0.1) + Math.cos(dt * 0.3115)) * 2;
    let dy = easing * (Math.sin(dt * 0.05) + Math.sin(dt * 0.057113)) * 2;
    ctx.translate(dx, dy);
}


function postShake() {
    if (shakeStartTime === -1) return;
    ctx.restore();
}

function startShake() {
    shakeStartTime = Date.now();
}

document.addEventListener("click", () => {
    startShake();
})

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    preShake();
    projectiles.forEach((projectile, projectileIndex) => {
        if (projectile.position.x < 0 || projectile.position.x > canvas.width || projectile.position.y < 0 || projectile.position.y > canvas.height) {
            projectiles.splice(projectileIndex, 1);

        }
        projectile.update();
    })
    turrets.forEach(turret => turret.update())
    player.update()
    postShake();
}


animate()
