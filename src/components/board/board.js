/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/core'

import './board.css'

import Tile from '../tile/tile'

export default class Board extends React.Component {
  constructor(props) {
    super(props)

    this.gameStarted = false
    this.gridSize = 4

    this.setGame()
  }

  prepareGrid(withReturn = false) {
    const results = []
    this.gridSizeStyles += `grid-template-columns: `
    for (let x = 0; x < this.gridSize; x++) {
      this.gridSizeStyles += `auto `
      for (let y = 0; y < this.gridSize; y++) {
        const item = {
          position: { x, y },
          number: 0
        }
        results.push(item)
        if (!withReturn) {
          this.dataTiles.push(item)
        }
      }
    }
    this.gridSizeStyles += `;`
    return results
  }

  putNewNumber(count = 1) {
    for (let index = 0; index < count; index++) {
      const freeCells = this.dataTiles.filter(item => item.number === 0)

      if (freeCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * (freeCells.length - 1))
        const randomCell = freeCells[randomIndex]
        randomCell.number = Math.round(Math.random()) === 0 ? 2 : 4

        const randomCellIndex = this.dataTiles.findIndex(item => {
          return item.position === randomCell.position
        })

        this.dataTiles[randomCellIndex] = randomCell

        const dataTiles = this.state.dataTiles
        dataTiles.push(<Tile data={randomCell} key={Date.now()} />)

        this.setState({ dataTiles })

        this.saveGame()
      }

      if (this.dataTiles.filter(item => item.number === 0).length === 0) {
        this.isGameOver = true
        this.resetStorage()
        this.props.controllerStatusUpdates({ reset: true, undo: false, redo: false, replay: false })
        setTimeout(() => {
          this.setState({ isGameOver: true })
        }, 1000)
      }
    }
  }

  retrieveData() {
    let savedData = window.localStorage.getItem('gameState')
    if (savedData) {
      savedData = JSON.parse(savedData)
      this.setTilesFromData(savedData.dataTiles)
    } else {
      setTimeout(() => {
        this.putNewNumber(2)
      }, 500)
    }
  }

  setTilesFromData(data) {
    this.dataTiles = data
    const dataTiles = this.dataTiles
      .filter(item => item.number !== 0)
      .map(tileItem => (
        <Tile
          data={tileItem}
          key={Date.now() + '' + tileItem.position.x + '' + tileItem.position.y}
        />
      ))
    this.setState({ dataTiles })
  }

  moveTiles(direction) {
    let isLowerMargin = false
    let isHigherMargin = false
    let stableAxisName = 'y'
    let searchAxisName = 'x'

    switch (direction) {
      case 37:
        isLowerMargin = true
        break
      case 38:
        stableAxisName = 'x'
        searchAxisName = 'y'
        isLowerMargin = true
        break
      case 39:
        isHigherMargin = true
        break
      case 40:
        stableAxisName = 'x'
        searchAxisName = 'y'
        isHigherMargin = true
        break
      default:
        break
    }

    const dataTiles = this.dataTiles
      .filter(item => item.number !== 0)
      .sort((firstItem, secondItem) => {
        if (isLowerMargin) {
          return firstItem.position[searchAxisName] - secondItem.position[searchAxisName]
        } else if (isHigherMargin) {
          return secondItem.position[searchAxisName] - firstItem.position[searchAxisName]
        } else {
          return false
        }
      })

    do {
      const tileItem = dataTiles[0]
      const { position } = tileItem

      const newPosition = this.findNearestVacant({
        position,
        stableAxisName,
        searchAxisName,
        isLowerMargin,
        isHigherMargin
      })

      // const mergePosition = this.findMergableSets({
      //   number,
      //   position,
      //   stableAxisName,
      //   searchAxisName,
      //   isLowerMargin,
      //   isHigherMargin
      // })

      // if (mergePosition) {
      //   newPosition = mergePosition
      // }

      if (newPosition) {
        this.gameStarted = true
        this.undoMove = { dataTiles: this.dataTiles }

        this.props.controllerStatusUpdates({ reset: true, replay: true })

        this.updateDomTile({
          from: tileItem.position,
          to: newPosition.position,
          number: newPosition.number || tileItem.number
        })
      }
      dataTiles.shift()
    } while (dataTiles.length > 0)
    this.putNewNumber()
  }

  // FIXME: Messedup code!!!! 🤫
  findMergableSets({
    number,
    position,
    stableAxisName,
    searchAxisName,
    isLowerMargin,
    isHigherMargin
  }) {
    const items = this.dataTiles
      .filter(tileItem => {
        return (
          tileItem.number === number &&
          tileItem.position !== position &&
          tileItem.position[stableAxisName] === position[stableAxisName] &&
          true
        )
      })
      .map(tileItem => {
        tileItem.number = number * 2
        return tileItem
      })

    console.log('MERG_FINDS', items)
    return null
    // return items.length === 1 ? items[0] : null
  }

  updateDomTile({ from, to, number, remove }) {
    const element = document.querySelector(`[data-position="${from.x}-${from.y}"]`)
    if (remove) {
      element.remove()
    } else {
      element.setAttribute('data-position', `${to.x}-${to.y}`)
      if (number) {
        element.setAttribute('data-value', number)
      }
    }
    this.makeTilesFromDom()
  }

  makeTilesFromDom() {
    const allTiles = document.querySelectorAll('.tile-item')
    this.dataTiles = this.prepareGrid(true).map(dataItem => {
      let data = dataItem
      for (let index = 0; index < allTiles.length; index++) {
        const item = allTiles[index]
        const positions = item
          .getAttribute('data-position')
          .split('-')
          .map(num => parseInt(num))
        if (dataItem.position.x === positions[0] && dataItem.position.y === positions[1]) {
          data = {
            position: {
              x: positions[0],
              y: positions[1]
            },
            number: parseInt(item.getAttribute('data-value'))
          }
        }
      }
      return data
    })
  }

  findNearestVacant({ stableAxisName, searchAxisName, position, isLowerMargin, isHigherMargin }) {
    if (
      (isLowerMargin && position[searchAxisName] === 0) ||
      (isHigherMargin && position[searchAxisName] === this.gridSize - 1)
    ) {
      return null
    }
    const item = this.dataTiles
      .filter(tileItem => {
        return (
          tileItem.number === 0 && tileItem.position[stableAxisName] === position[stableAxisName]
        )
      })
      .sort((firstItem, secondItem) => {
        if (isLowerMargin) {
          return firstItem.position[searchAxisName] - secondItem.position[searchAxisName]
        } else if (isHigherMargin) {
          return secondItem.position[searchAxisName] - firstItem.position[searchAxisName]
        } else {
          return null
        }
      })
    if (
      item[0] &&
      ((isLowerMargin && item[0].position[searchAxisName] > position[searchAxisName]) ||
        (isHigherMargin && item[0].position[searchAxisName] < position[searchAxisName]))
    ) {
      return null
    }
    return item.length ? item[0] : null
  }

  saveGame() {
    if (this.gameStarted) {
      const dataTiles = this.dataTiles
      window.localStorage.setItem(
        'gameState',
        JSON.stringify({
          dataTiles
        })
      )

      this.props.controllerStatusUpdates({
        undo: this.undoMove !== null,
        redo: this.redoMove !== null
      })
    }
  }

  resetStorage() {
    window.localStorage.removeItem('gameState')
  }

  setGame(totalNewGame = false) {
    this.props.controllerStatusUpdates({ undo: false, replay: false, reset: true, redo: false })

    this.gameStarted = false
    this.dataTiles = []
    this.tileStyles = ``
    this.gridSizeStyles = ``
    this.layoutItems = []
    this.isGameOver = false

    // Time Machine
    this.undoMove = null
    this.redoMove = null

    this.state = {
      dataTiles: [],
      isGameOver: false
    }

    this.prepareGrid()
    this.prepareTileLayout()

    if (totalNewGame) {
      this.resetStorage()
      this.setState(this.state)
      this.retrieveData()
    }
  }

  performUndo() {
    if (this.undoMove !== null) {
      this.setTilesFromData(this.undoMove.dataTiles)
      this.redoMove = { dataTiles: this.dataTiles }
      this.undoMove = null
    }
    this.props.controllerStatusUpdates({
      undo: this.undoMove !== null,
      redo: this.redoMove !== null
    })
  }

  performRedo() {
    if (this.redoMove !== null) {
      this.setTilesFromData(this.redoMove.dataTiles)
      this.undoMove = this.redoMove
      this.redoMove = null
    }
    this.props.controllerStatusUpdates({
      undo: this.undoMove !== null,
      redo: this.redoMove !== null
    })
  }

  replayMoves() {
    alert('replay')
  }

  prepareTileLayout() {
    this.layoutItems = this.dataTiles.map(item => {
      const xPosition = item.position.x * (85 + 10)
      const yPosition = item.position.y * (80 + 10)
      this.tileStyles += `
          .tile-item[data-position="${item.position.x}-${item.position.y}"] {
            transform: translate(${xPosition}px, ${yPosition}px);
          }
        `
      return <div key={`${item.position.x}${item.position.y}`} className="grid-item"></div>
    })
  }

  keyListener({ board, keyCode }) {
    // 37 = left
    // 38 = top
    // 39 = right
    // 40 = down
    if (!this.isGameOver && [37, 38, 39, 40].includes(keyCode)) {
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
        <div
          css={css`
            ${this.gridSizeStyles}
          `}
          className="board-grid"
        >
          {this.layoutItems}
        </div>
        <div
          className="tile-grid"
          css={css`
            ${this.tileStyles}
          `}
        >
          {this.state.dataTiles}
        </div>
        {this.state.isGameOver ? <div className="game-over"></div> : ''}
      </div>
    )
  }
}
