import React from 'react'

import './tile.css'

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

export default Tile
