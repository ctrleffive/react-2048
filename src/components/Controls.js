import React from 'react'

import UndoImg from '../assets/undo.png'
import RedoImg from '../assets/redo.png'
import ResetImg from '../assets/reset.png'
import ReplayImg from '../assets/replay.png'

function Controls() {
  return (
    <div className="controls">
      <button className="control">
        <img src={UndoImg} alt="Undo" className="button-icon" />
        <div className="button-label">Undo</div>
      </button>
      <button className="control">
        <img src={ReplayImg} alt="Replay" className="button-icon" />
        <div className="button-label">Replay</div>
      </button>
      <button className="control">
        <img src={ResetImg} alt="Reset" className="button-icon" />
        <div className="button-label">Reset</div>
      </button>
      <button className="control">
        <img src={RedoImg} alt="Redo" className="button-icon" />
        <div className="button-label">Redo</div>
      </button>
    </div>
  )
}

export default Controls
