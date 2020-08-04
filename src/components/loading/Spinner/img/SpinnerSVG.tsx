import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg``

export const SpinnerSVG: React.FC = (props) => {
  return (
    <Wrapper height="48" width="48" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" fill="#009cb4" r="24" />
      <path
        d="M24 41A17 17 0 107 23.721a1.7 1.7 0 003.4.054A13.6 13.6 0 1124 37.6a1.7 1.7 0 100 3.4z"
        fill="#fff"
      />
    </Wrapper>
  )
}
