import React from 'react'
import PropTypes from 'prop-types'

import './tile.css'

/**
 * Single moving tile item
 * @param {object} props
 */
const Tile = props => {
  const { position, number } = props.data
  return (
    <div
      className="tile-item"
      data-position={`${position.x}-${position.y}`}
      data-value={number}
    ></div>
  )
}

Tile.propTypes = {
  data: PropTypes.object
}

export default Tile
