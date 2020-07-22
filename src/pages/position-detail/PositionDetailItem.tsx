import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { truncateStringInTheMiddle } from 'util/tools'
import { fetchPosition_position } from 'types/generatedGQL'

interface Props {
  data: any
}

export const PositionDetailItem = ({ data }: Props) => {
  const { position } = data
  const { id, collateralToken } = position

  return (
    <>
      <div className="row">
        <label>Position Id: </label>
        {truncateStringInTheMiddle(id, 6, 6)}
        <CopyToClipboard text={position.id}>
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
