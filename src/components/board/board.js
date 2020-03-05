/** @jsx jsx */
import { css, jsx } from '@emotion/core'

import './board.css'

const Board = () => {
  const layoutItems = []
  for (let index = 0; index < 4 * 4; index++) {
    layoutItems.push(<div key={index} className="grid-item"></div>)
  }

  let tileStyles = ``
  for (let xIndex = 0; xIndex <= 3; xIndex++) {
    for (let yIndex = 0; yIndex <= 3; yIndex++) {
      const xPosition = xIndex * (85 + 10)
      const yPosition = yIndex * (80 + 10)
      tileStyles += `
        .tile-item[data-position="${xIndex}-${yIndex}"] {
          transform: translate(${xPosition}px, ${yPosition}px);
        }
      `
    }
  }

  return (
    <div className="game-board">
      <div className="board-grid">{layoutItems}</div>
      <div
        className="tile-grid"
        css={css`
          ${tileStyles}
        `}
      >
        <div className="tile-item" data-position="0-0" data-value="2"></div>
        <div className="tile-item" data-position="1-0" data-value="4"></div>
        <div className="tile-item" data-position="2-0" data-value="8"></div>
        <div className="tile-item" data-position="3-0" data-value="16"></div>
        <div className="tile-item" data-position="0-1" data-value="32"></div>
        <div className="tile-item" data-position="1-1" data-value="64"></div>
        <div className="tile-item" data-position="2-1" data-value="2"></div>
        <div className="tile-item" data-position="3-1" data-value="128"></div>
        <div className="tile-item" data-position="0-2" data-value="256"></div>
        <div className="tile-item" data-position="1-2" data-value="512"></div>
        <div className="tile-item" data-position="2-2" data-value="1024"></div>
        <div className="tile-item" data-position="3-2" data-value="2048"></div>
        <div className="tile-item" data-position="0-3" data-value="2"></div>
        <div className="tile-item" data-position="1-3" data-value="4"></div>
        <div className="tile-item" data-position="2-3" data-value="8"></div>
        <div className="tile-item" data-position="3-3" data-value="16"></div>
      </div>
    </div>
  )
}

export default Board
