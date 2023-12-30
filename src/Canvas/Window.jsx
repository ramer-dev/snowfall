import React, { useEffect } from 'react'
import Matter, { } from 'matter-js'
import Background from './Background';

function Window() {

    const snowflakes = [];
    const amountSnowFlakes = 350;

    const defaultCategory = 0x0001,
        backGroundCategory = 0x0002;
    const width = 400, height = 700;
    const filterStyle = { filter: 'url(#static-filter)' }

    const containerRef = React.useRef();
    const filterRef = React.useRef();
    const canvasRef = React.useRef();

    const wallsRef = React.useRef();
    const eraserRef = React.useRef();
    const mousePositionRef = React.useRef();
    const snowflakeCountRef = React.useRef(amountSnowFlakes);


    useEffect(() => {
        let { Engine, Render, World, Body, Bodies, Events, Runner, Mouse, MouseConstraint, Query } = Matter;
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


        // front 눈 생성 부분
        for (let i = 0; i < amountSnowFlakes; i++) {
            const x = Math.random() * width;
            const y = (Math.random() * height * 3) - height * 6;
            const radius = 15

            const snowflake = Bodies.circle(x, y, radius, {
                restitution: 0,
                friction: 0.4,
                frictionAir: 0.03,
                density: 0.02,
                mouseConstraint: false,
                label: 'snowflake',
                render: {
                    fillStyle: 'white'
                }
            });

            snowflakes.push(snowflake);
        }

        engine.gravity.y = 1;


        World.add(engine.world, snowflakes);

        const countSnowflakes = () => {
            let snowCount = 0;
            engine.world.bodies.forEach(body => {
                if (body.label === 'snowflake') {
                    snowCount++;
                }
            });

            return snowCount;
        }


        // 파티클의 y 값이 height보다 커지면,
        // 파티클을 {y : 맨 위, x: 랜덤} 하게 생성
        Events.on(engine, 'beforeUpdate', () => {
            for (const snowflake of snowflakes) {
                if (snowflake.position.y > height + 50) {
                    Matter.Body.setPosition(snowflake, { x: Math.random() * (width - 100) + 50, y: -50 })
                } else if (snowflake.position.y < height - 300) {
                    const forceX = 0.001 * (Math.random() > 0.5 ? 1 : -1);
                    Matter.Body.applyForce(snowflake, snowflake.position, { x: forceX, y: 0 })
                }
            }
        })

        const floor = Bodies.rectangle(300, 700, 600, 200, {
            isStatic: true,

            render: {
                visible: false,
            }
        })

        const leftSideWall = Bodies.rectangle(0, 300, 25, 600, {
            isStatic: true,
            render: {
                visible: false,
            }
        })
        const rightSideWall = Bodies.rectangle(400, 300, 25, 600, {
            isStatic: true,
            render: {
                visible: false,
            }
        })


        wallsRef.current = [leftSideWall, rightSideWall];

        World.add(engine.world, [floor, leftSideWall, rightSideWall]);
        const runner = Runner.run(engine);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            ...mouse, constraint: {
                render: {
                    visible: false
                }
            }
        })

        Events.on(mouseConstraint, 'mousedown', e => {
            const x = e.mouse.position.x;
            const y = e.mouse.position.y;
            const eraser = Bodies.rectangle(x, y, 10, 40, {
                render: {
                    fillStyle: '#00FF00',
                },
                label: 'eraser',
                isStatic: true,

            })
            eraserRef.current = eraser;
            World.add(engine.world, eraser);
        })

        Events.on(engine, 'collisionActive', e => {
            const pairs = e.pairs;

            pairs.forEach((pair) => {
                if ((pair.bodyA.label === 'eraser' && pair.bodyB.label === 'snowflake') ||
                    (pair.bodyA.label === 'snowflake' && pair.bodyB.label === 'eraser')
                ) {
                    const snowflake = pair.bodyA.label === 'snowflake' ? pair.bodyA : pair.bodyB

                    // if (snowflake.area > 300) {
                    //     Body.scale(snowflake, 0.85, 0.85)
                    //     // snowflake.circleRadius = newRadius;
                    // } else {
                    World.remove(engine.world, snowflake)
                    snowflakeCountRef.current = countSnowflakes();

                    // }
                }
            })
        })

        Events.on(mouseConstraint, 'mouseup', e => {
            if (eraserRef.current) {
                World.remove(engine.world, eraserRef.current)
            }
        })

        Events.on(mouseConstraint, 'mousemove', e => {
            const { x, y } = e.mouse.position;
            calculateAngle(x, y)

            if (eraserRef.current) {
                Body.setPosition(eraserRef.current, { x, y })
                // World.setPosition(engine.world, eraserRef.current, {x, y})
            }
        })

        const calculateAngle = (x, y) => {
            if (mousePositionRef.current && x && y) {
                const x_ = mousePositionRef.current.x;
                const y_ = mousePositionRef.current.y;

                const dx = x_ - x;
                const dy = y_ - y;

                const angleRad = Math.atan2(dy, dx);
                if (eraserRef.current)
                    Body.setAngle(eraserRef.current, angleRad)
            }

            mousePositionRef.current = { x, y }
        }

        // const interval = setInterval(() => {
        //     calculateAngle();
        // }, 3000)
        Events.on(mouseConstraint, 'mousedown', (e) => {
            console.log(e.mouse.position)
            const queryRegion = { min: { x: 0, y: 400 }, max: { x: 400, y: 600 } }

            const objects = Query.region(Matter.Composite.allBodies(engine.world), queryRegion).filter(t => t.label ==='snowflake')
            
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


    const handleOnClick = (e) => {
        console.log(snowflakeCountRef.current)
    }

    return (
        <div>
            <div className='wrapper'>
                <Background />
                <div ref={filterRef} style={filterStyle}>
                    <canvas id='window' ref={canvasRef} />
                </div>
            </div>
            <button onClick={handleOnClick}>zz</button>
        </div>
    )
}

export default Window