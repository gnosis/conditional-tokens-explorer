import styled from 'styled-components'

export const TwoColumnsCollapsibleLayout = styled.div<{ isCollapsed?: boolean }>`
  column-gap: 20px;
  display: grid;
  grid-template-columns: ${(props) => (props.isCollapsed ? '1fr' : '232px 1fr')};
`
