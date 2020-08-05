import React from 'react'

import { useConditionContext } from '../../contexts/ConditionContext'
import { displayCondition } from '../../util/tools'

import { WrapperDisplay } from './WrapperDisplay'

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
      setConditionToDisplay(displayCondition(condition))
    } else {
      setConditionToDisplay('')
    }
  }, [condition])

  return (
    <>
      <label>Condition ID</label>
      <WrapperDisplay dataToDisplay={conditionToDisplay} errors={errors} loading={loading} />
      <button onClick={selectCondition}>Select Condition</button>
    </>
  )
}
