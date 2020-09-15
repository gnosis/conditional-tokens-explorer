import styled from 'styled-components'

export const Title = styled.h2`
  color: ${(props) => props.theme.colors.darkerGray};
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 10px;
  text-align: left;
  text-transform: uppercase;

  a {
    color: ${(props) => props.theme.colors.darkerGray};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`
