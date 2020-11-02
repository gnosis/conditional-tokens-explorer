import styled, { css } from 'styled-components'

import { Dropdown } from 'components/common/Dropdown'

const dropdownCSS = css`
  .dropdownItems {
    width: 100%;
  }
`

export const FilterDropdown = styled(Dropdown)`
  ${dropdownCSS}
`
