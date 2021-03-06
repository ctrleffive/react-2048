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
    this.scores = {
      score: 0,
      bestScore: 0
    }

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
   * @param {object} exactTile Predefined tile data from auto play feature.
   * @returns {number} Number or last put tile
   */
  putNewNumber(count = 1, exactTile = null) {
    let lastTile
    for (let index = 0; index < count; index++) {
      const freeCells = this.dataTiles.filter(item => item.number === 0)

      if (freeCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * (freeCells.length - 1))
        const newTile = exactTile || freeCells[randomIndex]

        if (!exactTile) {
          newTile.number = Math.round(Math.random()) === 0 ? 2 : 4
        }

        lastTile = newTile

        const newTileIndex = this.dataTiles.findIndex(item => {
          return item.position === newTile.position
        })

        this.dataTiles[newTileIndex] = newTile

        const dataTiles = this.state.dataTiles
        dataTiles.push(<Tile data={newTile} key={Date.now()} />)

        this.setState({ dataTiles })

        this.saveGame()
      }

      const mergableChances = this.findMergableSets()
      const freeCellsAgain = this.dataTiles.filter(item => item.number === 0)
      if (freeCellsAgain.length === 0 && mergableChances.length === 0) {
        this.gameOverProcedures()
      }
    }
    if (count === 2) this.autoTiles = this.dataTiles
    return lastTile || null
  }

  /**
   * Update score & bestScore
   * @param {number} score
   * @param {object} scores Scores object sometimes comes from undo & redo
   * If then use it as it is.
   */
  scoreUpdate(score, scores) {
    if (this.isMovable) {
      if (scores) {
        this.scores = scores
      } else {
        this.scores.score += score
        if (this.scores.bestScore < this.scores.score) {
          this.scores.bestScore += score
        }
      }
      // emit score update event
      this.props.scoreUpdates(this.scores)
    }
  }

  /**
   * Game Over!
   * `localStorage` will be cleared.
   * Controllers will be notified.
   * Update state with game over notification.
   * @param {bool} isWinner If this is `true` show WIN message
   */
  gameOverProcedures(isWinner = false) {
    this.isGameOver = true
    this.resetStorage()
    setTimeout(() => {
      this.props.controllerStatusUpdates({ reset: true, undo: false, redo: false, replay: false })
      this.setState({ isGameOver: true, isWinner: isWinner })
    }, 1000)
  }

  /**
   * Retrieve data from `localStorage`. If exists, arrange tiles according to data.
   * If no data, put 2 new numbers.
   */
  retrieveData() {
    const savedData = JSON.parse(window.localStorage.getItem('gameState') || '{}')

    if (savedData.scores) {
      this.scores = savedData.scores
      this.scoreUpdate(0)
    }
    if (savedData.dataTiles) {
      this.moves = savedData.moves || []
      this.autoTiles = savedData.autoTiles || []

      this.props.controllerStatusUpdates({ replay: this.moves.length, reset: true })

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
   * @param {object} exactTile Predefined tile data from auto play feature.
   * @param {bool} noMerge Just move only, dont update values.
   * @returns {number} Number or last put tile
   */
  moveTiles(direction, exactTile = null, noMerge = false) {
    let anythingMoved = false
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
        anythingMoved = true
        this.gameStarted = true

        if (this.isMovable) this.props.controllerStatusUpdates({ reset: true, replay: true })

        this.updateDomTile({
          from: tileItem.position,
          to: newPosition.position
        })
      }
      dataTiles.shift()
    } while (dataTiles.length > 0)

    if (!noMerge) {
      let mergeScore = 0
      const mergables = this.findMergableSets(direction)
      for (const mergable of mergables) {
        mergeScore += mergable.number * 2
        this.updateDomTile({
          from: mergable.from.position,
          to: mergable.to.position,
          number: mergable.number
        })

        this.updateDomTile({
          remove: true,
          from: mergable.to.position,
          number: mergable.number
        })
      }
      this.scoreUpdate(mergeScore)

      if (mergables.length) {
        this.moveTiles(direction, exactTile, true)
      }

      if (anythingMoved) {
        return this.putNewNumber(1, exactTile)
      } else {
        return null
      }
    }
  }

  /**
   * Find and return mergable tiles.
   * @param {number} direction `KeyCode` of direction arrows.
   * 37 = left, 38 = top, 39 = right, 40 = down. If not provided,
   * search for all directions and return list
   */
  findMergableSets(direction) {
    if (direction) {
      let mergables = []
      for (let xIndex = 0; xIndex < this.gridSize; xIndex++) {
        let itemsRow = []
        for (let yIndex = 0; yIndex < this.gridSize; yIndex++) {
          const item = this.dataTiles.filter(item => {
            if (direction === 37 || direction === 39) {
              return item.position.x === yIndex && item.position.y === xIndex
            } else {
              return item.position.x === xIndex && item.position.y === yIndex
            }
          })[0]
          itemsRow.push(item)
        }
        itemsRow = itemsRow.filter(item => item.number !== 0)
        if (direction === 39 || direction === 40) {
          itemsRow = itemsRow.reverse()
        }

        const rowMergables = []
        if (itemsRow.length) {
          for (let index = 0; index < itemsRow.length - 1; index++) {
            const item = itemsRow[index]
            if (
              !rowMergables.length ||
              rowMergables.filter(merItem => {
                return (
                  merItem.position !== item.position &&
                  merItem.from.position !== item.position &&
                  true
                )
              }).length
            ) {
              const nextItem = itemsRow[index + 1]
              if (item.number === nextItem.number) {
                rowMergables.push({
                  number: item.number,
                  from: nextItem,
                  to: item
                })
              }
            }
          }
        }
        mergables = [...mergables, ...rowMergables]
      }

      return mergables
    } else {
      let mergableChances = []
      for (const keyCode of [37, 38, 39, 40]) {
        mergableChances = [...mergableChances, ...this.findMergableSets(keyCode)]
      }
      return mergableChances
    }
  }

  /**
   * Find DOM element and update with new positions and values.
   * @param {object} data Object that contains `from` = original
   * position, `to` = new position, `number` = number where condition,
   * when updating, use double value. `remove` = is the element need
   * to be removed instead of updating the position.
   */
  updateDomTile({ from, to, number, remove }) {
    let condition = `[data-position="${from.x}-${from.y}"]`
    if (number) {
      condition += `[data-value="${number}"]`
    }
    condition += `:not(.merged)`
    const element = document.querySelector(condition)
    if (remove) {
      element.classList.add('merged')
    } else {
      element.setAttribute('data-position', `${to.x}-${to.y}`)
      if (number) {
        const newNumber = number * 2
        element.setAttribute('data-value', newNumber)
        if (newNumber === 2048) this.gameOverProcedures(true)
      }
    }
    this.makeTilesFromDom()
  }

  /** Populate `dataTiles` array based on the DOM elements.
   * Reverse of `setTilesFromData()` method
   */
  makeTilesFromDom() {
    const allTiles = document.querySelectorAll('.tile-item:not(.merged)')
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
    if (this.gameStarted && this.isMovable) {
      window.localStorage.setItem(
        'gameState',
        JSON.stringify({
          dataTiles: this.dataTiles,
          autoTiles: this.autoTiles,
          scores: this.scores,
          moves: this.moves
        })
      )

      this.props.controllerStatusUpdates({
        undo: this.undoMove !== null,
        redo: this.redoMove !== null
      })
    }
  }

  resetStorage() {
    const savedData = JSON.parse(window.localStorage.getItem('gameState') || '{}')
    if (this.scores.score === 0) {
      if (this.scores.bestScore === 0) {
        window.localStorage.removeItem('gameState')
      } else {
        if (window.confirm('This will reset best score also!')) {
          window.localStorage.removeItem('gameState')
          this.scores = { score: 0, bestScore: 0 }
          this.props.scoreUpdates(this.scores)
        }
      }
    } else {
      savedData.scores.score = 0
      delete savedData.dataTiles
      window.localStorage.setItem('gameState', JSON.stringify(savedData))
    }
  }

  /**
   * Initialize game variables and prepare for a fresh game.
   * @param {bool} totalNewGame If this param is `true`, a total
   * localStorage erase will also happen.
   */
  setGame(totalNewGame = false) {
    this.props.controllerStatusUpdates({ undo: false, replay: false, reset: true, redo: false })

    this.gameStarted = false
    this.isGameOver = false
    this.isMovable = true

    this.dataTiles = []
    this.tileStyles = ``
    this.gridSizeStyles = ``
    this.layoutItems = []

    // Time Machine
    this.autoTiles = []
    this.moves = []
    this.undoMove = null
    this.redoMove = null

    this.state = {
      dataTiles: [],
      isGameOver: false,
      isWinner: false
    }

    this.prepareGrid()
    this.prepareTileLayout()

    if (totalNewGame) {
      this.resetStorage()
      this.setState(this.state)
      this.retrieveData()
    }
  }

  setUndo() {
    this.undoMove = {
      dataTiles: JSON.parse(JSON.stringify(this.dataTiles)),
      scores: JSON.parse(JSON.stringify(this.scores))
    }
  }

  performUndo() {
    if (this.undoMove !== null) {
      this.redoMove = {
        dataTiles: JSON.parse(JSON.stringify(this.dataTiles)),
        scores: JSON.parse(JSON.stringify(this.scores))
      }
      this.scoreUpdate(0, this.undoMove.scores)
      this.setTilesFromData(this.undoMove.dataTiles)
      this.undoMove = null
    }
    this.props.controllerStatusUpdates({
      undo: this.undoMove !== null,
      redo: this.redoMove !== null
    })
  }

  performRedo() {
    if (this.redoMove !== null) {
      this.scoreUpdate(0, this.redoMove.scores)
      this.setTilesFromData(this.redoMove.dataTiles)
      this.redoMove = null
    }
    this.props.controllerStatusUpdates({
      undo: this.undoMove !== null,
      redo: this.redoMove !== null
    })
  }

  async replayMoves() {
    this.isMovable = false
    this.props.controllerStatusUpdates({ undo: false, replay: false, reset: false, redo: false })

    this.setTilesFromData(this.autoTiles)

    // Move tiles automatically till `moves` are empty
    for (const move of this.moves) {
      await new Promise((resolve, reject) => {
        // never going to happen, just to hide linter error
        if (!move) reject()

        setTimeout(() => {
          this.moveTiles(move.keyCode, move.newTile)
          resolve()
        }, 2000)
      })
    }

    this.props.controllerStatusUpdates({ reset: true })
    this.isMovable = true
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
    if (this.isMovable && !this.isGameOver && [37, 38, 39, 40].includes(keyCode)) {
      this.setUndo()
      const newTile = board.moveTiles(keyCode)
      if (newTile) this.moves.push({ keyCode, newTile })
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
        {this.state.isGameOver ? (
          <div className={'game-over ' + (this.state.isWinner ? 'winner' : '')}></div>
        ) : (
          ''
        )}
      </div>
    )
  }
}
