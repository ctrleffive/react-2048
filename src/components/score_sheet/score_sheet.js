import React from 'react'

import './score_sheet.css'

const ScoreSheet = () => {
  return (
    <div className="head">
      <div className="head-title">2048</div>
      <div className="head-scores">
        <div className="score">
          <div className="score-title">Score</div>
          <div className="score-value">0</div>
        </div>
        <div className="score">
          <div className="score-title">Best</div>
          <div className="score-value">0</div>
        </div>
      </div>
    </div>
  )
}

export default ScoreSheet
