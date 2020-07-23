import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { truncateStringInTheMiddle } from 'util/tools'
import { GetPosition_position as Position } from '../../types/generatedGQL'

interface Props {
  position: Position
}

export const PositionDetailItem = ({ position }: Props) => {
  const { id, collateralToken } = position

  return (
    <>
      <div className="row">
        <label>Position Id: </label>
        {truncateStringInTheMiddle(id, 6, 6)}
        <CopyToClipboard text={id}>
          <button>Copy</button>
        </CopyToClipboard>
      </div>
      <div className="row">
        <label>Collateral Token: </label>
        {collateralToken.id}
      </div>
    </>
  )
}
