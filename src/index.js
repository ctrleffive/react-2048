import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'

import ScoreSheet from './components/score_sheet/score_sheet'
import Controls from './components/controls/controls'
import Board from './components/board/borad'

import './index.css'

const Game = () => {
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

ReactDOM.render(<Game />, document.getElementById('root'))

serviceWorker.unregister()
