import React, { useEffect } from 'react'
import Matter, { } from 'matter-js'

function Window() {
    const containerRef = React.useRef();
    const canvasRef = React.useRef();

    const width = 400, height = 600;

    useEffect(() => {
        let { Engine, Render, World, Bodies, Events, Runner, Mouse, MouseConstraint } = Matter;
        let engine = Engine.create();

        let render = Render.create({
            element: containerRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                width,
                height,
                background: 'transparent',
                wireframes: false
            }
        });

        const snowflakes = [];
        const amountSnowFlakes = 200;

        for (let i = 0; i < amountSnowFlakes; i++) {
            const x = Math.random() * width;
            const y = (Math.random() * height * 1.5) - height * 2;
            const radius = Math.random() * 5 + 2

            const snowflake = Bodies.circle(x, y, radius, {
                restitution: 0.4,
                friction: 0.02,
                frictionAir: 0.08,
                density: 0.02,
                mouseConstraint: false,
                render: {
                    fillStyle: 'white'
                }
            });

            snowflakes.push(snowflake);
        }

        engine.gravity.y = 1;
        World.add(engine.world, snowflakes);


        // 파티클의 y 값이 height보다 커지면,
        // 파티클을 {y : 맨 위, x: 랜덤} 하게 생성
        Events.on(engine, 'beforeUpdate', () => {
            for (const snowflake of snowflakes) {
                if (snowflake.position.y > height + 50) {
                    Matter.Body.setPosition(snowflake, { x: Math.random() * width, y: -50 })
                }
            }
        })

        const floor = Bodies.rectangle(300, 650, 600, 200, {
            isStatic: true,
            render: {
                fillStyle: '#99dd33'
            }
        })

        const defaultCategory = 0x0001,
            backGroundCategory = 0x0002;


        const ball = Bodies.circle(300, 0, 50, {
            restitution: 0.9,

        });

        const ball2 = Bodies.circle(300, 0, 50, {
            restitution: 0.9,
            collisionFilter: {
                mask: backGroundCategory | defaultCategory
            },
        });

        World.add(engine.world, [floor, ball, ball2]);
        const runner = Runner.run(engine);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            ...mouse, constraint: {
                render: {
                    visible: false
                }
            }
        })

        const event = async () => {
            World.add(engine.world, mouseConstraint);
            Render.run(render);
        }

        event();

        return () => {
            Runner.stop(runner);
            Render.stop(render);
            World.clear(engine.world);
            Engine.clear(engine);

        }
    }, [])

    return (
        <div>
            <canvas id='window' ref={canvasRef} />
        </div>
    )
}

export default Window