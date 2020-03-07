import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'

import './index.css'

import ScoreSheet from './components/score_sheet/score_sheet'
import Controls from './components/controls/controls'
import Board from './components/board/board'

class Game extends React.Component {
  constructor(props) {
    super(props)

    this.boardRef = React.createRef()
    this.scoreRef = React.createRef()

    this.state = {
      controllerStates: {
        undo: false,
        replay: false,
        reset: false,
        redo: false
      }
    }
  }

  /**
   * Handle controller button's status updates events from board. (boardRef is there)
   * @param {Object} controllerStates Object contains visibility
   * states of undo, replay, reset, redo
   */
  controllerStatusUpdates(controllerStates) {
    controllerStates = { ...this.state.controllerStates, ...controllerStates }
    this.setState({
      controllerStates
    })
  }

  /**
   * Recieve events from controler component and call needed methods inside board component
   * @param {string} type Event type
   */
  controlBoard(type) {
    switch (type) {
      case 'reset':
        this.boardRef.current.setGame(true)
        break

      case 'undo':
        this.boardRef.current.performUndo()
        break

      case 'redo':
        this.boardRef.current.performRedo()
        break

      case 'replay':
        this.boardRef.current.replayMoves()
        break

      default:
        break
    }
  }

  /**
   * Score updates from board component
   * @param {object} score Object with `score` & `bestScore`
   */
  scoreUpdates(score) {
    this.scoreRef.current.scoreUpdate(score)
  }

  render() {
    return (
      <div className="main-wrap">
        <div className="main-board">
          <ScoreSheet ref={this.scoreRef} />
          <div className="message">
            Join the numbers and get to the <b>2048 tile!</b>
          </div>
          <Board
            ref={this.boardRef}
            scoreUpdates={this.scoreUpdates.bind(this)}
            controllerStatusUpdates={this.controllerStatusUpdates.bind(this)}
          />
        </div>
        <Controls
          buttonStates={this.state.controllerStates}
          buttonClick={this.controlBoard.bind(this)}
        />
      </div>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))

serviceWorker.unregister()
