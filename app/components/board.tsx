"use client";

import { MouseEvent, useLayoutEffect, useRef, useState } from "react";
import { createBoard, Field, Piece, Player } from "./game-factory";

export default function Board() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player>("B");
  const [rows, setRows] = useState<Field[][]>(createBoard());
  const [lastMove, setLastMove] = useState<{
    from: [number, number];
    to: [number, number];
    piece: Piece;
  }>();
  const [currentActiveField, setCurrentActiveField] = useState<[number, number]>();
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

  const onClick = (e: MouseEvent) => {
    let target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      target = target.parentElement!;
    }

    if (target.classList.contains("circle")) {
      target = target.parentElement!;
    }

    console.log({ currentActiveField });

    if (target.classList.contains("possible-move") && currentActiveField) {
      console.log("DAAFAAAQQQ");
      target = target.parentElement!;
      const { row: rowString, col: colString } = target.dataset;
      const row = player === "B" ? Number(rowString) : 7 - Number(rowString);
      const col = Number(colString);

      setRows((rows) => {
        const newRows = executeMove(rows, currentActiveField, [row, col], lastMove, player);

        setLastMove({
          from: currentActiveField,
          to: [row, col],
          piece: newRows[row][col]?.piece!,
        });

        return newRows;
      });

      setCurrentActiveField(undefined);
      setPossibleMoves([]);
      setPlayer((prev) => (prev === "W" ? "B" : "W")); // switch player
      return;
    }

    const { row: rowString, col: colString } = target.dataset;
    console.log(target.dataset);
    const row = player === "B" ? Number(rowString) : 7 - Number(rowString);
    const col = Number(colString);
    if (rows[row][col] && rows[row][col]?.player === player) {
      setCurrentActiveField([row, col]);
      setPossibleMoves(
        getPossibleMoves([row, col], rows as Exclude<Field, null>[][], player, lastMove)
      );
    }
  };

  useLayoutEffect(() => {
    document.querySelectorAll(".possible-move").forEach((item) => {
      item.remove();
    });
    possibleMoves.forEach((possibleMove) => {
      const circleContainer = document.createElement("div");
      circleContainer.classList.value = "possible-move inset-0 absolute size-full z-[2]";
      const circle = document.createElement("div");
      circle.className = "circle absolute inset-0 m-auto size-8 rounded-full bg-stone-300 z-[0]";
      circleContainer.append(circle);
      if (player === "W") {
        boardRef.current!.children!.item(7 - possibleMove[0])!.children!.item(possibleMove[1])!.append(circleContainer);
        return;
      }

      boardRef.current!.children!.item(possibleMove[0])!.children!.item(possibleMove[1])!.append(circleContainer);
    });
  }, [possibleMoves]);

  const displayedRows = player === "W" ? [...rows].reverse() : rows;
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
                <img className="size-[80%] m-auto" src={col.iconPath} alt={`${col.player}-${col.piece}`} />
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

function executeMove(
  rows: Field[][],
  from: [number, number],
  to: [number, number],
  lastMove?: { from: [number, number]; to: [number, number]; piece: Piece },
  currentPlayer?: Player
): Field[][] {
  const newRows = [...rows.map((r) => [...r])];
  const movingPiece = newRows[from[0]][from[1]];

  // Move the piece
  newRows[to[0]][to[1]] = movingPiece;
  newRows[from[0]][from[1]] = null;

  // Handle en passant capture
  if (movingPiece?.piece === "P" && lastMove && lastMove.piece === "P") {
    const [lastFromX, lastFromY] = lastMove.from;
    const [lastToX, lastToY] = lastMove.to;

    // Check if this was an en passant capture
    if (
      Math.abs(lastFromX - lastToX) === 2 && // Last move was double pawn move
      from[0] === lastToX && // Same rank as captured pawn
      Math.abs(lastToY - from[1]) === 1 && // Adjacent column
      to[1] === lastToY && // Capturing to the same column as enemy pawn
      Math.abs(to[0] - from[0]) === 1 // Moving one rank forward/backward
    ) {
      // Remove the captured pawn
      newRows[lastToX][lastToY] = null;
    }
  }

  return newRows;
}

function getPossibleMoves(
  coordinates: [number, number],
  board: Exclude<Field, null>[][],
  player: Player,
  lastMove?: { from: [number, number]; to: [number, number]; piece: Piece }
): [number, number][] {
  const field = board[coordinates[0]][coordinates[1]];
  const piece = field.piece;
  switch (piece) {
    case "P":
      return getPossiblePawnMoves(coordinates, board, player, lastMove);
    case "Kn":
      return getPossibleKnightMoves(coordinates, board, player);
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

function getPossiblePawnMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player,
  lastMove?: { from: [number, number]; to: [number, number]; piece: Piece }
): [number, number][] {
  const direction = player === "W" ? 1 : -1;
  const moves: [number, number][] = [];

  // Normal forward move
  if (x + direction >= 0 && x + direction < 8 && !board[x + direction]?.[y]) {
    moves.push([x + direction, y]);
    // Double move from starting rank
    const startRow = player === "W" ? 1 : 6;
    if (x === startRow && x + 2 * direction >= 0 && x + 2 * direction < 8 && !board[x + 2 * direction]?.[y]) {
      moves.push([x + 2 * direction, y]);
    }
  }

  // Normal captures
  for (let dx of [-1, 1]) {
    const nx = x + direction;
    const ny = y + dx;
    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
      const target = board[nx]?.[ny];
      if (target && target.player !== player) {
        moves.push([nx, ny]);
      }
    }
  }

  // En passant
  if (lastMove && lastMove.piece === "P") {
    const [lastFromX, lastFromY] = lastMove.from;
    const [lastToX, lastToY] = lastMove.to;

    // Check if the last move was a double pawn move
    if (Math.abs(lastFromX - lastToX) === 2) {
      // Check if our pawn is on the same rank as the enemy pawn that just moved
      if (x === lastToX && Math.abs(lastToY - y) === 1) {
        // The en passant capture square is behind the enemy pawn
        const enPassantX = lastToX + direction;
        const enPassantY = lastToY;

        // Make sure the en passant square is valid and empty
        if (
          enPassantX >= 0 &&
          enPassantX < 8 &&
          enPassantY >= 0 &&
          enPassantY < 8 &&
          !board[enPassantX]?.[enPassantY]
        ) {
          moves.push([enPassantX, enPassantY]);
        }
      }
    }
  }

  return moves;
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
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  return getSlidingMoves([x, y], directions, board, player);
}

function getPossibleBishopMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
  const directions: [number, number][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return getSlidingMoves([x, y], directions, board, player);
}

function getPossibleKingMoves(
  [x, y]: [number, number],
  board: Exclude<Field, null>[][],
  player: Player
): [number, number][] {
  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  return deltas
    .map(([dx, dy]) => [x + dx, y + dy] as [number, number])
    .filter(
      ([nx, ny]) =>
        nx >= 0 &&
        ny >= 0 &&
        nx < 8 &&
        ny < 8 &&
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