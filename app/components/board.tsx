"use client";

import { useState } from "react";

type Piece = "K" | "Q" | "R" | "P" | "Kn" | "B";
type Player = "B" | "W";
type Field = {
  piece: Piece;
  player: Player;
  iconPath: string;
} | null;

const initialWhitePieces = [
  ["R", "Kn", "B", "Q", "K", "B", "Kn", "R"] satisfies Piece[],
  Array.from({ length: 8 }, () => "P") satisfies Piece[],
] as Piece[][];

const initialWhiteField = initialWhitePieces.map((row) =>
  row.map((piece) => ({
    piece,
    player: "W" as Player,
    iconPath: getPath(piece, "W"),
  }))
);

const initialBlackPieces = [
  Array.from({ length: 8 }, () => "P") satisfies Piece[],
  ["R", "Kn", "B", "Q", "K", "B", "Kn", "R"] satisfies Piece[],
] as Piece[][];

const initialBlackField = initialBlackPieces.map((row) =>
  row.map((piece) => ({
    piece,
    player: "B" as Player,
    iconPath: getPath(piece, "B"),
  }))
);

const nullRow = Array.from({ length: 8 }, () => null);

export default function Board() {
  const [rows, setRows] = useState<Field[][]>([
    ...initialWhiteField,
    ...Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => null)),
    ...initialBlackField,
    [],
  ]);

  return (
    <div className="grid grid-cols-8 grid-rows-8 gap-0 size-full">
      {rows.map((row, j) => (
        <>
          {row.map((col, i) => (
            <div
              className={`size-[12.5vh] ${
                (i + j) % 2 === 0 ? "bg-white" : "bg-lime-950"
              }`}
            >
              {col ? (
                <img className="size-[80%] m-auto" src={col.iconPath} />
              ) : (
                ""
              )}
            </div>
          ))}
        </>
      ))}
    </div>
  );
}

function getPath(piece: Piece, player: Player) {
  const color = player === "B" ? "black" : "white";
  let pieceName;
  switch (piece) {
    case "B":
      pieceName = "bishop";
      break;
    case "K":
      pieceName = "king";
      break;

    case "Q":
      pieceName = "queen";
      break;

    case "R":
      pieceName = "rook";
      break;

    case "P":
      pieceName = "pawn";
      break;

    case "Kn":
      pieceName = "knight";
      break;
  }

  return `pieces/${color}_${pieceName}.svg`;
}
