import { useQuery } from '@apollo/react-hooks'
import { GetPositionQuery } from 'queries/positions'
import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'
import { GetPosition, GetPositionVariables, GetPosition_position } from 'types/generatedGQL'

import { BYTES_REGEX } from '../../../config/constants'
import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

const Span = styled.span``

export interface InputPositionProps {
  barebones?: boolean
  formMethods: FormContextValues<SplitPositionFormMethods>
  onPositionChange: (position: GetPosition_position) => void
  splitFromPosition: boolean
}

export const InputPosition = ({
  barebones = false,
  formMethods: { errors, register, setError, watch },
  onPositionChange,
  splitFromPosition,
  ...restProps
}: InputPositionProps) => {
  const watchPositionId = watch('positionId')
  const errorPositionId = errors.positionId
  const skipFetchPosition = watchPositionId === '' || !splitFromPosition || !!errorPositionId

  const { data: fetchedPosition, error: errorFetchingPosition, loading } = useQuery<
    GetPosition,
    GetPositionVariables
  >(GetPositionQuery, {
    variables: { id: watchPositionId },
    skip: skipFetchPosition,
  })

  const queryUsed = !(loading || skipFetchPosition || errorFetchingPosition)

  useEffect(() => {
    if (queryUsed && fetchedPosition) {
      const { position } = fetchedPosition
      if (position) {
        onPositionChange(position)
      } else {
        setError('positionId', 'validate', "position doesn't exist")
      }
    }
  }, [fetchedPosition, onPositionChange, queryUsed, setError])

  useEffect(() => {
    if (errorFetchingPosition) {
      setError('positionId', 'validate', 'error fetching position')
    }
  }, [errorFetchingPosition, setError])

  const value = (
    <Span {...restProps}>
      <Textfield
        disabled={!splitFromPosition}
        name="positionId"
        placeholder="Please select a position..."
        ref={register({
          required: splitFromPosition,
          pattern: BYTES_REGEX,
        })}
        type="text"
      />
      {errorPositionId && (
        <ErrorContainer>
          {errorPositionId.type === 'pattern' && <Error>{'Invalid bytes32 string'}</Error>}
          {errorPositionId.type === 'validate' && <Error>{errorPositionId.message}</Error>}
        </ErrorContainer>
      )}
    </Span>
  )

  return barebones ? (
    value
  ) : (
    <TitleValue
      title="Position Id"
      titleControl={<TitleControl>Select Position</TitleControl>}
      value={value}
      {...restProps}
    />
  )
}
