import { BigNumber } from 'ethers/utils'
import React from 'react'

import { Modal } from 'components/common/Modal'
import { DisplayTablePositionsWrapper } from 'components/form/DisplayTablePositions'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { formatBigNumber, isPositionIdValid } from 'util/tools'
import { Token } from 'util/types'

interface Props {
  amount: BigNumber
  closeAction: () => void
  mergeResult: string
  isOpen: boolean
  collateralToken: Token
}

export const MergeResultModal = ({
  amount,
  closeAction,
  collateralToken,
  isOpen,
  mergeResult,
}: Props) => {
  return isPositionIdValid(mergeResult) ? (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeAction}
      subTitle={`Positions were successfully merged`}
      title={'Merge Positions'}
    >
      <DisplayTablePositionsWrapper
        callbackOnHistoryPush={closeAction}
        collateral={collateralToken.address}
        positionIds={[{ positionId: mergeResult, balance: amount }]}
      />
    </Modal>
  ) : (
    <FullLoading
      actionButton={{ text: 'OK', onClick: () => closeAction() }}
      icon={IconTypes.ok}
      message={`Merge Finished. You will receive ${formatBigNumber(
        amount,
        collateralToken.decimals
      )} ${collateralToken.symbol}`}
      title={'Merge Positions'}
    ></FullLoading>
  )
}
