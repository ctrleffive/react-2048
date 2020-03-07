/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/core'

import './board.css'

import Tile from '../tile/tile'

/**
 * Board Component.
 * Handles all sort of tile movements and complex logic.
 */
export default class Board extends React.Component {
  constructor(props) {
    super(props)

    // Grid size is customizable
    this.gridSize = 4

    // INFO: Refer to `setGame()` method for other properties.
    this.setGame()
  }

  /**
   * Prepare grid items based on the grid size.
   * @param {bool} withReturn If this param is `true`,
   * grid will be returned, not pushed to `dataTiles`
   */
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

  /**
   * Search for free cells, if found put a new number (either 2 or 4).
   * If no free cells found, GAME OVER!
   * @param {number} count How many numbers need to put. When a new game starts, need to put 2.
   */
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
        this.gameOverProcedures()
      }
    }
  }

  /**
   * Game Over!
   * `localStorage` will be cleared.
   * Controllers will be notified.
   * Update state with game over notification.
   */
  gameOverProcedures() {
    this.isGameOver = true
    this.resetStorage()
    this.props.controllerStatusUpdates({ reset: true, undo: false, redo: false, replay: false })
    setTimeout(() => {
      this.setState({ isGameOver: true })
    }, 1000)
  }

  /**
   * Retrieve data from `localStorage`. If exists, arrange tiles according to data.
   * If no data, put 2 new numbers.
   */
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

  /**
   * Update DOM based on given tile data.
   * @param {object} data
   */
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

  /**
   * Move tiles to free space based on the direction.
   * @param {number} direction `KeyCode` of direction arrows.
   * 37 = left, 38 = top, 39 = right, 40 = down
   */
  moveTiles(direction) {
    /**
     * Is the direction point towards a lower index position
     */
    let isLowerMargin = false
    /**
     * Is the direction point towards a higher index position
     */
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

      const newPosition = this.findNearestFreeCell({
        position,
        stableAxisName,
        searchAxisName,
        isLowerMargin,
        isHigherMargin
      })

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

  /**
   * Find and return mergable tiles.
   * FIXME: MESSEDUP CODE!!!! 🤫
   */
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

  /**
   * Find DOM element and update with new positions and values.
   * @param {object} data Object that contains `from` = original
   * position, `to` = new position, `number` = number to be updated,
   * `remove` = is the element need to be removed instead of updating the position.
   */
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

  /** Populate `dataTiles` array based on the DOM elements.
   * Reverse of `setTilesFromData()` method
   */
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

  /**
   * Search for nearest free cell according to current position and direction
   * @param {object} data Current tile position details.
   * `position` = current position of the tile
   * `stableAxisName` = axis that is with same value
   * `searchAxisName` = axis that the future tile need to be found
   * `isLowerMargin` = is the direction point towards a lower index position
   * `isHigherMargin` = is the direction point towards a higher index position
   */
  findNearestFreeCell({ stableAxisName, searchAxisName, position, isLowerMargin, isHigherMargin }) {
    // Checking if current postion is at edges.
    // If yes, don't move!
    if (
      (isLowerMargin && position[searchAxisName] === 0) ||
      (isHigherMargin && position[searchAxisName] === this.gridSize - 1)
    ) {
      return null
    }
    const item = this.dataTiles
      .filter(tileItem => {
        // Checking if cell is free & on same axis as original
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
    // Checking if found postion is inner or outer index than the margin.
    // If yes, don't move!
    if (
      item[0] &&
      ((isLowerMargin && item[0].position[searchAxisName] > position[searchAxisName]) ||
        (isHigherMargin && item[0].position[searchAxisName] < position[searchAxisName]))
    ) {
      return null
    }
    return item.length ? item[0] : null
  }

  /**
   * Save game state to `localStorage`
   */
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

  /**
   * Initialize game variables and prepare for a fresh game.
   * @param {bool} totalNewGame If this param is `true`, a total
   * localStorage erase will also happen.
   */
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

  /**
   * Design grid board layout with position styles based on tiles data.
   */
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

  /**
   * Eventlistener attachment method for key presses.
   * @param {Board} board Board object. Passed from event listener
   * because `this` is not available here.
   * @param {number} keyCode 37 = left key, 38 = up key, 39 = right key, 40 = down key
   */
  keyListener({ board, keyCode }) {
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
