import { truncateStringInTheMiddle } from 'util/tools'

import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import { GetPosition_position as Position } from '../../types/generatedGQL'

interface Props {
  position: Position
}

const OutcomeList = ({ outcomeList }: { outcomeList: number[] }) => {
  return (
    <>
      {outcomeList.map((value) => (
        <div key={`index-${value}`}>{value}</div>
      ))}
    </>
  )
}

export const PositionDetailItem = ({ position }: Props) => {
  const { collateralToken, id, indexSets } = position

  const numberedOutcomes = indexSets.map((indexSet: string) => {
    return Number(indexSet)
      .toString(2)
      .split('')
      .reverse()
      .map((value, index) => (value === '1' ? index + 1 : 0))
      .filter((n) => !!n)
  })

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
      <div className="row">
        <label>Partition: </label>

        {numberedOutcomes.map((outcomeList, index) => {
          return (
            <div className="outcomePartition" key={`outcomelist-${index}`}>
              <OutcomeList outcomeList={outcomeList}></OutcomeList>
            </div>
          )
        })}
      </div>
    </>
  )
}
