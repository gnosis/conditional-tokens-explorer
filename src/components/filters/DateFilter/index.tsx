import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
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
`

interface Props {
  onChangeFrom: () => void
  onChangeTo: () => void
  onSubmit: () => void
  title: string
}

export const DateFilter: React.FC<Props> = (props) => {
  const { onChangeFrom, onChangeTo, onSubmit, title } = props

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldWrapper>
          <Label>From:</Label>
          <Date name="dateFrom" onChange={onChangeFrom} type="date" />
        </FieldWrapper>
      </Row>
      <Row>
        <FieldWrapper>
          <Label>To:</Label>
          <Date name="dateTo" onChange={onChangeTo} type="date" />
        </FieldWrapper>
        <ButtonFilterSubmit onClick={onSubmit} />
      </Row>
    </Wrapper>
  )
}
