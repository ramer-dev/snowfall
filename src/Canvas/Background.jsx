import React, { useEffect } from 'react'


function Background() {
    const width = 400;
    const height = 600;
    let farParticle = [];
    let nearParticle = [];
    let particleList = [];
    let animationHandler = undefined;

    const particleSettings = {
        pile: {
            count: 0
        },
        near: {
            count: 50
        },
        far: {
            count: 100
        }
    }

    const canvasRef = React.useRef(null);
    const contextRef = React.useRef(null);
    const particleRef = React.useRef([]);
    const randomNumberGenerator = (min, max) => {
        return Math.random() * (max - min) + min;
    }




    useEffect(() => {
        contextRef.current = canvasRef.current.getContext('2d');

        class Particle {
            constructor(areaValue, alphaValue, fallingSpeed, amplitude, isBounceable = false) {
                this.area = areaValue;
                this.x = Math.random() * width;
                this.y = Math.random() * height * 1.5;
                this.amplitude = amplitude;
                this.origin = {
                    x: this.x,
                    y: this.y
                }
                this.alpha = alphaValue;
                this.vy = fallingSpeed * 100;
                this.dx = Math.random() * 90;
                this.isBounceable = isBounceable
            }

            draw = () => {
                this.y += (Math.cos(this.area) + this.vy) * 0.2;
                this.x = this.origin.x + (this.amplitude * Math.sin(this.dx * 0.05))
                this.dx++;
                contextRef.current.save();
                contextRef.current.beginPath();
                contextRef.current.arc(this.x, this.y, this.area, 0, Math.PI * 2);
                contextRef.current.fillStyle = this.color;
                contextRef.current.globalAlpha = this.alpha;
                contextRef.current.closePath();
                contextRef.current.fill();
                contextRef.current.restore();
            }
        }

        const createSnowFall = (particles, flag = 'pile') => {
            while (particles.length < particleSettings[flag]['count']) {
                let particle;
                //create particles based on flag
                //(area,alpha,vy)
                switch (flag) {
                    case 'pile':
                        particle = new Particle(randomNumberGenerator(8, 12), 0.9, randomNumberGenerator(0.14, 0.18), 30, true);
                        break;
                    case 'near':
                        particle = new Particle(randomNumberGenerator(4, 7), 0.7, randomNumberGenerator(0.1, 0.13), 20);
                        break;
                    case 'far':
                        particle = new Particle(randomNumberGenerator(2, 4), 0.5, randomNumberGenerator(0.07, 0.1), 10);
                        break;
                }

                particle.color = `rgb(255,255,255)`;
                particles.push(particle);
            }
        }


        const startSnowFall = () => {
            contextRef.current.fillStyle = "transparent";
            
            contextRef.current.clearRect(0, 0, width, height);

            createSnowFall(particleList, 'pile');
            createSnowFall(nearParticle, 'near')
            createSnowFall(farParticle, 'far');

            //combine all and sortg randomly
            let particles = [...nearParticle, ...particleList, ...farParticle]
            particles = particles.sort(() => 0.5 - Math.random());
            for (let i in particles) {
                particles[i].draw();
                //If particle has crossed screen height
                if (particles[i].y > height || particles[i].y < -60) {
                    particles[i].y = Math.random() * height - height - 50;
                }
            }

            animationHandler = window.requestAnimationFrame(startSnowFall);
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

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        particleRef.current = [];
        animationHandler = window.requestAnimationFrame(startSnowFall);

    }, [])
    return (
        <canvas id='background' ref={canvasRef} />
    )
}

export default Background