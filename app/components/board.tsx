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
        setRows((rows) => {
          rows[row][col] = rows[currentActiveField[0]][currentActiveField[1]]
           rows[currentActiveField[0]][currentActiveField[1]] = null;
           return rows;
        })
        return;
      }

      const {row:rowString, col:colString} = target.dataset
      console.log(target.dataset)
      const row = player === "B" ? Number(rowString) : 7 -  Number(rowString) ;
      const col = Number(colString);
      if(rows[row][col]){
        setCurrentActiveField([row,col]);
        setPossibleMoves(getPsossiblemoves([row, col], rows as Exclude<Field, null>[][], player))
        console.log(row, col)
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

function getPsossiblemoves(coordinates:[number, number],board:Exclude<Field, null>[][], player:Player):[number, number][]{
  const field = board[coordinates[0]][coordinates[1]];
  const piece = field.piece;
  switch(piece){
    case"P":
      return getPossiblePawmMoves(coordinates, board, player)
  }

  return []
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
