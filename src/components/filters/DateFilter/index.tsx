import moment from 'moment'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import {
  FilterTitle,
  FilterTitleButton,
  FilterWrapper,
} from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { MAX_DATE, MIN_DATE } from 'config/constants'
import { useDebounce } from 'hooks/useDebounce'

const Wrapper = styled.div``

const Rows = styled.div``

const Row = styled.div`
  align-items: flex-end;
  column-gap: 8px;
  display: grid;
  grid-template-columns: 1fr 32px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.label`
  color: ${(props) => props.theme.colors.textColor};
  display: block;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 3px;
`

const FieldWrapper = styled.div`
  min-width: 0;
`

const Date = styled(Textfield)`
  font-size: 14px;
  height: 32px;
  padding-left: 6px;
  padding-right: 6px;
  position: relative;
`

interface Props {
  onChangeFrom?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChangeTo?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  onSubmit: (from: Maybe<number>, to: Maybe<number>) => void
  title: string
  toValue: Maybe<number>
  fromValue: Maybe<number>
}

const MILISECONDS_TO_DEBOUNCE = 1000

export const DateFilter: React.FC<Props> = (props) => {
  const {
    fromValue: fromValueFromProps,
    onChangeFrom,
    onChangeTo,
    onClear,
    onSubmit,
    title,
    toValue: toValueFromProps,
    ...restProps
  } = props
  const fromDate = useRef<HTMLInputElement>(null)
  const toDate = useRef<HTMLInputElement>(null)

  const [from, setFrom] = React.useState<Maybe<number>>(null)
  const [to, setTo] = React.useState<Maybe<number>>(null)
  const [isFromValid, setIsFromValid] = React.useState<undefined | boolean>()
  const [isToValid, setIsToValid] = React.useState<undefined | boolean>()
  const maxDateUTC = moment(MAX_DATE).utc().endOf('day').unix()
  const minDateUTC = moment(MIN_DATE).utc().startOf('day').unix()

  const checkFromValidity = React.useCallback((value: string) => {
    setIsFromValid(moment(value).isValid())
  }, [])

  const checkToValidity = React.useCallback((value: string) => {
    setIsToValid(moment(value).isValid())
  }, [])

  const onChangeFromInternal = React.useCallback(
    (value: string) => {
      checkFromValidity(value)

      const currentMinDate = moment.utc(value).startOf('day').unix()

      const fromTimestamp =
        currentMinDate < minDateUTC
          ? minDateUTC
          : currentMinDate > maxDateUTC
          ? maxDateUTC
          : currentMinDate

      setFrom(fromTimestamp)
    },
    [checkFromValidity, maxDateUTC, minDateUTC]
  )

  const onChangeToInternal = React.useCallback(
    (value: string) => {
      checkToValidity(value)

      const currentMaxDate = moment.utc(value).endOf('day').unix()

      const toTimestamp =
        currentMaxDate > maxDateUTC
          ? maxDateUTC
          : currentMaxDate < minDateUTC
          ? minDateUTC
          : currentMaxDate

      setTo(toTimestamp)
    },
    [checkToValidity, maxDateUTC, minDateUTC]
  )

  const emptyValues = React.useMemo(() => !from && !to, [from, to])
  const fromGreaterThanToError = React.useMemo(() => (to && from && to < from) || false, [from, to])
  const invalidTo = React.useMemo(() => isToValid !== undefined && !isToValid, [isToValid])
  const invalidFrom = React.useMemo(() => isFromValid !== undefined && !isFromValid, [isFromValid])
  const showErrors = React.useMemo(() => invalidTo || invalidFrom || fromGreaterThanToError, [
    invalidTo,
    invalidFrom,
    fromGreaterThanToError,
  ])
  const submitDisabled = React.useMemo(() => showErrors || emptyValues, [showErrors, emptyValues])

  const onSubmitInternal = React.useCallback(() => {
    if ((from || to) && !submitDisabled) {
      onSubmit(from, to)
    }
  }, [from, to, onSubmit, submitDisabled])

  const onKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSubmitInternal()
      }
    },
    [onSubmitInternal]
  )

  React.useEffect(() => {
    if (!from && !to) onSubmit(from, to)
  }, [from, to, onSubmit])

  const clearFrom = React.useCallback(() => {
    if (fromDate.current) fromDate.current.value = ''
    setFrom(null)
  }, [fromDate])

  const clearTo = React.useCallback(() => {
    if (toDate.current) toDate.current.value = ''
    setTo(null)
  }, [toDate])

  React.useEffect(() => {
    if (fromValueFromProps === null) {
      clearFrom()
    }
  }, [fromValueFromProps, clearFrom])

  React.useEffect(() => {
    if (toValueFromProps === null) {
      clearTo()
    }
  }, [toValueFromProps, clearTo])

  const clear = React.useCallback(() => {
    clearFrom()
    clearTo()
    onClear && onClear()
    setIsFromValid(undefined)
    setIsToValid(undefined)
  }, [clearFrom, clearTo, onClear])

  const debounceFromValidity = useDebounce(
    (value: string) => checkFromValidity(value),
    MILISECONDS_TO_DEBOUNCE
  )
  const debounceToValidity = useDebounce(
    (value: string) => checkToValidity(value),
    MILISECONDS_TO_DEBOUNCE
  )
  const debounceOnChangeFromInternal = useDebounce(
    (value: string) => onChangeFromInternal(value),
    MILISECONDS_TO_DEBOUNCE
  )
  const debounceOnChangeToInternal = useDebounce(
    (value: string) => onChangeToInternal(value),
    MILISECONDS_TO_DEBOUNCE
  )

  const clearDisabled = React.useMemo(
    () => emptyValues && isFromValid === undefined && isToValid === undefined,
    [emptyValues, isFromValid, isToValid]
  )
  return (
    <Wrapper {...restProps}>
      <FilterWrapper>
        <FilterTitle>{title}</FilterTitle>
        {onClear && (
          <FilterTitleButton disabled={clearDisabled} onClick={clear}>
            Clear
          </FilterTitleButton>
        )}
      </FilterWrapper>
      <Rows className="dateFilterRows">
        <Row className="dateFilterRow">
          <FieldWrapper>
            <Label>From:</Label>
            <Date
              max={MAX_DATE}
              min={MIN_DATE}
              name="dateFrom"
              onChange={(event) => {
                if (typeof onChangeFrom === 'function') {
                  onChangeFrom(event)
                }
                const value = event.currentTarget.value
                debounceOnChangeFromInternal(value)
              }}
              onKeyUp={(event) => {
                onKeyUp(event)
                const value = event.currentTarget.value
                debounceFromValidity(value)
              }}
              ref={fromDate}
              type="date"
            />
          </FieldWrapper>
        </Row>
        <Row className="dateFilterRow">
          <FieldWrapper>
            <Label>To:</Label>
            <Date
              max={MAX_DATE}
              min={MIN_DATE}
              name="dateTo"
              onChange={(event) => {
                if (typeof onChangeTo === 'function') {
                  onChangeTo(event)
                }
                const value = event.currentTarget.value
                debounceOnChangeToInternal(value)
              }}
              onKeyUp={(event) => {
                onKeyUp(event)
                const value = event.currentTarget.value
                debounceToValidity(value)
              }}
              ref={toDate}
              type="date"
            />
          </FieldWrapper>
          <ButtonFilterSubmit disabled={submitDisabled} onClick={onSubmitInternal} />
        </Row>
      </Rows>
      {showErrors && (
        <ErrorContainer>
          {fromGreaterThanToError && (
            <ErrorMessage>
              <i>To</i> must be greater than <i>From</i>
            </ErrorMessage>
          )}
          {invalidFrom && (
            <ErrorMessage>
              <i>From</i> date is invalid
            </ErrorMessage>
          )}
          {invalidTo && (
            <ErrorMessage>
              <i>To</i> date is invalid
            </ErrorMessage>
          )}
        </ErrorContainer>
      )}
    </Wrapper>
  )
}
