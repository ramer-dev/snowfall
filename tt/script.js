let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let width = 480;
let height = 700;
let windDirection = 0;
let farParticle = [];
let nearParticle = [];
let particleList = [];
let particlePileList = [];
let animationHandler = undefined;
let particleSettings = {
    pile:{
        count:25
    },
    near:{
        count:100
    },
    far:{
        count:350
    },
    //count for wach layer. Increase/Decrease based on requirement
};

class Particle {
    constructor(areaValue, alphaValue, fallingSpeed, amplitude, isBounceable = false) {
        this.area = areaValue;
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.amplitude = amplitude;
        this.origin = {
            x : this.x,
            y : this.y
        }
        this.alpha = alphaValue;
        this.vy = fallingSpeed * 100;
        this.dx = Math.random() * 90;
        this.isBounceable = isBounceable
    }

    draw = () => {
        this.y += (Math.cos(this.area) + this.vy) * 0.3;
        this.x = this.origin.x + (this.amplitude * Math.sin(this.dx * 0.05))
        this.dx++;
        context.save();
        context.beginPath();
        context.arc(this.x, this.y, this.area, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = this.alpha;
        context.closePath();
        context.fill();
        context.restore();
    }
}

window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

//Random number in given range
function randomNumberGenerator(min, max) {
    return Math.random() * (max - min) + min;
}
const createSnowFall = (particles, flag = 'pile') => {
    while (particles.length < particleSettings[flag]['count']) {
        let particle;
        //create particles based on flag
        //(area,alpha,vy)
        switch (flag) {
            case 'pile' :
                particle = new Particle(randomNumberGenerator(8,12), 0.9, randomNumberGenerator(0.14,0.18),30 , true);
                break;
            case 'near':
                particle = new Particle(randomNumberGenerator(4,7), 0.7, randomNumberGenerator(0.1,0.13), 20);
                break;
            case 'far':
                particle = new Particle(randomNumberGenerator(2,4), 0.5, randomNumberGenerator(0.07,0.1),10);
                break;
        }

        particle.color = `rgb(255,255,255)`;
        particles.push(particle);
    }
}
const startSnowFall = () => {
    context.fillStyle = "rgba(0,0,0,1)";
    context.fillRect(0, 0, width, height);

    createSnowFall(particleList, 'pile');
    createSnowFall(nearParticle, 'near')
    createSnowFall(farParticle, 'far');

    //combine all and sortg randomly
    let particles = [...nearParticle, ...particleList, ...farParticle]
    particles = particles.sort(() => 0.5 - Math.random());
    for (let i in particles) {
        particles[i].draw();
        //If particle has crossed screen height
        if (particles[i].y > height || particles[i].y < 0) {
            particles[i].y = Math.random() * height - height;
        }
    }

    animationHandler = window.requestAnimationFrame(startSnowFall);
}

window.onload = () => {
    canvas.width = width;
    canvas.height = height;
    particleList = [];
    animationHandler = window.requestAnimationFrame(startSnowFall);
};

window.onresize = () => {
    console.log(farParticle, nearParticle)
//     window.cancelAnimationFrame(animationHandler)
//     // width = window.innerWidth;
//     height = window.innerHeight
//     canvas.width = width;
//     canvas.height = height;
//     particleList = [];
//     window.requestAnimationFrame(startSnowFall);
}