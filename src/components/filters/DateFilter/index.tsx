import moment from 'moment'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { getLogger } from 'util/logger'

const Wrapper = styled.div``

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
`

interface Props {
  onChangeFrom?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChangeTo?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (from: Maybe<number>, to: Maybe<number>) => void
  minDate?: string
  maxDate?: string
  title: string
}

const logger = getLogger('DateFilter')

export const DateFilter: React.FC<Props> = (props) => {
  const { maxDate, minDate, onChangeFrom, onChangeTo, onSubmit, title } = props
  const toDate = useRef<HTMLInputElement>(null)
  const fromDate = useRef<HTMLInputElement>(null)

  const [from, setFrom] = React.useState<Maybe<number>>(null)
  const [to, setTo] = React.useState<Maybe<number>>(null)

  const onChangeFromInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeFrom === 'function') {
        onChangeFrom(event)
      }

      const fromDateMoment = moment(event.currentTarget.value).utc()
      const fromTimestamp = fromDateMoment.unix()

      setFrom(fromTimestamp)
    },
    [onChangeFrom]
  )

  const onChangeToInternal = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChangeTo === 'function') {
        onChangeTo(event)
      }

      const toDateMoment = moment(event.currentTarget.value).utc().add(24, 'hours')
      const toTimestamp = toDateMoment.unix()

      setTo(toTimestamp)
    },
    [onChangeTo]
  )

  const emptyValues = React.useMemo(() => !from && !to, [from, to])
  const validDates = React.useMemo(() => {
    if (fromDate && fromDate.current && toDate && toDate.current) {
      return toDate.current.checkValidity() && fromDate.current.checkValidity()
    } else {
      return true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

  const fromGreaterThanToError = React.useMemo(
    () =>
      to && from && to < from ? <ErrorMessage>To should be greater than From</ErrorMessage> : null,
    [from, to]
  )
  const datesValidityError = React.useMemo(
    () => (!validDates ? <ErrorMessage>Date out of range or invalid</ErrorMessage> : null),
    [validDates]
  )

  const submitDisabled = !!fromGreaterThanToError || emptyValues || !!datesValidityError

  const onSubmitInternal = React.useCallback(() => {
    if ((from || to) && !submitDisabled) {
      logger.log(from, to)
      onSubmit(from, to)
    }
  }, [from, to, onSubmit, submitDisabled])

  const onPressEnter = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmitInternal()
      }
    },
    [onSubmitInternal]
  )

  React.useEffect(() => {
    if (!from && !to) onSubmit(from, to)
  }, [from, to, onSubmit])

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldWrapper>
          <Label>From:</Label>
          <Date
            max={maxDate}
            min={minDate}
            name="dateFrom"
            onChange={onChangeFromInternal}
            onKeyUp={onPressEnter}
            ref={fromDate}
            type="date"
          />
        </FieldWrapper>
      </Row>
      <Row>
        <FieldWrapper>
          <Label>To:</Label>
          <Date
            max={maxDate}
            min={minDate}
            name="dateTo"
            onChange={onChangeToInternal}
            onKeyUp={onPressEnter}
            ref={toDate}
            type="date"
          />
        </FieldWrapper>
        <ButtonFilterSubmit disabled={submitDisabled} onClick={onSubmitInternal} />
      </Row>
      {(!!datesValidityError || !!fromGreaterThanToError) && (
        <ErrorContainer>
          {datesValidityError}
          {fromGreaterThanToError}
        </ErrorContainer>
      )}
    </Wrapper>
  )
}
