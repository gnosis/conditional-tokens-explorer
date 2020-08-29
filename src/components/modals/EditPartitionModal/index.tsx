import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../buttons/Button'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import { Outcome } from '../../partitions/Outcome'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { CardSubtitle } from '../../pureStyledComponents/CardSubtitle'
import { CardText } from '../../pureStyledComponents/CardText'
import {
  StripedList,
  StripedListEmpty,
  StripedListItemLessPadding,
} from '../../pureStyledComponents/StripedList'
import { TitleControlButton } from '../../pureStyledComponents/TitleControl'
import { InfoCard } from '../../statusInfo/InfoCard'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TitleValue } from '../../text/TitleValue'

export const EditPartitionModal: React.FC<ModalProps> = (props) => {
  const { ...restProps } = props

  // const isLoading = !conditionIdToSearch && loading
  // const isSearching = conditionIdToSearch && loading

  const mockedNumberedOutcomes = [[1, 4, 3], [2, 5], [10, 11], [6, 8, 9], [7]]

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
        <CardSubtitle>Add Outcomes To Collection</CardSubtitle>
        <CardText>
          No outcomes available. You can make them available by removing them from collections
          below.
        </CardText>
        <CardSubtitle>New Collection</CardSubtitle>
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
          value={
            <>
              <CardText>
                Click on an outcome to remove it from a collection. You can also drag outcomes
                across collections.
              </CardText>
              <StripedList>
                {mockedNumberedOutcomes.map(
                  (outcomeList: unknown | any, outcomeListIndex: number) => {
                    return (
                      <StripedListItemLessPadding key={outcomeListIndex}>
                        {outcomeList.map((outcome: string, outcomeIndex: number) => (
                          <Outcome key={outcomeIndex} outcome={outcome} />
                        ))}
                      </StripedListItemLessPadding>
                    )
                  }
                )}
              </StripedList>
            </>
          }
        />
        <ButtonContainer>
          <Button>Save</Button>
        </ButtonContainer>
      </>
      {/* )} */}
    </Modal>
  )
}
