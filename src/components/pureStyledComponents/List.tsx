import styled from 'styled-components'

export const List = styled.ul`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0 0 30px;
  text-align: left;

  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }

  strong {
    font-weight: 700;
  }
`
