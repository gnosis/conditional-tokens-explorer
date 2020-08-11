import styled from 'styled-components'

export const ListItem = styled.div<{ justifyContent?: string }>`
  align-items: center;
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  color: ${(props) => props.theme.colors.darkerGray};
  display: flex;
  justify-content: ${(props) => props.justifyContent};
  padding: 8px 12px;

  &:nth-child(even) {
    background-color: #fff};
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`
