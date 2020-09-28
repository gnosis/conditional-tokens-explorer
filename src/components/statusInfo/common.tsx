import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'

export const Title = styled.h1<{ textAlign?: string }>`
  color: ${(props) => props.theme.colors.darkBlue};
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  text-align: ${(props) => props.textAlign};
  text-transform: capitalize;
`

Title.defaultProps = {
  textAlign: 'left',
}

export const Text = styled.p<{ textAlign?: string }>`
  color: ${(props) => props.theme.colors.darkGrey};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  text-align: ${(props) => props.textAlign};
`

Text.defaultProps = {
  textAlign: 'center',
}

export const Icon = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 30px 0;
`

export const Card = styled(BaseCard)`
  box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.85);
  flex-direction: column;
  justify-content: space-between;
`

export enum IconTypes {
  alert = 1,
  error = 2,
  spinner = 3,
  ok = 4,
}
