/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/core'

import './board.css'

export default class Board extends React.Component {
  constructor(props) {
    super(props)

    this.gameStarted = false
    this.gridSize = 4
    this.dataGrid = []
    this.tileStyles = ``
    this.layoutItems = []

    this.state = {
      dataTiles: []
    }

    this.prepareGrid()
    this.prepareTileLayout()
  }

  prepareGrid() {
    for (let xIndex = 0; xIndex < this.gridSize; xIndex++) {
      const row = []
      for (let yIndex = 0; yIndex < this.gridSize; yIndex++) {
        row.push(null)
      }
      this.dataGrid.push(row)
    }
  }

  putNewNumber(count = 1) {
    if (count === 1) {
      this.gameStarted = true
    }
    for (let index = 0; index < count; index++) {
      const freeCells = []
      this.dataGrid.forEach((xItem, x) => {
        xItem.forEach((yItem, y) => {
          if (yItem === null) {
            freeCells.push({
              position: { x, y },
              number: Math.round(Math.random()) === 0 ? 2 : 4
            })
          }
        })
      })
      if (freeCells.length === 0) {
        alert('full!')
      } else {
        const randomIndex = Math.floor(Math.random() * (freeCells.length - 1))
        const randomCell = freeCells[randomIndex]

        this.dataGrid[randomCell.position.x][randomCell.position.y] = randomCell
        const dataTiles = this.state.dataTiles
        dataTiles.push(
          <div
            key={`${randomCell.position.x}${randomCell.position.y}`}
            className="tile-item"
            data-position={`${randomCell.position.x}-${randomCell.position.y}`}
            data-value={randomCell.number}
          ></div>
        )
        this.setState({ dataTiles })
        this.saveGame()
      }
    }
  }

  retrieveData() {
    let savedData = window.localStorage.getItem('gameState')
    if (savedData) {
      savedData = JSON.parse(savedData)
      const dataTiles = []
      this.dataGrid = savedData.dataGrid
      this.dataGrid.forEach(xItem => {
        xItem.forEach(yItem => {
          if (yItem !== null) {
            dataTiles.push(
              <div
                key={`${yItem.position.x}${yItem.position.y}`}
                className="tile-item"
                data-position={`${yItem.position.x}-${yItem.position.y}`}
                data-value={yItem.number}
              ></div>
            )
          }
        })
      })
      this.setState({ dataTiles })
    } else {
      setTimeout(() => {
        this.putNewNumber(2)
      }, 500)
    }
  }

  saveGame() {
    // TODO: Save game feature!
    // if (this.gameStarted) {
    //   window.localStorage.setItem('gameState', JSON.stringify({
    //     dataGrid: this.dataGrid
    //   }))
    // }
  }

  prepareTileLayout() {
    this.dataGrid.forEach((xItem, xIndex) => {
      xItem.forEach((_yItem, yIndex) => {
        const xPosition = xIndex * (85 + 10)
        const yPosition = yIndex * (80 + 10)
        this.tileStyles += `
          .tile-item[data-position="${xIndex}-${yIndex}"] {
            transform: translate(${xPosition}px, ${yPosition}px);
          }
        `
        this.layoutItems.push(<div key={`${xIndex}${yIndex}`} className="grid-item"></div>)
      })
    })
  }

  keyListener({ board, keyCode }) {
    switch (keyCode) {
      // left arrow
      case 37:
        board.putNewNumber()
        break

      // top arrow
      case 38:
        console.log('top!')
        break

      // right arrow
      case 39:
        console.log('right!')
        break

      // down arrow
      case 40:
        console.log('down!')
        break

      default:
        break
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', ({ keyCode }) => {
      this.keyListener({ keyCode, board: this })
    })

    this.retrieveData()
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', ({ keyCode }) => {
      this.keyListener({ keyCode, board: this })
    })
  }

  render() {
    return (
      <div className="game-board">
        <div className="board-grid">{this.layoutItems}</div>
        <div
          className="tile-grid"
          css={css`
            ${this.tileStyles}
          `}
        >
          {this.state.dataTiles}
        </div>
      </div>
    )
  }
}
