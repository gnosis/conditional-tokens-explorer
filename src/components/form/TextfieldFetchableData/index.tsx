import React from 'react'
import styled from 'styled-components'

import { Textfield, TextfieldProps } from 'components/pureStyledComponents/Textfield'
import { Spinner } from 'components/statusInfo/Spinner'

const Wrapper = styled.div`
  position: relative;
`

const TextfieldStyled = styled(Textfield)<{ isFetching: boolean }>`
  position: relative;
  z-index: 1;

  ${(props) => props.isFetching && 'padding-right: 100px;'}
`

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  right: ${(props) => props.theme.textField.paddingHorizontal};
  top: 0;
  z-index: 5;
`

const Text = styled.span`
  color: ${(props) => props.theme.colors.textColor};
  flex-shrink: 0;
  font-size: 11px;
  font-style: italic;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 5px 0 0;
  text-align: right;
`

interface Props extends TextfieldProps {
  isFetching: boolean
}

export const TextfieldFetchableData: React.FC<Props> = (props) => {
  const { className, isFetching, ...restProps } = props
  return (
    <Wrapper className={className}>
      <TextfieldStyled isFetching={isFetching} {...restProps} />
      {isFetching && (
        <SpinnerWrapper>
          <Text>Fetching…</Text>
          <Spinner size="36px" />
        </SpinnerWrapper>
      )}
    </Wrapper>
  )
}
