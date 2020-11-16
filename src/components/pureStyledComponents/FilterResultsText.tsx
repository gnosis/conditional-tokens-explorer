import styled, { css } from 'styled-components'

const CommonCSS = css`
  color: ${(props) => props.theme.colors.darkGrey};
  font-size: 12px;
  font-weight: 600;
`

export const FilterResultsText = styled.div`
  ${CommonCSS}
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
`

export const FilterResultsTextAlternativeLayout = styled(FilterResultsText)``

FilterResultsText.defaultProps = {
  className: 'filterResultsText',
}

FilterResultsTextAlternativeLayout.defaultProps = {
  className: 'filterResultsTextAlternativeLayout',
}

export const FilterResultsControl = styled.button`
  ${CommonCSS}
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  text-decoration: underline;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: underline;
  }
`
