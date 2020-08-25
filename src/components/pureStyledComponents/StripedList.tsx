import styled from 'styled-components'

export const StripedList = styled.div<{ maxHeight?: string }>`
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  height: ${(props) => props.maxHeight};
  overflow: auto;
`

StripedList.defaultProps = {
  maxHeight: '300px',
}

export const StripedListItem = styled.div<{ justifyContent?: string }>`
  align-items: center;
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  color: ${(props) => props.theme.colors.darkerGray};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  justify-content: ${(props) => props.justifyContent};
  line-height: 1;
  padding: 12px 20px;
  text-align: left;

  &:nth-child(even) {
    background-color: ${(props) => props.theme.colors.whitesmoke2};
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`

StripedListItem.defaultProps = {
  justifyContent: 'space-between',
}

export const StripedListEmpty = styled.div`
  align-items: center;
  color: ${(props) => props.theme.colors.textColor};
  display: flex;
  font-size: 15px;
  height: 100%;
  justify-content: center;
  line-height: 1.5;
  margin: 0;
  width: 100%;
`
