import { useQuery } from '@apollo/react-hooks'
import { GetPositionQuery } from 'queries/positions'
import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import { GetPosition, GetPositionVariables, GetPosition_position } from 'types/generatedGQL'

import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { BYTES_REGEX } from '../../config/constants'

import { SplitPositionFormMethods } from './Form'

interface Props {
  splitFromPosition: boolean
  formMethods: FormContextValues<SplitPositionFormMethods>
  onPositionChange: (position: GetPosition_position) => void
}
export const InputPosition = ({
  formMethods: { errors, register, setError, watch },
  onPositionChange,
  splitFromPosition,
}: Props) => {
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
    <div>
      <input name="splitFrom" ref={register} type="radio" value="position" />
      <label>Position</label>
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
    </div>
  )
}
