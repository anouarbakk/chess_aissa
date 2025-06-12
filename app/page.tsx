import Board from "./components/board";

export default function Home() {
  return (
    <div className="flex justify-center">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Board />
      </main>
    </div>
  );
}
