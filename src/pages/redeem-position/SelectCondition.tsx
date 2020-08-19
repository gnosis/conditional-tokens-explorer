import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'

import { useConditionContext } from '../../contexts/ConditionContext'

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
    <>
      <label>Resolved Condition ID</label>
      <WrapperDisplay errors={errors} loading={loading}>
        <p>{conditionToDisplay}</p>
      </WrapperDisplay>
      <button onClick={selectCondition}>Select Condition</button>
    </>
  )
}
