import React, { useEffect } from 'react'
import Matter from 'matter-js'
import Background from './Background';
import Text from './Text';
import Share from '../Modal/Share';

import { ReactComponent as ShareIcon } from '../Image/ic_share.svg'


function Window() {
    const [isOpen, setIsOpen] = React.useState(false);

    const width = window.innerWidth, height = window.innerHeight;

    // const snowflakes = [];
    const amountSnowFlakes = 1500;

    const filterStyle = { filter: 'url(#static-filter)' }
    let requestId;


    const containerRef = React.useRef();
    const filterRef = React.useRef();
    const canvasRef = React.useRef();

    const eraserRef = React.useRef();
    const mousePositionRef = React.useRef();
    const snowflakeCountRef = React.useRef(amountSnowFlakes);


    useEffect(() => {

        const { Engine, Render, World, Body, Bodies, Events, Runner, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create({
            enableSleeping: true,
            constraintIterations: 1,
        });

        const render = Render.create({
            element: containerRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                width,
                height,
                background: 'transparent',
                wireframes: false,
                showSleeping: false,
                gravity: 1
            }
        });

        // 지형지물(바닥) 생성
        const floor = Bodies.rectangle(width / 2, height + 35, width, 70, {
            isStatic: true,
        })
        // 지형지물(왼쪽 벽) 생성
        const leftSideWall = Bodies.rectangle(-12, 300, 25, 2000, {
            isStatic: true,
        })
        // 지형지물(오른쪽 벽) 생성
        const rightSideWall = Bodies.rectangle(width + 12, 300, 25, 2000, {
            isStatic: true,
        })

        // 월드에 지형지물 추가
        World.add(engine.world, [floor, leftSideWall, rightSideWall]);

        const snowflakeInterval = 40000 / width;
        let lastSnowflakeTime = 0;

        // 눈송이를 생성하는 함수
        // time만큼 시간이 지났고, 전체 눈송이의 갯수가 amountSnowFlakes 미만일때 생성한다.
        const createSnowFlake = (time) => {
            if (time - lastSnowflakeTime > snowflakeInterval && countSnowflakes() < amountSnowFlakes) {
                const x = Math.random() * width;
                const y = -50;
                const slope = (12 - 8) / (1920 - 280);
                const intercept = 8 - slope * 280;
                const dynamicMaxRadius = slope * width + intercept;
                const minRadius = 8;
                const maxRadius = Math.min(dynamicMaxRadius, 12);
                const radius = width >= 1600 ? Math.random() * (25 - 10) + 10 : Math.random() * (maxRadius - minRadius) + minRadius;
                const snowflake = Bodies.circle(x, y, radius, {
                    restitution: 0,
                    friction: 0.001,
                    frictionAir: 0.1,
                    label: 'snowflake',
                    render: {
                        fillStyle: 'white',
                        opacity: 1,
                    }
                });

                World.add(engine.world, snowflake)
                lastSnowflakeTime = time;
            }
        }

        // time만큼 시간이 지났을 때 화면 바깥으로 나간 눈들을 처리한다..
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

        // 프레임마다 실행되는 함수.
        // setInterval이 가지고있는 여러 문제점을 해결해준다.
        const animate = (time) => {
            createSnowFlake(time);
            removeOffScreenSnowflakes(time);

            requestId = requestAnimationFrame(animate);
        }
        requestId = requestAnimationFrame(animate);

        // 전체 눈송이 갯수 카운트
        const countSnowflakes = () => {
            let snowCount = 0;
            engine.world.bodies.forEach(body => {
                if (body.label === 'snowflake') {
                    snowCount++;
                }
            });

            return snowCount;
        }


        // 객체간 충돌 시, 충돌이 유지될 때 발생하는 이벤트
        // 만약 충돌한 객체의 라벨이 eraser와 snowflake일 경우 snowflake 객체를 월드에서 삭제한다.
        Events.on(engine, 'collisionStart' || 'collisionActive', e => {
            const { pairs } = e;

            pairs.forEach((pair) => {

                if ((pair.bodyA.label === 'eraser' && pair.bodyB.label === 'snowflake') ||
                    (pair.bodyA.label === 'snowflake' && pair.bodyB.label === 'eraser')
                ) {

                    const snowflake = pair.bodyA.label === 'snowflake' ? pair.bodyA : pair.bodyB

                    World.remove(engine.world, snowflake)
                    snowflakeCountRef.current = countSnowflakes();
                }
            })
        })


        // 마우스 제약조건 설정
        // 마우스를 통해 캔버스 내부의 오브젝트에 조작하기 위해서 필요하다.
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            ...mouse, constraint: {
                render: {
                    visible: false
                }
            }
        })


        // 마우스 클릭시 발생하는 이벤트
        // 클릭 했을 때, 클릭한 위치에 지우개 오브젝트 생성
        Events.on(mouseConstraint, 'mousedown', e => {
            const { x, y } = e.mouse.position;
            const eraser = Bodies.rectangle(x, y, 10, 60, {
                render: {
                    fillStyle: '#f5b237',
                },
                label: 'eraser',
                isSleeping: false,
            })

            // 좌클릭 우클릭 동시 눌렀을때의 버그 발생 방지
            // 동시에 눌렀을 때, 기존 지우개 객체가 삭제되지 않고 남아있는 버그를 방지하기 위함.
            if (eraserRef.current) {
                World.remove(engine.world, eraserRef.current)
            }

            eraserRef.current = eraser;
            World.add(engine.world, eraser);
        })

        // 마우스 클릭을 뗄 때 
        // 생성된 브러쉬 객체를 월드에서 제거한다.
        Events.on(mouseConstraint, 'mouseup', e => {
            if (eraserRef.current) {
                World.remove(engine.world, eraserRef.current)
            }
        })

        // 마우스가 움직일 때의 이벤트
        // 브러쉬가 마우스를 따라오게 한다.
        Events.on(mouseConstraint, 'mousemove', e => {
            if (eraserRef.current) {
                const { x, y } = e.mouse.position;
                calculateBrushAngle(x, y)
                Body.setPosition(eraserRef.current, { x, y })
            }
        })

        // 마우스 진행방향에 따른 각도를 계산하는 함수
        // 브러쉬의 진행방향을 마우스의 진행방향에 맞게 바꿔준다.
        const calculateBrushAngle = (x, y) => {
            if (mousePositionRef.current && x && y) {

                const x_ = mousePositionRef.current.x;
                const y_ = mousePositionRef.current.y;

                const dx = x_ - x;
                const dy = y_ - y;

                const angleRad = Math.atan2(dy, dx);
                if (eraserRef.current) {
                    // 현재 각도
                    const currentAngle = eraserRef.current.angle || 0;

                    // 트랜지션에 사용할 각도의 변화량 계산 (현재 각도와 새로운 각도 간의 차이)
                    // 음수 라디안 각도를 처리하여 부드럽게 각도를 변경
                    let angleChange = angleRad - currentAngle;
                    if (angleChange > Math.PI) {
                        angleChange -= 2 * Math.PI;
                    } else if (angleChange < -Math.PI) {
                        angleChange += 2 * Math.PI;
                    }

                    // 트랜지션 적용 (여기서는 0.2의 가중치만큼 부드럽게 변경. 필요에 따라 조절 가능)
                    Body.setAngle(eraserRef.current, currentAngle + angleChange * 0.2);
                }
            }
            // 현재 마우스 좌표 Ref에 저장
            mousePositionRef.current = { x, y }
        }

        // 월드를 가동한다.
        const runner = Runner.run(engine);

        World.add(engine.world, mouseConstraint);
        Render.run(render);

        return () => {
            Runner.stop(runner);
            Render.stop(render);
            World.clear(engine.world);
            Engine.clear(engine);
            cancelAnimationFrame(requestId);
        }
    }, [])


    const handleOpen = (e) => {
        setIsOpen(true);
    }

    return (
        <div>
            <div className='wrapper'>
                <Background />
                <Text />
                <div ref={filterRef} >
                    <canvas id='window' style={filterStyle} ref={canvasRef} />
                </div>
            </div>
            <Share isOpen={isOpen} setIsOpen={setIsOpen} />


            <div onClick={handleOpen} className='share-btn'>
                <ShareIcon fill={'wheat'} width={'100%'} height='100%' />
            </div>
        </div>
    )
}

export default Window