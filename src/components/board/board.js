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

  flattenItems({ onlyEmpty } = { onlyEmpty: false }) {
    const items = []
    for (const row of this.dataGrid) {
      for (const tileItem of row) {
        if (onlyEmpty) {
          if (tileItem.number === 0) {
            items.push(tileItem)
          }
        } else {
          if (tileItem.number !== 0) {
            items.push(tileItem)
          }
        }
      }
    }
    return items
  }

  prepareGrid() {
    for (let x = 0; x < this.gridSize; x++) {
      const row = []
      for (let y = 0; y < this.gridSize; y++) {
        row.push({
          position: { x, y },
          number: 0
        })
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
      for (const item of this.flattenItems({ onlyEmpty: true })) {
        freeCells.push({
          position: item.position,
          number: Math.round(Math.random()) === 0 ? 2 : 4
        })
      }
      if (freeCells.length === 0) {
        global.location.reload()
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
      this.dataGrid = savedData.dataGrid
      const dataTiles = []
      for (const tileItem of this.flattenItems()) {
        dataTiles.push(
          <div
            key={`${tileItem.position.x}${tileItem.position.y}`}
            className="tile-item"
            data-position={`${tileItem.position.x}-${tileItem.position.y}`}
            data-value={tileItem.number}
          ></div>
        )
      }
      this.setState({ dataTiles })
    } else {
      setTimeout(() => {
        this.putNewNumber(2)
        console.log('GRID', this.dataGrid)
      }, 500)
    }
  }

  moveTiles(direction) {
    for (const tileItem of this.flattenItems()) {
      let nextVacantSpace
      switch (direction) {
        case 37:
          nextVacantSpace = this.findNearestVacant({
            stableAxisName: 'y',
            searchAxisName: 'x',
            position: tileItem.position,
            isLowerMargin: true
          })
          break
        case 38:
          nextVacantSpace = this.findNearestVacant({
            stableAxisName: 'x',
            searchAxisName: 'y',
            position: tileItem.position,
            isLowerMargin: true
          })
          break
        case 39:
          nextVacantSpace = this.findNearestVacant({
            stableAxisName: 'y',
            searchAxisName: 'x',
            position: tileItem.position,
            isHigherMargin: true
          })
          break
        case 40:
          nextVacantSpace = this.findNearestVacant({
            stableAxisName: 'x',
            searchAxisName: 'y',
            position: tileItem.position,
            isHigherMargin: true
          })
          break
      }
      if (nextVacantSpace) {
        console.log(tileItem.position, 'NEAREST_VACANT', nextVacantSpace.position)
        // document
        //   .querySelector(`[data-position="${tileItem.position.x}-${tileItem.position.y}"]`)
        //   .setAttribute(
        //     'data-position',
        //     `${nextVacantSpace.position.x}-${nextVacantSpace.position.y}`
        //   )
        // this.dataGrid[tileItem.position.x]
        // [tileItem.position.y].position = nextVacantSpace.position
      }
    }
    this.putNewNumber()
  }

  findNearestVacant({ stableAxisName, searchAxisName, position, isLowerMargin, isHigherMargin }) {
    const item = this.flattenItems({
      onlyEmpty: true
    }).filter(tileItem => {
      const isSameAxis = tileItem.position[stableAxisName] === position[stableAxisName]
      const isLowerMargined =
        tileItem.position[searchAxisName] >= 0 &&
        tileItem.position[searchAxisName] < position[searchAxisName]
      const isHigherMargined =
        tileItem.position[searchAxisName] > position[searchAxisName] &&
        tileItem.position[searchAxisName] <= this.gridSize - 1

      return (
        isSameAxis &&
        (isLowerMargin ? isLowerMargined : true) &&
        (isHigherMargin ? isHigherMargined : true)
      )
    })
    return item.length ? item[0] : null
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
    // 37 = left
    // 38 = top
    // 39 = right
    // 40 = down
    if ([37, 38, 39, 40].includes(keyCode)) {
      board.moveTiles(keyCode)
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
