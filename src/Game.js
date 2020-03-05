import React from 'react'

import ScoreSheet from './components/ScoreSheet'
import Controls from './components/Controls'
import Board from './components/Borad'

function Game() {
  return (
    <div className="main-wrap">
      <div className="main-board">
        <ScoreSheet />
        <div className="message">
          Join the numbers and get to the <b>2048 tile!</b>
        </div>
        <Board />
      </div>
      <Controls />
    </div>
  )
}

export default Game
