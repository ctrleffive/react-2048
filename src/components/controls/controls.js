import React from 'react'

import './controls.css'

import UndoImg from '../../assets/undo.png'
import RedoImg from '../../assets/redo.png'
import ResetImg from '../../assets/reset.png'
import ReplayImg from '../../assets/replay.png'

const Controls = props => {
  return (
    <div className="controls">
      <button
        disabled={!props.buttonStates.undo}
        onClick={() => props.buttonClick('undo')}
        className="control"
      >
        <img src={UndoImg} alt="Undo" className="button-icon" />
        <div className="button-label">Undo</div>
      </button>
      <button
        disabled={!props.buttonStates.replay}
        onClick={() => props.buttonClick('replay')}
        className="control"
      >
        <img src={ReplayImg} alt="Replay" className="button-icon" />
        <div className="button-label">Replay</div>
      </button>
      <button
        disabled={!props.buttonStates.reset}
        onClick={() => props.buttonClick('reset')}
        className="control"
      >
        <img src={ResetImg} alt="Reset" className="button-icon" />
        <div className="button-label">Reset</div>
      </button>
      <button
        disabled={!props.buttonStates.redo}
        onClick={() => props.buttonClick('redo')}
        className="control"
      >
        <img src={RedoImg} alt="Redo" className="button-icon" />
        <div className="button-label">Redo</div>
      </button>
    </div>
  )
}

export default Controls
