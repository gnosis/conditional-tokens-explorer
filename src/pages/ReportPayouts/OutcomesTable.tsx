import React, { KeyboardEvent, useMemo } from 'react'
import styled from 'styled-components'

import { Textfield } from 'components/pureStyledComponents/Textfield'

const Wrapper = styled.form`
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  display: block;
  height: 220px;
  overflow: auto;
  width: 100%;
`

const Table = styled.table`
  border-collapse: initial;
  border-spacing: 0;
  border: none;
  min-width: 100%;
  position: relative;
`

const THead = styled.thead``

const TH = styled.th<{ textAlign?: string }>`
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  border-bottom: solid 1px ${(props) => props.theme.border.colorDark};
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${(props) => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 600;
  height: 37px;
  line-height: 1.2;
  padding: 0 23px;
  position: sticky;
  text-align: ${(props) => props.textAlign};
  text-transform: uppercase;
  top: 0;
  white-space: nowrap;
  z-index: 5;
`

TH.defaultProps = {
  textAlign: 'left',
}

const TR = styled.tr``

const TBody = styled.tbody``

const TD = styled.td<{ textAlign?: string }>`
  border-bottom: solid 1px ${(props) => props.theme.border.colorDark};
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${(props) => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: 400;
  height: 39px;
  line-height: 1.2;
  padding: 0 23px;
  text-align: ${(props) => props.textAlign};
`

const TextfieldProbability = styled(Textfield)`
  border-bottom: solid 1px ${(props) => props.theme.colors.textColor};
  border-left: none;
  border-radius: 0;
  border-right: none;
  border-top: none;
  color: ${(props) => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: 400;
  height: auto;
  margin-left: auto;
  padding: 0 0 2px 0;
  text-align: right;
  width: 70px;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border-bottom-color: ${(props) => props.theme.colors.primary};
  }
`

TH.defaultProps = {
  textAlign: 'left',
}

interface Props {
  conditionId: string
  payouts: number[]
  setPayout: (payout: number, index: number) => void
  outcomeSlotCount: number
}

interface Outcome {
  name: string
  probability: number
}

export const OutcomesTable = (props: Props) => {
  const { conditionId, outcomeSlotCount, payouts, setPayout } = props

  const outcomesWithProbabilities: Outcome[] = useMemo(() => {
    const outcomes: Outcome[] = []
    const total = payouts.reduce((previous: number, current: number) => previous + current, 0)
    for (let index = 0; index < outcomeSlotCount; index++) {
      const amount = payouts[index] || 0
      const probability = total > 0 ? (amount / total) * 100 : 0
      const outcome = {
        name: index + '',
        probability,
      } as Outcome
      outcomes.push(outcome)
    }
    return outcomes
  }, [outcomeSlotCount, payouts])

  return (
    <Wrapper>
      <Table>
        <THead>
          <TR>
            <TH>Outcome</TH>
            <TH textAlign="right">Probabilities</TH>
            <TH textAlign="right">Payout</TH>
          </TR>
        </THead>
        <TBody>
          {outcomesWithProbabilities.map((outcome, index) => {
            const { name, probability } = outcome
            return (
              <TR key={index}>
                <TD>{name}</TD>
                <TD textAlign="right">{probability.toFixed(2)}%</TD>
                <TD textAlign="right">
                  <TextfieldProbability
                    key={`${conditionId}_${outcome}_${index}`}
                    min={0}
                    name={`payouts[${index}]`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const { value } = event.currentTarget
                      setPayout(+value, index)
                    }}
                    onKeyPress={(event: KeyboardEvent) => {
                      const characterCode = event.key
                      if (characterCode === 'Backspace') return
                      const characterNumber = Number(characterCode)

                      if (
                        !((characterNumber >= 0 && characterNumber <= 9) || characterCode === '.')
                      ) {
                        event.preventDefault()
                      }
                    }}
                    type="number"
                  />
                </TD>
              </TR>
            )
          })}
        </TBody>
      </Table>
    </Wrapper>
  )
}
