import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { Controller, FormContextValues } from 'react-hook-form'
import styled from 'styled-components'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { TableWrapper } from 'components/pureStyledComponents/TableWrapper'
import { ZERO_BN } from 'config/constants'
import { useQuestion } from 'hooks/useQuestion'
import { FormInputs } from 'pages/ReportPayouts/Contents'
import { GetCondition_condition } from 'types/generatedGQL'
import { divBN } from 'util/tools'

const Wrapper = styled.form``

const Table = styled.table`
  border-collapse: initial;
  border-radius: 4px;
  border-spacing: 0;
  border: solid 1px ${(props) => props.theme.border.colorDark};
  min-width: 100%;
`

const THead = styled.thead``

const TH = styled.th<{ textAlign?: string }>`
  background-color: ${(props) => props.theme.colors.whitesmoke3};
  border: none;
  color: ${(props) => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 600;
  height: 37px;
  line-height: 1.2;
  padding: 0 23px;
  text-align: ${(props) => props.textAlign};
  text-transform: uppercase;
  white-space: nowrap;
`

TH.defaultProps = {
  textAlign: 'left',
}

const TR = styled.tr``

const TBody = styled.tbody``

const TD = styled.td<{ textAlign?: string }>`
  border-bottom: none;
  border-left: none;
  border-right: none;
  border-top: solid 1px ${(props) => props.theme.border.colorDark};
  color: ${(props) => props.theme.colors.textColor};
  font-size: 15px;
  font-weight: 400;
  height: 39px;
  line-height: 1.2;
  padding: 0 23px;
  text-align: ${(props) => props.textAlign};
`

const Textfield = styled(BigNumberInputWrapper)`
  margin-left: auto;

  input {
    border-bottom: solid 1px ${(props) => props.theme.colors.textColor};
    border-left: none;
    border-radius: 0;
    border-right: none;
    border-top: none;
    color: ${(props) => props.theme.colors.textColor};
    font-size: 15px;
    font-weight: 400;
    height: auto;
    padding: 0 0 2px 0;
    text-align: right;
    width: 70px;

    &:focus {
      border-bottom-color: ${(props) => props.theme.colors.primary};
    }
  }
`

TH.defaultProps = {
  textAlign: 'left',
}

interface Props {
  condition: GetCondition_condition
  formMethods: FormContextValues<FormInputs>
  decimals: number
}

interface Outcome {
  name: string
  probability: number
}

export const OutcomesTable = ({ condition, decimals, formMethods }: Props) => {
  const { outcomeSlotCount, questionId } = condition
  const { outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])

  const { control, getValues } = formMethods

  useEffect(() => {
    let cancelled = false
    if (outcomes.length === 0) {
      const outcomes: Outcome[] = outcomesPrettier.map((outcome) => {
        return {
          name: outcome,
          probability: 0,
        }
      })
      if (!cancelled) setOutcomes(outcomes)
    }
    return () => {
      cancelled = true
    }
  }, [outcomesPrettier, outcomes.length])

  const onChange = (value: BigNumber, index: number) => {
    const values = Object.values(getValues())

    // Calculate total payouts entered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = values.reduce((previousValue: any, currentValue: any, currentIndex: number) => {
      const payout = currentIndex === index ? value : currentValue
      return previousValue.add(payout)
    }, new BigNumber(0))

    // Calculate probabilities against the total calculated previously
    const outcomesValues: Outcome[] = (outcomes as Outcome[]).map((outcome, currentIndex) => {
      const amount = currentIndex === index ? value : (values[currentIndex] as BigNumber)
      const probability = (total as BigNumber).isZero()
        ? 0
        : divBN(amount, total as BigNumber) * 100
      return {
        ...outcome,
        probability,
      } as Outcome
    })
    // Update the outcomes with the new probabilities
    setOutcomes(outcomesValues)
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Table>
          <THead>
            <TR>
              <TH>Outcome</TH>
              <TH textAlign="right">Probabilities</TH>
              <TH textAlign="right">Payout</TH>
            </TR>
          </THead>
          <TBody>
            {outcomes.map((outcome, index) => {
              const { name, probability } = outcome
              return (
                <TR key={index}>
                  <TD>{name}</TD>
                  <TD textAlign="right">{probability.toFixed(2)}%</TD>
                  <TD textAlign="right">
                    <Controller
                      as={Textfield}
                      control={control}
                      decimals={decimals}
                      defaultValue={new BigNumber(0)}
                      name={`payouts[${index}]`}
                      onChange={(value) => {
                        onChange(value[0], index)
                        return value[0]
                      }}
                      rules={{ required: true, validate: (amount) => amount.gte(ZERO_BN) }}
                    />
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      </TableWrapper>
    </Wrapper>
  )
}
