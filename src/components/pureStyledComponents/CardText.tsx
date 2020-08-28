import styled from 'styled-components'

export const CardText = styled.div`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 16px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 10px;
  text-align: left;
`

export const CardTextSm = styled(CardText)`
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
`
