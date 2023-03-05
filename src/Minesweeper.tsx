import React, {useCallback, useEffect, useState} from 'react';
import styled, {css} from "styled-components";
//@ts-ignore
import SpriteImage from './static/minesweeper-sprite.png';
import "./index.css";

const MinesweeperWrapper = styled.div<{boardWidth: number}>`
  width: ${props => (props.boardWidth * 16) + 28}px;
  border-left: 2px solid #fefefe;
  border-top: 2px solid #fefefe;
  border-bottom: 2px solid #7b7b7b;
  border-right: 2px solid #7b7b7b;
`

const MinesweeperHeader = styled.div<{boardWidth: number}>`
  background: #bdbdbd;
  display: flex;
  width: ${props => (props.boardWidth * 16) + 4}px;
  padding: 8px;
  justify-content: space-between;
  align-items: center;
  border-left: 2px solid #7b7b7b;
  border-top: 2px solid #7b7b7b;
  border-bottom: 2px solid #fefefe;
  border-right: 2px solid #fefefe;
  margin-bottom: 8px;
`

const MinesweeperBody = styled.tbody`
  border-left: 2px solid #7b7b7b;
  border-top: 2px solid #7b7b7b;
  border-bottom: 2px solid #fefefe;
  border-right: 2px solid #fefefe;
`

const CounterWrapper = styled.div`
  display: flex;
  height: 23px;
`

const SpriteNumber = styled.div<{digitNumber: number}>`
  width: 13px;
  height: 23px;
  float: left;
  background: url(${SpriteImage});
  background-position: ${props => props.digitNumber ? ((props.digitNumber - 1) * -14) : 13}px 0px;
  z-index: 10000;
`

const SpriteSmile = styled.div<{typeSmile: number}>`
  width: 26px;
  height: 26px;
  float: left;
  background: url(${SpriteImage});
  background-position: ${props => props.typeSmile ? ((props.typeSmile - 1) * -27) : 13}px -24px;
  z-index: 10000;
`

const SpriteFieldNumber = styled.td<SpriteFieldType>`
  width: 16px;
  height: 16px;
  float: left;
  background: url(${SpriteImage});
  ${({isRevealed, fieldNumber, isFlagged, isBomb, isPressed, isLost, isQuestion}) => {
        if(isLost){
            if(!isRevealed) {
                if(isFlagged && !isBomb) {
                    return css`
                      background-position: 20px -51px;
                  `
                }   
                if(isBomb) {
                    return css`
                        background-position: 54px -51px;
                    ` 
                }
            }
        }
        if(isFlagged) {
            return css`
                  background-position: 105px -51px;
            `
        }
        if(isQuestion) {
            return css`
                background-position: 88px -51px;
            `
        }
        if(isRevealed) {
            if(isBomb) {
                return css`
                    background-position: 37px -51px;
                `
        }
        if(fieldNumber === 0) {
            return css`
                background-position: 122px -51px;
            `
        }
        return css`
            background-position: ${(fieldNumber - 1) * -17}px -68px;
        `
        }
      
    
      if(isPressed) {
          return css`
              background-position: 122px -51px;
          `
      }
      
      
      return css`
          background-position: 139px -51px;
      `
  }}
  z-index: 10000;
`

interface MinesweeperProps {
    boardWidth: number;
    boardHeight: number;
    bombsCount: number;
}

interface FieldType {
    isFlagged: boolean;
    isRevealed: boolean;
    isQuestion: boolean;
    bombsAround: number;
    isBomb: boolean;
}

interface SpriteFieldType {
    fieldNumber: number;
    isFlagged: boolean;
    isRevealed: boolean;
    isLost: boolean;
    isBomb: boolean;
    isQuestion: boolean;
    isPressed: boolean | null;
}

interface Coordinates {
    y: number;
    x: number
}

