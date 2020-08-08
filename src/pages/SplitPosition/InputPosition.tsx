import { useQuery } from '@apollo/react-hooks'
import { GetPositionQuery } from 'queries/positions'
import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'
import { GetPosition, GetPositionVariables, GetPosition_position } from 'types/generatedGQL'

import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { BYTES_REGEX } from '../../config/constants'

import { SplitPositionFormMethods } from './Form'

const Wrapper = styled.div<{ visible?: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`

export interface InputPositionProps {
  splitFromPosition: boolean
  formMethods: FormContextValues<SplitPositionFormMethods>
  onPositionChange: (position: GetPosition_position) => void
}
export const InputPosition = ({
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

  return (
    <Wrapper visible={splitFromPosition} {...restProps}>
      <Textfield
        disabled={!splitFromPosition}
        name="positionId"
        ref={register({
          required: splitFromPosition,
          pattern: BYTES_REGEX,
        })}
        type="text"
      />
      {errorPositionId && (
        <div>
          <p>{errorPositionId.type === 'pattern' && 'Invalid bytes32 string'}</p>
          <p>{errorPositionId.type === 'validate' && errorPositionId.message}</p>
        </div>
      )}
    </Wrapper>
  )
}
