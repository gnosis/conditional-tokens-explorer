import styled from 'styled-components'

export const FilterWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: 0 0 8px;
`

export const FilterTitle = styled.h3`
  color: ${(props) => props.theme.colors.darkerGrey};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  text-align: left;
  text-transform: uppercase;
`

export const FilterTitleButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => props.theme.colors.darkerGrey};
  cursor: pointer;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  outline: none;
  padding: 0;
  position: relative;
  text-align: right;
  text-decoration: underline;
  top: -3px;

  &:hover {
    text-decoration: none;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
    text-decoration: underline;
  }
`
