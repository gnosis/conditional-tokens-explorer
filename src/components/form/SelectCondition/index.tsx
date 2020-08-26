import { useDebounceCallback } from '@react-hook/debounce'
import { SelectConditionModal } from 'components/modals/SelectConditionModal'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import React from 'react'
import styled from 'styled-components'

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
  const [conditionId, setManualConditionId] = React.useState<string>('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const debouncedHandler = useDebounceCallback((id) => {
    setConditionId(id)
  }, 500)
  const inputHandler = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setManualConditionId(value)
      debouncedHandler(value)
    },
    [debouncedHandler]
  )

  const closeModal = React.useCallback(() => setIsModalOpen(false), [])
  const openModal = React.useCallback(() => setIsModalOpen(true), [])

  React.useEffect(() => {
    if (condition) {
      setManualConditionId(condition.id)
    } else {
      setManualConditionId('')
    }
  }, [condition])

  return (
    <>
      <Row cols={'1fr'} marginBottomXL>
        <TitleValue
          title="Condition Id"
          titleControl={<TitleControl onClick={openModal}>Select Condition</TitleControl>}
          value={
            <>
              <Textfield
                error={!!errors.length}
                onChange={inputHandler}
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
