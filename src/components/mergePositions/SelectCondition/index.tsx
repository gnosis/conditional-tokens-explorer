import { truncateStringInTheMiddle } from 'util/tools'

import { useDebounceCallback } from '@react-hook/debounce'
import { SelectConditionModal } from 'components/modals/SelectConditionModal'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Conditions_conditions } from 'types/generatedGQL'

const InfoMessage = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.4;
  margin: 0 0 5px 0;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }
`

export const SelectCondition = () => {
  const { condition, errors, loading, setConditionId } = useConditionContext()
  const [conditionToDisplay, setConditionToDisplay] = React.useState<string>('')
  const [conditionId, setManualConditionId] = React.useState<string>('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const selectCondition = useCallback((condition: Conditions_conditions) => {
    // const conditionIdFromPrompt = window.prompt(`Enter the condition: `)
    // if (conditionIdFromPrompt) {
    //   setConditionId(conditionIdFromPrompt)
    // }
  }, [])

  const debouncedHandler = useDebounceCallback((id) => {
    console.log('debounced', id)
    setConditionId(id)
  }, 500)
  const imputHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      console.log('change ')
      setManualConditionId(value)
      debouncedHandler(value)
    },
    [debouncedHandler]
  )

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const openModal = useCallback(() => setIsModalOpen(true), [])

  React.useEffect(() => {
    console.log('condition', condition)
    if (condition) {
      setConditionToDisplay(truncateStringInTheMiddle(condition.id, 8, 6))
      setManualConditionId(condition.id)
    } else {
      setConditionToDisplay('')
    }
  }, [condition])

  return (
    <>
      <Row cols={'1fr'} marginBottomXL>
        <TitleValue
          title="Condition Id"
          titleControl={<TitleControl onClick={openModal}>Select Condition</TitleControl>}
          value={
            // <WrapperDisplay errors={errors} loading={loading}>
            //   {conditionToDisplay}
            // </WrapperDisplay>
            <>
              <Textfield
                error={!!errors.length}
                name="conditionId"
                onChange={imputHandler}
                placeholder="Please select a condition..."
                type="text"
                value={conditionId}
              />
              {loading && (
                <ErrorContainer>
                  <InfoMessage>Loading...</InfoMessage>
                </ErrorContainer>
              )}
              {!!errors.length && (
                <ErrorContainer>
                  {errors.map((error, i) => (
                    <Error key={`error${i}`}>{error}</Error>
                  ))}
                </ErrorContainer>
              )}
            </>
          }
        />
      </Row>
      <SelectConditionModal
        isOpen={isModalOpen}
        onConfirm={closeModal}
        onRequestClose={closeModal}
      />
    </>
  )
}
