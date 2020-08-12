import { ButtonLink } from 'components/buttons'
import { TitleValue } from 'components/text/TitleValue'
import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'
import styled from 'styled-components'

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
    <TitleValue
      title={
        <TitleWrapper>
          <span>Condition Id</span>
          <ButtonLink onClick={selectCondition}>Select Condition</ButtonLink>
        </TitleWrapper>
      }
      value={
        <WrapperDisplay errors={errors} loading={loading}>
          {conditionToDisplay}
        </WrapperDisplay>
      }
    />
  )
}

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
