import React from 'react'

import './board.css'

const Board = () => {
  const layoutItems = []
  for (let index = 0; index < 4 * 4; index++) {
    layoutItems.push(<div key={index} className="grid-item"></div>)
  }

  return (
    <div className="game-board">
      <div className="board-grid">{layoutItems}</div>
      <div className="tile-grid">
        <div className="tile-item" data-position="0-0" data-value="2"></div>
        <div className="tile-item" data-position="1-0" data-value="2"></div>
      </div>
    </div>
  )
}

export default Board
