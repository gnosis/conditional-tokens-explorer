import moment from 'moment'
import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'

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
  onSubmit: (from: number, to: number) => void
  title: string
}

export const DateFilter: React.FC<Props> = (props) => {
  const { onChangeFrom, onChangeTo, onSubmit, title } = props

  const [from, setFrom] = React.useState<Maybe<number>>(null)
  const [to, setTo] = React.useState<Maybe<number>>(null)

  const onChangeFromInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChangeFrom === 'function') {
      onChangeFrom(event)
    }

    const fromDateMoment = moment(event.currentTarget.value)
    const fromTimestamp = fromDateMoment.unix()

    setFrom(fromTimestamp)
  }

  const onChangeToInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChangeTo === 'function') {
      onChangeTo(event)
    }

    const toDateMoment = moment(event.currentTarget.value)
    const toTimestamp = toDateMoment.unix()

    setTo(toTimestamp)
  }

  const onSubmitInternal = () => {
    if (from && to) onSubmit(from, to)
  }

  // This clear the filters
  React.useEffect(() => {
    if (!from || !to) onSubmit(0, 0)
  }, [from, to, onSubmit])

  const errorMessage = React.useMemo(
    () => (to && from && to < from ? 'To should be greater than From' : null),
    [from, to]
  )
  const emptyValues = React.useMemo(() => !from || !to, [from, to])

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldWrapper>
          <Label>From:</Label>
          <Date name="dateFrom" onChange={onChangeFromInternal} type="date" />
        </FieldWrapper>
      </Row>
      <Row>
        <FieldWrapper>
          <Label>To:</Label>
          <Date name="dateTo" onChange={onChangeToInternal} type="date" />
        </FieldWrapper>
        <ButtonFilterSubmit disabled={!!errorMessage || emptyValues} onClick={onSubmitInternal} />
      </Row>
      {errorMessage && (
        <ErrorContainer>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </ErrorContainer>
      )}
    </Wrapper>
  )
}
