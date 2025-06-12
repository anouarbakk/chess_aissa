export type Piece = "K" | "Q" | "R" | "P" | "Kn" | "B";
export type Player = "B" | "W";
export type Field = {
  piece: Piece;
  player: Player;
  iconPath: string;
} | null;

const whitePieces = 
  ["R", "Kn", "B", "Q", "K", "B", "Kn", "R"] satisfies Piece[];
const whitePawns = 
  Array.from({ length: 8 }, () => "P") satisfies Piece[]

// const initialWhiteField = initialWhitePieces.map((row) =>
//   row.map((piece) => ({
//     piece,
//     player: "W" as Player,
//     iconPath: getPath(piece, "W"),
//   }))
// );

const blackPieces = 
  ["R", "Kn", "B", "Q", "K", "B", "Kn", "R"] satisfies Piece[]
const blackPawns = 
Array.from({ length: 8 }, () => "P") satisfies Piece[]

const nullRow = Array.from({ length: 8 }, () => null);

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

export function createBoard(){
      const pieces = [whitePieces, whitePawns, ...Array.from({length:4}, () => nullRow), blackPawns, blackPieces ]
      return pieces.map((row, i) =>
  row.map((piece) => piece ?({
    piece,
    player:  getPlayer( i) ,
    iconPath: getPath(piece, getPlayer( i)),
  }) : null)
);
}

function getPlayer(index:number):Player{
    if(index < 2){
      return "W"
    }
    return "B"
  
}