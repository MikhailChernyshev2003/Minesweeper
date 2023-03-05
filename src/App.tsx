import React from 'react';
// @ts-ignore
// import Minesweeper from "react-minesweeper";
import "react-minesweeper/lib/minesweeper.css";
import Minesweeper from "./Minesweeper";
import "./index.css";

function App() {
  return (
    <div className="App">
      <Minesweeper
          bombsCount={40}
          boardWidth={16}
          boardHeight={16}
      />
    </div>
  );
}

export default App;
