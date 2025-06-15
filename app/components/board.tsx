"use client";

import {  MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createBoard, Field, Piece, Player } from "./game-factory";



export default function Board() {
  const boardRef = useRef<HTMLDivElement>(null)
  const [player,setPlayer]= useState<Player>("B");
  const [rows, setRows] = useState<Field[][]>(createBoard());

  const [currentActiveField, setCurrentActiveField] = useState<[number, number]>() 
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  // useLayoutEffect(()=>{
  //   if(!boardRef.current){
  //     return
  //   }
  //   const controller = new AbortController();

  //   boardRef.current.addEventListener('click', (e) => {
  //     let target = e.target as HTMLElement
  //     if(target.tagName === "IMG"){
  //       target = target.parentElement!;
  //     }
      
  //     if(target.classList.contains("circle")){
  //       target = target.parentElement!;
  //     }
  //     console.log(currentActiveField)
      
  //     if(target.classList.contains("possible-move") && currentActiveField){
  //       console.log("DAAFAAAQQQ")
  //       target = target.parentElement!;
  //       const {row:rowString, col:colString} = target.dataset
  //       const row = player === "B" ? Number(rowString) : 7 -  Number(rowString) ;
  //       const col = Number(colString);
  //       setRows((rows) => {
  //         rows[row][col] = rows[currentActiveField[0]][currentActiveField[1]]
  //          rows[currentActiveField[0]][currentActiveField[1]] = null;
  //          return rows;
  //       })
  //       return;
  //     }

  //     const {row:rowString, col:colString} = target.dataset
  //     console.log(target.dataset)
  //     const row = player === "B" ? Number(rowString) : 7 -  Number(rowString) ;
  //     const col = Number(colString);
  //     if(rows[row][col]){
  //       setCurrentActiveField([row,col]);
  //       setPossibleMoves(getPsossiblemoves([row, col], rows as Exclude<Field, null>[][], player))
  //       console.log(row, col)
  //     }


  

  //   }, {signal:controller.signal})


  //   return () => {
  //     controller.abort()
  //   }

  // }, [])

  const onClick =  (e: MouseEvent) => {
      let target = e.target as HTMLElement
      if(target.tagName === "IMG"){
        target = target.parentElement!;
      }
      
      if(target.classList.contains("circle")){
        target = target.parentElement!;
      }
      console.log({currentActiveField})
      
      if(target.classList.contains("possible-move") && currentActiveField){
  console.log("DAAFAAAQQQ")
  target = target.parentElement!;
  const {row:rowString, col:colString} = target.dataset
  const row = player === "B" ? Number(rowString) : 7 -  Number(rowString) ;
  const col = Number(colString);

  setRows((prevRows) => {
    const newRows = prevRows.map((r) => [...r]); // create shallow copy of rows
    newRows[row][col] = newRows[currentActiveField[0]][currentActiveField[1]];
    newRows[currentActiveField[0]][currentActiveField[1]] = null;
    return newRows;
  });

  setCurrentActiveField(undefined);
  setPossibleMoves([]);
  setPlayer((prev) => (prev === "W" ? "B" : "W")); // switch player
  return;
}


      const {row:rowString, col:colString} = target.dataset
      console.log(target.dataset)
      const row = player === "B" ? Number(rowString) : 7 -  Number(rowString) ;
      const col = Number(colString);
     if (rows[row][col] && rows[row][col]?.player === player) {
  setCurrentActiveField([row, col]);
  setPossibleMoves(getPossiblemoves([row, col], rows as Exclude<Field, null>[][], player));
  
}
    }
 
  useLayoutEffect(() => {
    document.querySelectorAll(".possible-move").forEach((item) => {
      item.remove()
    })
    possibleMoves.forEach((possibleMove) => {
      const circleContainer = document.createElement("div")
      circleContainer.classList = "possible-move inset-0 absolute size-full z-[2]"
      const circle = document.createElement("div")
      circle.className = "circle absolute inset-0 m-auto size-8 rounded-full bg-stone-300  z-[0]"
      circleContainer.append(circle)
      if(player === "W"){
        boardRef.current!.children!.item(7 -possibleMove[0])!.children!.item(possibleMove[1])!.append(circleContainer)
        return
      }

      boardRef.current!.children!.item(possibleMove[0])!.children!.item(possibleMove[1])!.append(circleContainer)
    })
  }, [possibleMoves])

  const displayedRows = player === "W"? [...rows].reverse() : rows
  return (
    <div ref={boardRef} onClick={(e) => onClick(e)} className="size-full">
      {displayedRows.map((row, i) => (
        <div key={`row_${i}`} className="flex flex-row">
          {row.map((col, j) => (
            <div
              className={`size-[12.5vh] ${
                (j + i) % 2 === 0 ? "bg-white" : "bg-lime-950"
              } relative`}
              key={`col_${j}`}
              data-row={i}
              data-col={j}
            >
              {col ? (
                <img className="size-[80%] m-auto" src={col.iconPath} />
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function getPossiblemoves(coordinates:[number, number],board:Exclude<Field, null>[][], player:Player):[number, number][]{
  const field = board[coordinates[0]][coordinates[1]];
  const piece = field.piece;
  switch(piece){
    case"P":
      return getPossiblePawmMoves(coordinates, board, player)
    case "Kn":
      return getPossibleKnightMoves(coordinates, board, player)
    case "R":
      return getPossibleRookMoves(coordinates, board, player);
    case "B":
      return getPossibleBishopMoves(coordinates, board, player);
    case "Q":
      return [
        ...getPossibleRookMoves(coordinates, board, player),
        ...getPossibleBishopMoves(coordinates, board, player),
      ];
    case "K":
      return getPossibleKingMoves(coordinates, board, player);
    default:
      return [];
  }
}


function getPossiblePawmMoves(coordinates:[number, number],board:Exclude<Field, null>[][], player:Player):[number, number][]{
  console.log({coordinates})
  const direction = player === "W" ? 1 : -1
  const possibleMoves:[number, number][] = []
  if(!board[coordinates[0] + 1 * direction][coordinates[1]]){
    possibleMoves.push([coordinates[0] + 1 * direction, coordinates[1]])
  }

  if((coordinates[1] + 1 < 8) && board[coordinates[0] + 1* direction][coordinates[1] + 1]&& board[coordinates[0] + 1 * direction][coordinates[1] + 1].player !== player){
    possibleMoves.push([coordinates[0] + 1 * direction, coordinates[1] + 1])
  }

  if((coordinates[1] - 1 > 0) && board[coordinates[0] + 1 * direction][coordinates[1] - 1]&& board[coordinates[0] + 1* direction][coordinates[1] - 1].player !== player){
    possibleMoves.push([coordinates[0] + 1* direction, coordinates[1] - 1])
  }

  if((player === "W" && coordinates[0] === 1) || (player === "B" && coordinates[0] === 6) && !board[coordinates[0] + 1 * direction][coordinates[1]]  && !board[coordinates[0] + 2* direction][coordinates[1]] ){
    possibleMoves.push([coordinates[0] + 2* direction, coordinates[1]])
  }

  console.log({possibleMoves})
  return possibleMoves
}
function getPossibleKnightMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
  const deltas = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  const possibleMoves: [number, number][] = [];

  for (const [dx, dy] of deltas) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
      const target = board[nx][ny];
      if (!target || target.player !== player) {
        possibleMoves.push([nx, ny]);
      }
    }
  }

  return possibleMoves;
}
function getPossibleRookMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
 const directions: [number, number][] = [
  [1, 0], [-1, 0],
  [0, 1], [0, -1]
];
  return getSlidingMoves([x, y], directions, board, player);
}

function getPossibleBishopMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
const directions: [number, number][] = [
  [1, 1], [1, -1],
  [-1, 1], [-1, -1]
];
  return getSlidingMoves([x, y], directions, board, player);
}

function getPossibleKingMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
  const deltas = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];
  return deltas
    .map(([dx, dy]) => [x + dx, y + dy] as [number, number])
    .filter(([nx, ny]) => 
      nx >= 0 && ny >= 0 && nx < 8 && ny < 8 &&
      (!board[nx][ny] || board[nx][ny].player !== player)
    );
}
function getSlidingMoves(
  [x, y]: [number, number],
  directions: [number, number][],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];

  for (const [dx, dy] of directions) {
    let nx = x + dx;
    let ny = y + dy;

    while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8) {
      const target = board[nx][ny];
      if (!target) {
        moves.push([nx, ny]);
      } else {
        if (target.player !== player) {
          moves.push([nx, ny]);
        }
        break;
      }
      nx += dx;
      ny += dy;
    }
  }

  return moves;
}