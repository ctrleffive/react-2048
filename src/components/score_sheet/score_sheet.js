import React from 'react'

import './score_sheet.css'

export default class ScoreSheet extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      score: 0,
      bestScore: 0
    }
  }

  scoreUpdate(data) {
    this.setState(data)
  }

  render() {
    return (
      <div className="head">
        <div className="head-title">2048</div>
        <div className="head-scores">
          <div className="score">
            <div className="score-title">Score</div>
            <div className="score-value">{this.state.score}</div>
          </div>
          <div className="score">
            <div className="score-title">Best</div>
            <div className="score-value">{this.state.bestScore}</div>
          </div>
        </div>
      </div>
    )
  }
}
