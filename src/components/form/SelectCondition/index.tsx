import { useDebounceCallback } from '@react-hook/debounce'
import { useConditionContext } from 'contexts/ConditionContext'
import React from 'react'

import { SelectConditionModal } from '../../modals/SelectConditionModal'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

interface Props {
  title?: string
}

export const SelectCondition: React.FC<Props> = (props) => {
  const { title = 'Condition Id', ...restProps } = props
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
      <TitleValue
        title={title}
        titleControl={<TitleControl onClick={openModal}>Select Condition</TitleControl>}
        value={
          <>
            <Textfield
              error={!!errors.length}
              onChange={inputHandler}
              placeholder={loading ? 'Loading...' : 'Please select a condition...'}
              type="text"
              value={conditionId}
            />
            {!!errors.length && (
              <ErrorContainer>
                {errors.map((error, i) => (
                  <Error key={`error${i}`}>{error}</Error>
                ))}
              </ErrorContainer>
            )}
          </>
        }
        {...restProps}
      />
      {isModalOpen && (
        <SelectConditionModal
          isOpen={isModalOpen}
          onConfirm={closeModal}
          onRequestClose={closeModal}
        />
      )}
    </>
  )
}
