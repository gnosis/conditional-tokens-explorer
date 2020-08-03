import styled from 'styled-components'

import { BaseCard } from './BaseCard'

export const FormCard = styled(BaseCard)`
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  width: ${(props) => props.theme.layout.commonContainerMaxWidth};
`
