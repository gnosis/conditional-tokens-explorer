import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'

export const Sidebar = styled(BaseCard)<{ isVisible?: boolean }>`
  ${(props) => (props.isVisible ? 'display: flex;' : 'display: none;')}
`

Sidebar.defaultProps = {
  isVisible: true,
}
