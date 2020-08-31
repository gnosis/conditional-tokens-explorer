import React from 'react'
import styled from 'styled-components'

const outcomeDimensions = '24px'

export const Wrapper = styled.div`
  align-items: center;
  display: flex;

  &:last-child {
    .outcomeHorizontalLine {
      display: none;
    }
  }
`

export const OutcomeCircle = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.colors.darkerGray};
  border-radius: 50%;
  color: #fff;
  display: flex;
  font-size: 15px;
  font-weight: 700;
  height: ${outcomeDimensions};
  justify-content: center;
  line-height: 1;
  position: relative;
  width: ${outcomeDimensions};
`

export const OutcomeHorizontalLine = styled.div`
  background-color: ${(props) => props.theme.colors.darkerGray};
  height: 2px;
  width: 12px;
`

interface Props {
  draggable?: boolean
  onClick?: () => void
  onDragStart?: (e: any) => void
  onDragEnd?: (e: any) => void
  outcome: string
}

export const Outcome: React.FC<Props> = (props) => {
  const { draggable, onClick, onDragEnd, onDragStart, outcome, ...restProps } = props

  return (
    <Wrapper
      draggable={draggable}
      onClick={onClick}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      {...restProps}
    >
      <OutcomeCircle className="outcomeCircle">{outcome}</OutcomeCircle>
      <OutcomeHorizontalLine className="outcomeHorizontalLine" />
    </Wrapper>
  )
}
