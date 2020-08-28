import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
`

const Start = styled.div`
  margin-right: auto;
`

const End = styled.div`
  margin-left: auto;
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
