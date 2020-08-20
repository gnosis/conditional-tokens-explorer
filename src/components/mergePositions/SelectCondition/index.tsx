import React from 'react'

import { useConditionContext } from '../../../contexts/ConditionContext'
import { Errors } from '../../../util/types'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

export const SelectCondition = () => {
  const { condition, errors, loading, setConditionId } = useConditionContext()
  const [conditionToDisplay, setConditionToDisplay] = React.useState<string>('')

  const selectCondition = () => {
    const conditionIdFromPrompt = window.prompt(`Enter the condition: `)
    if (conditionIdFromPrompt) {
      setConditionId(conditionIdFromPrompt)
    }
  }

  React.useEffect(() => {
    if (condition) {
      setConditionToDisplay(condition.id)
    } else {
      setConditionToDisplay('')
    }
  }, [condition])

  return (
    <TitleValue
      title="Condition Id"
      titleControl={<TitleControl onClick={selectCondition}>Select Condition</TitleControl>}
      value={
        <>
          <Textfield
            disabled={loading}
            error={errors.length > 0}
            name="conditionId"
            onChange={(e) => setConditionToDisplay(e.currentTarget.value)}
            placeholder="Please select a condition..."
            type="text"
            value={conditionToDisplay}
          />
          {errors && (
            <ErrorContainer>
              {errors.map((error: Errors, index: number) => (
                <Error key={index}>{error}</Error>
              ))}
            </ErrorContainer>
          )}
        </>
      }
    />
  )
}
