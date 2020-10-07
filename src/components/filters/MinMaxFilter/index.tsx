import React from 'react'
import styled from 'styled-components'

import { ButtonFilterSubmit } from 'components/buttons/ButtonFilterSubmit'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { Error as ErrorMessage, ErrorContainer } from 'components/pureStyledComponents/Error'


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
  onSubmit: (min:number, max:number) => void
  title: string
}

export const MinMaxFilter: React.FC<Props> = (props) => {
  const { onChangeMax, onChangeMin, onSubmit, title } = props

  const [min, setMin] = React.useState<Maybe<number>>(null)
  const [max, setMax] = React.useState<Maybe<number>>(null)

  const onChangeMinInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChangeMin === 'function') {
      onChangeMin(event)
    }
    setMin(+event.currentTarget.value)
  }

  const onChangeMaxInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChangeMax === 'function') {
      onChangeMax(event)
    }
    setMax(+event.currentTarget.value)
  }

  const onSubmitInternal = () => {
    if(min && max) onSubmit(min, max)
  }

  // This clear the filters
  React.useEffect(() => {
    if(!min || !max) onSubmit(0, 0)
  }, [min, max, onSubmit])

  const errorMessage = React.useMemo(() => (min && max && max < min) ? 'Max should be greater than Min': null, [min, max])
  const emptyValues = !min || !max

  return (
    <Wrapper>
      <FilterTitle>{title}</FilterTitle>
      <Row>
        <FieldsWrapper>
          <TextFieldStyled name="min" onChange={onChangeMinInternal} placeholder="Min..." type="number" />
          <Dash />
          <TextFieldStyled name="max" onChange={onChangeMaxInternal} placeholder="Max..." type="number" />
        </FieldsWrapper>
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
