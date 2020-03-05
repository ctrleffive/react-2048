import React from 'react'

const gridItems = () => {
  const items = []
  for (let index = 0; index < 4 * 4; index++) {
    items.push(<div key={index} className="grid-item"></div>)
  }
  return items
}

function Board() {
  return (
    <div className="game-board">
      <div className="board-grid">{gridItems()}</div>
    </div>
  )
}

export default Board
