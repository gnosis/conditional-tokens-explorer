import styled from 'styled-components'

export const ErrorContainer = styled.div`
  padding: 8px 0 0 0;
`

export const Error = styled.p`
  color: ${(props) => props.theme.colors.error};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 5px 0;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }
`
