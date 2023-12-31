import React, { useEffect } from 'react'
import Matter, { } from 'matter-js'
import Background from './Background';
import Text from './Text';

function Window() {

    // const snowflakes = [];
    const amountSnowFlakes = 2500;

    const defaultCategory = 0x0001,
        backGroundCategory = 0x0002;
    const width = window.innerWidth, height = window.innerHeight;
    const filterStyle = { filter: 'url(#static-filter)' }
    let requestId;


    const containerRef = React.useRef();
    const filterRef = React.useRef();
    const canvasRef = React.useRef();

    const wallsRef = React.useRef();
    const eraserRef = React.useRef();
    const mousePositionRef = React.useRef();
    const snowflakeCountRef = React.useRef(amountSnowFlakes);


    useEffect(() => {

        // _requestAnimationFrame =
        // window.requestAnimationFrame ||
        // window.webkitRequestAnimationFrame ||
        // window.mozRequestAnimationFrame ||
        // window.oRequestAnimationFrame ||
        // window.msRequestAnimationFrame ||
        // function (callback) {
        //     window.setTimeout(callback, 1000 / 60);
        // };

        let { Engine, Render, World, Body, Bodies, Events, Runner, Mouse, MouseConstraint, Query } = Matter;
        let engine = Engine.create({
            enableSleeping:true,
            constraintIterations:1,
        });

        let render = Render.create({
            element: containerRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                width,
                height,
                background: 'transparent',
                wireframes: false,
                showSleeping: false,
            }
        });

        const snowflakeInterval = 20000 / width;
        let lastSnowflakeTime = 0;

        const createSnowFlake = (time) => {
            if (time - lastSnowflakeTime > snowflakeInterval && countSnowflakes() < amountSnowFlakes) {
                const x = Math.random() * width;
                const y = -50;
                const radius = Math.random() * (10 - 5) + 5;
                const snowflake = Bodies.circle(x, y, radius, {
                    restitution: 0,
                    friction: 0.01,
                    frictionAir: 0.1,
                    density: 0.001,
                    label: 'snowflake',
                    render: {
                        fillStyle: 'white',
                        opacity:1,
                    }
                });

                World.add(engine.world, snowflake)
                // setTimeout(() => {
                //     Matter.Sleeping.set(snowflake, true)
                // }, 10000)
                lastSnowflakeTime = time;
            }
        }

        engine.gravity.y = 1;

        // 파티클의 y 값이 height보다 커지면,
        // 파티클을 {y : 맨 위, x: 랜덤} 하게 생성
        const removeOffScreenSnowflakes = (time) => {
            if (time - lastSnowflakeTime > snowflakeInterval) {
                const snowflakesToRemove = engine.world.bodies.filter(body => {
                    return body.label === 'snowflake' && body.position.y > height + 300;
                })

                snowflakesToRemove.forEach(snow => {
                    const x = Math.random() * width;
                    const y = -50;
                    snow.position = { x, y };
                })
            }
        }

        const animate = (time) => {
            createSnowFlake(time);
            removeOffScreenSnowflakes(time);

            requestId = requestAnimationFrame(animate);
        }

        requestId = requestAnimationFrame(animate);


        const countSnowflakes = () => {
            let snowCount = 0;
            engine.world.bodies.forEach(body => {
                if (body.label === 'snowflake') {
                    snowCount++;
                }
            });

            return snowCount;
        }

        const floor = Bodies.rectangle(width/2, height, width, 70, {
            isStatic: true,

            render: {
                // visible: false,
            }
        })

        const leftSideWall = Bodies.rectangle(0, 300, 25, 2000, {
            isStatic: true,
            render: {
                // visible: false,
            }
        })
        const rightSideWall = Bodies.rectangle(width, 300, 25, 2000, {
            isStatic: true,
            render: {
                // visible: false,
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
                // isStatic: true,
                isSleeping:false,
            })

            // 좌클릭 우클릭 동시 눌렀을때의 버그 발생 방지
            if (eraserRef.current) {
                World.remove(engine.world, eraserRef.current)
            }

            eraserRef.current = eraser;
            World.add(engine.world, eraser);
        })

        Events.on(engine, 'collisionActive', e => {
            const pairs = e.pairs;

            pairs.forEach((pair) => {

                if ((pair.bodyA.label === 'eraser' && pair.bodyB.label === 'snowflake') ||
                    (pair.bodyA.label === 'snowflake' && pair.bodyB.label === 'eraser')
                ) {
                    console.log(pair)

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
            console.log(eraserRef.current)
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
                if (eraserRef.current) {
                    // 현재 각도
                    const currentAngle = eraserRef.current.angle || 0;

                    // console.log(currentAngle * (180/Math.PI))

                    // 트랜지션에 사용할 각도의 변화량 계산 (현재 각도와 새로운 각도 간의 차이)
                    // 음수 라디안 각도를 처리하여 부드럽게 각도를 변경
                    let angleChange = angleRad - currentAngle;
                    if (angleChange > Math.PI) {
                        angleChange -= 2 * Math.PI;
                    } else if (angleChange < -Math.PI) {
                        angleChange += 2 * Math.PI;
                    }

                    // 트랜지션 적용 (여기서는 0.1초 동안 부드럽게 각도가 변경됩니다. 필요에 따라 조절 가능)
                    Body.setAngle(eraserRef.current, currentAngle + angleChange * 0.2);
                }
            }

            mousePositionRef.current = { x, y }
        }

        // const interval = setInterval(() => {
        //     calculateAngle();
        // }, 3000)
        Events.on(mouseConstraint, 'mousedown', (e) => {
            console.log(e.mouse.position)
            const queryRegion = { min: { x: 0, y: 400 }, max: { x: 400, y: 600 } }

            const objects = Query.region(Matter.Composite.allBodies(engine.world), queryRegion).filter(t => t.label === 'snowflake')

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
            cancelAnimationFrame(requestId);
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
                <Text />
            </div>
            <button onClick={handleOnClick}>zz</button>
        </div>
    )
}

export default Window