import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'

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
  onChangeMin: () => void
  onChangeMax: () => void
  onSubmit: () => void
  title: string
}

export const MinMaxFilter: React.FC<Props> = (props) => {
  const { onChangeMax, onChangeMin, onSubmit, title } = props

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldsWrapper>
          <TextFieldStyled name="min" onChange={onChangeMin} placeholder="Min..." type="number" />
          <Dash />
          <TextFieldStyled name="max" onChange={onChangeMax} placeholder="Max..." type="number" />
        </FieldsWrapper>
        <ButtonFilterSubmit onClick={onSubmit} />
      </Row>
    </Wrapper>
  )
}
