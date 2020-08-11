import styled from 'styled-components'

export const Wrapper = styled.div`
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  min-height: 180px;
  max-height: 402px;
  overflow: auto;
`