const Minesweeper:React.FC<MinesweeperProps> = ({
    boardWidth,
    boardHeight,
    bombsCount
}) => {

    const [board, setBoard] = useState<FieldType[][]>([[]]);
    const [startGame, setStartGame] = useState(false);
    const [isLost, setIsLost] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [hunders, setHunders] = useState(0);
    const [dozens, setDozens] = useState(0);
    const [units, setUnits] = useState(0);
    const [hundersTime, setHundersTime] = useState(0);
    const [dozensTime, setDozensTime] = useState(0);
    const [unitsTime, setUnitsTime] = useState(0);
    const [typeSmile, setTypeSmile] = useState(1);
    const [firstClick, setFirstClick] = useState(true);
    const [fieldPressed, setFieldPressed] = useState<Coordinates | null>(null);
    let [bombsCountState, setBombsCountState] = useState(bombsCount);
    let [time, setTime] = useState(0);
    let bombsArray = [...Array(bombsCount)];


    const getField = (arr: FieldType[][], x: number, y: number) => {
        try {
            return arr[x][y]
        } catch (e) {
            // console.log("такого поля не существует")
        }
    }

    function getRandomIntInclusive(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const generateBoard = () => {

        bombsArray.forEach((value, index, array) => {
            let generatedNumber = getRandomIntInclusive(0, boardHeight * boardWidth - 1);
            while (bombsArray.indexOf(generatedNumber) !== -1) {
                generatedNumber = getRandomIntInclusive(0, boardHeight * boardWidth - 1);
            }
            bombsArray[index] = generatedNumber;
        })

        const newBoard: FieldType[][] = Array.from({ length: boardHeight}, () => Array.from( {length: boardWidth}));

        let bombCounter = 0;

        for (let i =0 ; i < boardHeight; i++){
            for (let j =0 ; j < boardHeight; j++){
                newBoard[i][j] = generateField(bombCounter);
                bombCounter++;
            }
        }

        newBoard.forEach((row: FieldType[], y: number) => {
            row.forEach((field: FieldType , x) => {
                if (field.isBomb) {
                    return;
                }

                let count = 0;

                loopFieldsAround(newBoard, x, y, (field: FieldType) => {
                    if (field && field.isBomb) {
                        count++;
                    }
                });

                row[x].bombsAround = count;
            });
        });

        setBoard(newBoard);
    }

    const generateField = (bombCounter: number) => ({
        isFlagged: false,
        isRevealed: false,
        isQuestion: false,
        bombsAround: 0,
        isBomb: Boolean(bombsArray.indexOf(bombCounter) !== -1),
    })

    const loopFieldsAround = (board: FieldType[][], x: number, y: number, cb: Function) => {
        for (let i = y - 1; i <= y + 1; i++) {
            for (let j = x - 1; j <= x + 1; j++) {
                cb(getField(board, i, j), j, i);
            }
        }
    };

    const rightClickField = (y: number,x: number, event: any) => {
        event.preventDefault();
        if (isLost || isWon) return;
        const newBoard = board;
        const field = newBoard[y][x];
        if (!field.isFlagged && !field.isQuestion) {
            field.isFlagged = !field.isFlagged;
        } else if (field.isFlagged) {
            field.isFlagged = !field.isFlagged;
            field.isQuestion = !field.isQuestion;
        }else if (field.isQuestion) {
            field.isFlagged = false;
            field.isQuestion = false;
        }
        field.isFlagged && setBombsCountState(bombsCountState -= 1);
        !field.isFlagged && field.isQuestion && setBombsCountState(bombsCountState += 1);
        setBoard(newBoard);
    }

    const leftClickField = (y: number, x: number)=> {

            if (isLost || isWon) return;

            const clickedField = board[y][x];
            let fieldsToReveal = [{ x, y }];

            const lookAround = (x: number, y: number) => {

                const directions: {x: number, y: number}[] = [
                    { x, y: y - 1 }, // top
                    { x: x + 1, y }, // right
                    { x, y: y + 1 }, // bottom
                    { x: x - 1, y }, // left
                ];

                directions.forEach(value =>  {
                    const dir = {...value};
                    const field = getField(board, dir.y, dir.x);
                    const alreadyExists = fieldsToReveal.find(p =>
                        (p.x === dir.x && p.y === dir.y)
                    );

                    if (field && !field.isBomb && !alreadyExists) {
                        fieldsToReveal.push(dir);
                        if (field.bombsAround === 0) lookAround(dir.x, dir.y);
                    }
                })

            };

            if (firstClick && clickedField.isBomb){
                setFirstClick(false);
                if(clickedField.isBomb) {
                    const directions: {x: number, y: number}[] = [
                        { x, y: y - 1 },
                        { x: x - 1, y: y - 1 },
                        { x: x + 1, y },
                        { x: x + 1, y: y + 1 },
                        { x, y: y + 1 },
                        { x: x - 1, y: y + 1 },
                        { x: x - 1, y },
                        { x: x + 1, y: y - 1 },
                    ];

                    for (let i = 0; i < directions.length; i++){
                        const dir = directions[i];
                        const field = getField(board, dir.y, dir.x);
                        if (field?.isBomb === false) {
                            field.isBomb = true;
                            clickedField.isBomb = false;
                            break;
                        }
                    }


                    directions.forEach(value => {
                        const dir = {...value};
                        const field = getField(board, dir.y, dir.x);
                        if (field?.isBomb === true) {
                            clickedField.bombsAround++;
                        }
                    })
                }
            } else {
                setFirstClick(false);
                if (clickedField.bombsAround === 0) {
                    lookAround(x, y);
                } else if (clickedField.isRevealed) {
                    let flaggedInRange = 0;
                    let unflaggedFields: any = [];

                    loopFieldsAround(board, x, y, (field: FieldType, x: number, y: number) => {
                        if (field) {
                            if (field.isFlagged) flaggedInRange++;
                            else unflaggedFields.push({ x, y });
                        }
                    });

                    if (clickedField.bombsAround === flaggedInRange) {
                        fieldsToReveal = fieldsToReveal.concat(unflaggedFields);
                    }
                }
            }

            const newBoard = [...board];
            let isNewLost = false;

            fieldsToReveal.forEach(obj => {
                const field = newBoard[obj.y][obj.x];
                field.isRevealed = true;
                if (field.isBomb) {
                    isNewLost = true;
                }
            });

            setIsLost(isNewLost);

            if (!isNewLost) {
                let unrevealedFields = 0;
                newBoard.forEach((row: FieldType[]) => {
                    row.forEach(field => {
                        if (!field.isRevealed && !field.isBomb) {
                            unrevealedFields++;
                        }
                    });
                });
                setIsWon(unrevealedFields === 0);
            }

            setBoard(newBoard);
    }

    const dividingIntoDigits = (number: number) => {
        setHunders((number / 100) | 0);
        setDozens(((number % 100) / 10) | 0);
        setUnits(number % 10);
    }

    const dividingIntoDigitsTime = (number: number) => {
        setHundersTime((number / 100) | 0);
        setDozensTime(((number % 100) / 10) | 0);
        setUnitsTime(number % 10);
    }

    useEffect(() => {
        return () => generateBoard();
    }, [])

    let intervalId: any;

    useEffect(() => {
        setTime(0);
        startGame && (intervalId = setInterval(() => setTime(time += 1), 1000));
        if (isLost || isWon) {
            setStartGame(false);

        }
    }, [startGame, isLost, isWon])

    const restartGame = useCallback(() => {
        // clearInterval(intervalId);
        // setStartGame(true);
        // setTime(0);
        // setBombsCountState(bombsCount);
        // setIsLost(false);
        // generateBoard();
        window.location.reload();
    }, []);

    useEffect(() => {
        if (!isLost && !isWon) {
            dividingIntoDigitsTime(time);
        }
    },[time])

    useEffect(() => {
        dividingIntoDigits(bombsCountState);
    }, [bombsCountState]);



    const handleMouseDown = useCallback((props: Coordinates) => {
        setTypeSmile(3);
        setFieldPressed(props)
    }, []);

    const handleMouseUp = useCallback(() => {
        setTypeSmile(1);
        setFieldPressed(null)
    }, []);

    return (
        <MinesweeperWrapper boardWidth={boardWidth}>
            <table className={"minesweeper"} style={{flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <MinesweeperHeader boardWidth={boardWidth}>
                    {<CounterWrapper>
                        <SpriteNumber digitNumber={hunders}/>
                        <SpriteNumber digitNumber={dozens}/>
                        <SpriteNumber digitNumber={units}/>
                    </CounterWrapper>}
                    {!isLost && !isWon && <SpriteSmile typeSmile={typeSmile} onMouseDown={() => setTypeSmile(2)} onMouseUp={() => {setTypeSmile(1); setStartGame(true)}}/>}
                    {isLost && !isWon && <SpriteSmile typeSmile={5} onClick={() => restartGame()}/>}
                    {!isLost && isWon && <SpriteSmile typeSmile={4} onClick={() => restartGame()}/>}
                    {<CounterWrapper>
                        <SpriteNumber digitNumber={hundersTime}/>
                        <SpriteNumber digitNumber={dozensTime}/>
                        <SpriteNumber digitNumber={unitsTime}/>
                    </CounterWrapper>}
                </MinesweeperHeader>
                <MinesweeperBody>
                {board.map((row, y) => (
                    <tr key={y} className="minesweeper__row">
                        {row.map((field, x) => {
                            const isPressed = fieldPressed && fieldPressed.y === y && fieldPressed.x === x;
                            return (
                                <SpriteFieldNumber
                                    onClick={() => {
                                        if (startGame) {
                                            leftClickField(y, x);
                                        } else {
                                            alert("Начните игру");
                                        }
                                    }}
                                    onContextMenu={(event) => rightClickField(y, x, event)}
                                    key={x}
                                    className={""}
                                    fieldNumber={field.bombsAround}
                                    onMouseDown={() => handleMouseDown({y, x})}
                                    onMouseUp={handleMouseUp}
                                    isFlagged={field.isFlagged}
                                    isBomb={field.isBomb}
                                    isRevealed={field.isRevealed}
                                    isQuestion={field.isQuestion}
                                    isLost={isLost}
                                    isPressed={isPressed}
                                >
                                </SpriteFieldNumber>
                            );
                        })}
                    </tr>
                ))}
                </MinesweeperBody>
            </table>
        </MinesweeperWrapper>
        )
}



export default Minesweeper;