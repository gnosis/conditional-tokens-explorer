import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import {
  FilterTitle,
  FilterTitleButton,
  FilterWrapper,
} from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { MAX_OUTCOMES_ALLOWED, MIN_OUTCOMES_ALLOWED } from 'config/constants'

const Wrapper = styled.div``

const Row = styled.div`
  column-gap: 8px;
  display: grid;
  grid-template-columns: 1fr 32px;

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
`

interface Props {
  onChangeMin?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChangeMax?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  onSubmit: (min: Maybe<number>, max: Maybe<number>) => void
  title: string
  minValue: Maybe<number>
  maxValue: Maybe<number>
}

export const MinMaxFilter: React.FC<Props> = (props) => {
  const {
    maxValue: maxFromProps,
    minValue: minFromProps,
    onChangeMax,
    onChangeMin,
    onClear,
    onSubmit,
    title,
  } = props

  const [min, setMin] = React.useState<Maybe<number>>(null)
  const [max, setMax] = React.useState<Maybe<number>>(null)

  const minInput = React.useRef<HTMLInputElement>(null)
  const maxInput = React.useRef<HTMLInputElement>(null)

  const onChangeMinInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeMin === 'function') {
        onChangeMin(event)
      }

      setMin(event.currentTarget.value.length ? +event.currentTarget.value : null)
    },
    [onChangeMin]
  )

  const clearMin = React.useCallback(() => {
    if (minInput.current) minInput.current.value = ''
    setMin(null)
  }, [minInput])

  const clearMax = React.useCallback(() => {
    if (maxInput.current) maxInput.current.value = ''
    setMax(null)
  }, [maxInput])

  React.useEffect(() => {
    if (minFromProps === null) {
      clearMin()
    }
  }, [minFromProps, clearMin])

  React.useEffect(() => {
    if (maxFromProps === null) {
      clearMax()
    }
  }, [maxFromProps, clearMax])

  const clear = React.useCallback(() => {
    clearMin()
    clearMax()
    onClear && onClear()
  }, [clearMin, clearMax, onClear])

  const onChangeMaxInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeMax === 'function') {
        onChangeMax(event)
      }

      setMax(event.currentTarget.value.length ? +event.currentTarget.value : null)
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
    const minTrunc = min !== null ? Math.trunc(min) : null
    const maxTrunc = max !== null ? Math.trunc(max) : null

    setMin(minTrunc !== null && minTrunc < MIN_OUTCOMES_ALLOWED ? MIN_OUTCOMES_ALLOWED : minTrunc)
    setMax(maxTrunc !== null && maxTrunc > MAX_OUTCOMES_ALLOWED ? MAX_OUTCOMES_ALLOWED : maxTrunc)
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
      <FilterWrapper>
        <FilterTitle>{title}</FilterTitle>
        {onClear && (
          <FilterTitleButton disabled={emptyValues} onClick={clear}>
            Clear
          </FilterTitleButton>
        )}
      </FilterWrapper>
      <Row>
        <FieldsWrapper>
          <TextFieldStyled
            autoComplete="off"
            max={MAX_OUTCOMES_ALLOWED}
            min={MIN_OUTCOMES_ALLOWED}
            name="min"
            onChange={onChangeMinInternal}
            onKeyPress={onKeyPress}
            onKeyUp={onKeyUp}
            placeholder="Min..."
            ref={minInput}
            type="number"
          />
          <Dash />
          <TextFieldStyled
            autoComplete="off"
            max={MAX_OUTCOMES_ALLOWED}
            min={MIN_OUTCOMES_ALLOWED}
            name="max"
            onChange={onChangeMaxInternal}
            onKeyPress={onKeyPress}
            onKeyUp={onKeyUp}
            placeholder="Max..."
            ref={maxInput}
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
