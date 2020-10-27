import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { MAX_OUTCOMES_ALLOWED, MIN_OUTCOMES_ALLOWED } from 'config/constants'

const Wrapper = styled.div``

const Row = styled.div`
  column-gap: 8px;
  display: grid;
  grid-template-columns: 1fr 32px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const FieldsWrapper = styled.div`
  align-items: center;
  column-gap: 5px;
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
`

const Dash = styled.div`
  background-color: ${(props) => props.theme.colors.mediumGrey};
  height: 1px;
  width: 10px;
`

const TextFieldStyled = styled(Textfield)`
  font-size: 14px;
  height: 32px;
  min-width: 0;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

interface Props {
  onChangeMin?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChangeMax?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (min: Maybe<number>, max: Maybe<number>) => void
  title: string
}

export const MinMaxFilter: React.FC<Props> = (props) => {
  const { onChangeMax, onChangeMin, onSubmit, title } = props

  const [min, setMin] = React.useState<Maybe<number>>(null)
  const [max, setMax] = React.useState<Maybe<number>>(null)

  const onChangeMinInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeMin === 'function') {
        onChangeMin(event)
      }
      setMin(+event.currentTarget.value)
    },
    [onChangeMin]
  )

  const onChangeMaxInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeMax === 'function') {
        onChangeMax(event)
      }
      setMax(+event.currentTarget.value)
    },
    [onChangeMax]
  )

  const errorMessage = React.useMemo(
    () => (min && max && max < min ? 'Max should be greater than Min' : null),
    [min, max]
  )
  const emptyValues = React.useMemo(() => !min && !max, [min, max])
  const submitDisabled = React.useMemo(() => !!errorMessage || emptyValues, [
    errorMessage,
    emptyValues,
  ])

  const validateBounds = React.useCallback(() => {
    if (min) {
      setMin(Math.trunc(min))
      if (min < MIN_OUTCOMES_ALLOWED) setMin(MIN_OUTCOMES_ALLOWED)
    }

    if (max) {
      setMax(Math.trunc(max))
      if (max > MAX_OUTCOMES_ALLOWED) setMax(MAX_OUTCOMES_ALLOWED)
    }
  }, [max, min])

  React.useEffect(() => {
    validateBounds()
  }, [validateBounds])

  const onSubmitInternal = React.useCallback(() => {
    if ((min || max) && !submitDisabled) onSubmit(min, max)
  }, [min, max, submitDisabled, onSubmit])

  const onKeyUp = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmitInternal()
      }
    },
    [onSubmitInternal]
  )

  const onKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' || e.key === '-') {
      e.preventDefault()
    }
  }, [])

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldsWrapper>
          <TextFieldStyled
            autoComplete="off"
            min={MIN_OUTCOMES_ALLOWED}
            name="min"
            onChange={onChangeMinInternal}
            onKeyPress={onKeyPress}
            onKeyUp={onKeyUp}
            placeholder="Min..."
            type="number"
          />
          <Dash />
          <TextFieldStyled
            autoComplete="off"
            max={MAX_OUTCOMES_ALLOWED}
            name="max"
            onChange={onChangeMaxInternal}
            onKeyPress={onKeyPress}
            onKeyUp={onKeyUp}
            placeholder="Max..."
            type="number"
          />
        </FieldsWrapper>
        <ButtonFilterSubmit disabled={submitDisabled} onClick={onSubmitInternal} />
      </Row>
      {errorMessage && (
        <ErrorContainer>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </ErrorContainer>
      )}
    </Wrapper>
  )
}
