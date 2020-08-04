import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ maxHeight?: string }>`
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  max-height: ${(props) => props.maxHeight};
  overflow: auto;
`

export const StripedListItem = styled.div<{ justifyContent?: string }>`
  align-items: center;
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  color: ${(props) => props.theme.colors.darkerGray};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  justify-content: ${(props) => props.justifyContent};
  line-height: 1;
  padding: 14px 21px;
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

interface StripedList {
  maxHeight?: string
}

export const StripedList: React.FC<StripedList> = (props) => {
  const { children, maxHeight = '90px', ...restProps } = props

  return (
    <Wrapper maxHeight={maxHeight} {...restProps}>
      {children}
    </Wrapper>
  )
}
