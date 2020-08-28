import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../buttons/Button'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from '../../pureStyledComponents/StripedList'
import { TitleControlButton } from '../../pureStyledComponents/TitleControl'
import { InfoCard } from '../../statusInfo/InfoCard'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TitleValue } from '../../text/TitleValue'

export const EditPartitionModal: React.FC<ModalProps> = (props) => {
  const { ...restProps } = props

  // const isLoading = !conditionIdToSearch && loading
  // const isSearching = conditionIdToSearch && loading

  const mockedNumberedOutcomes = [
    [1, 4, 3],
    [2, 5],
  ]

  return (
    <Modal title="Edit Partition" {...restProps}>
      {/* {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading conditions..." />
        </LoadingWrapper>
      )}
      {error && <InfoCard message={error.message} title="Error" />} */}
      {/* {!isLoading && ( */}
      <>
        {/* Stuff */}
        <TitleValue
          title="Collections"
          titleControl={
            <TitleControlButton
              onClick={() => {
                console.error('Delete allllll')
              }}
            >
              Edit Partition
            </TitleControlButton>
          }
          value={<div>asdg</div>}
        />
        <ButtonContainer>
          <Button>Save</Button>
        </ButtonContainer>
      </>
      {/* )} */}
    </Modal>
  )
}
