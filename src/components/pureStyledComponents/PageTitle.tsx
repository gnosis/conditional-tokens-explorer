import styled from 'styled-components'

export const PageTitle = styled.h2<{ cardWidth?: boolean }>`
  color: ${(props) => props.theme.colors.darkBlue};
  font-size: 28px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 20px;
  text-align: left;
`

PageTitle.defaultProps = {
  cardWidth: false,
}
