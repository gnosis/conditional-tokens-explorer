import styled from 'styled-components'

export const Title = styled.h1<{ textAlign?: string }>`
  color: ${(props) => props.theme.colors.darkBlue};
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  margin: 0;
  text-align: ${(props) => props.textAlign};
`

Title.defaultProps = {
  textAlign: 'left',
}

export const Text = styled.p<{ textAlign?: string }>`
  color: ${(props) => props.theme.colors.darkGrey};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  text-align: ${(props) => props.textAlign};
`

Text.defaultProps = {
  textAlign: 'center',
}
