import { truncateStringInTheMiddle } from 'util/tools'

import { Row } from 'components/pureStyledComponents/Row'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'

import { useConditionContext } from '../../../contexts/ConditionContext'

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
      setConditionToDisplay(truncateStringInTheMiddle(condition.id, 8, 6))
    } else {
      setConditionToDisplay('')
    }
  }, [condition])

  return (
    <Row cols={'1fr'} marginBottomXL>
      <TitleValue
        title="Condition Id"
        titleControl={<TitleControl onClick={selectCondition}>Select Condition</TitleControl>}
        value={
          <WrapperDisplay errors={errors} loading={loading}>
            {conditionToDisplay}
          </WrapperDisplay>
        }
      />
    </Row>
  )
}
