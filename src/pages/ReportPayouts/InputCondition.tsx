import React from 'react'

import { Error, ErrorContainer } from '../../components/pureStyledComponents/Error'
import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { TitleControlButton } from '../../components/pureStyledComponents/TitleControl'
import { TitleValue } from '../../components/text/TitleValue'
import { ConditionErrors } from '../../util/types'

interface Props {
  conditionId: string
  errors: ConditionErrors[]
  loading: boolean
  onClick: () => void
}

// TODO: similar to wrapper display, maybe we can create a common component
export const InputCondition = (props: Props) => {
  const { conditionId, errors, loading, onClick } = props
  const isError = errors.length > 0

  return (
    <>
      <TitleValue
        title="Condition ID"
        titleControl={
          <TitleControlButton disabled={loading} onClick={onClick}>
            Select Condition
          </TitleControlButton>
        }
        value={
          <Textfield
            disabled={loading}
            error={isError}
            placeholder={loading ? 'Loading...' : ''}
            value={conditionId}
          />
        }
      />
      {isError && (
        <ErrorContainer>
          {errors.map((error: ConditionErrors, index: number) => (
            <Error key={index}>{error}</Error>
          ))}
        </ErrorContainer>
      )}
    </>
  )
}
