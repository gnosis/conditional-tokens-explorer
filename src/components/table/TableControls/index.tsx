import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: block;
  margin-bottom: 24px;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`

const Start = styled.div`
  margin-bottom: 10px;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
    margin-right: auto;
  }
`

const End = styled.div`
  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    margin-left: auto;
  }
`

interface Props {
  end?: React.ReactNode
  start?: React.ReactNode
}

export const TableControls: React.FC<Props> = (props) => {
  const { end, start, ...restProps } = props
  return end || start ? (
    <Wrapper {...restProps}>
      {start && <Start>{start}</Start>}
      {end && <End>{end}</End>}
    </Wrapper>
  ) : null
}
