import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  margin-top: 2px;

  path {
    fill: ${(props) => props.theme.colors.mediumGrey};
  }

  .isOpen & {
    path {
      fill: ${(props) => props.theme.colors.primary};
    }
  }
`

export const ChevronDown: React.FC = () => (
  <Wrapper height="7" viewBox="0 0 11.999 7" width="11.999" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.709 6.709a1.014 1.014 0 0 1-1.42 0l-.046-.05L.292 1.706A1 1 0 0 1 1.706.292L6 4.586 10.293.292a1 1 0 1 1 1.414 1.414L6.763 6.649z"
      fillRule="evenodd"
    />
  </Wrapper>
)
