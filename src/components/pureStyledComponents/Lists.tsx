import styled, { css } from 'styled-components'

const commonCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0 0 30px;
  padding: 0;
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

export const UnorderedList = styled.ul`
  ${commonCSS}
`

export const OrderedList = styled.ol`
  ${commonCSS}

  li {
    ul,
    ol {
      margin-bottom: 0;
    }

    li {
      list-style: lower-latin;

      li {
        list-style: lower-roman;
      }
    }
  }
`

export const Li = styled.li`
  margin: 0 0 5px 20px;
`
