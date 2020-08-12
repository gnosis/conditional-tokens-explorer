import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from '../../components/buttons/Button'
import { ButtonSelect } from '../../components/buttons/ButtonSelect'
import { CenteredCard } from '../../components/common/CenteredCard'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { ErrorContainer, Error as ErrorMessage } from '../../components/pureStyledComponents/Error'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Row } from '../../components/pureStyledComponents/Row'
import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { TitleValue } from '../../components/text/TitleValue'
import { ADDRESS_REGEX, BYTES_REGEX } from '../../config/constants'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { isAddress } from '../../util/tools'

const MIN_OUTCOMES = 2
const MAX_OUTCOMES = 256

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

export const PrepareCondition = () => {
  const [numOutcomes, setNumOutcomes] = useState(0)
  const [oracleAddress, setOracleAddress] = useState('')
  const [questionId, setQuestionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Maybe<Error>>(null)

  const { CTService, address, provider } = useWeb3Connected()
  const {
    errors,
    formState: { isValid },
    register,
    setValue,
  } = useForm<{ outcomesSlotCount: number; oracle: string; questionId: string }>({
    mode: 'onChange',
  })

  const history = useHistory()

  const conditionId = isValid
    ? ConditionalTokensService.getConditionId(questionId, oracleAddress, numOutcomes)
    : null

  const prepareCondition = async () => {
    if (!conditionId) return
    setError(null)
    setIsLoading(true)
    try {
      const conditionExists = await CTService.conditionExists(conditionId)
      if (!conditionExists) {
        const tx = await CTService.prepareCondition(questionId, oracleAddress, numOutcomes)
        await provider.waitForTransaction(tx)

        history.push(`/conditions/${conditionId}`)
      } else {
        setError(new Error('Condition already exists'))
      }
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [questionId, oracleAddress, numOutcomes])

  const submitDisabled = !isValid || isLoading

  enum ConditionType {
    custom,
    omen,
  }
  const dropdownItems = [
    {
      text: 'Custom Reporter',
      onClick: () => {
        setConditionType(ConditionType.custom)
      },
      type: ConditionType.custom,
    },
    {
      text: 'Omen Condition',
      onClick: () => {
        setConditionType(ConditionType.omen)
      },
      type: ConditionType.omen,
    },
  ]
  const [conditionType, setConditionType] = useState(dropdownItems[0].type)

  return (
    <>
      <PageTitle>Prepare Condition</PageTitle>
      <CenteredCard>
        <Row cols="1fr">
          <TitleValue
            title="Condition Type"
            value={
              <Dropdown
                dropdownButtonContent={
                  <ButtonSelect
                    content={dropdownItems.filter((item) => item.type === conditionType)[0].text}
                  />
                }
                dropdownPosition={DropdownPosition.center}
                fullWidth
                items={dropdownItems.map((item, index) => (
                  <DropdownItem key={index} onClick={item.onClick}>
                    {item.text}
                  </DropdownItem>
                ))}
              />
            }
          />
        </Row>
        <Row cols="1fr">
          <TitleValue
            title="Question Id"
            value={
              <>
                <Textfield
                  error={errors.questionId && true}
                  name="questionId"
                  onChange={(e) => setQuestionId(e.target.value)}
                  placeholder="Type in a question Id..."
                  ref={register({ required: true, pattern: BYTES_REGEX })}
                  type="text"
                />
                {errors.questionId && (
                  <ErrorContainer>
                    {errors.questionId.type === 'pattern' && (
                      <ErrorMessage>Invalid bytes32 string</ErrorMessage>
                    )}
                  </ErrorContainer>
                )}
              </>
            }
          />
        </Row>
        <Row cols="1fr">
          <TitleValue
            title="Outcomes"
            value={
              <>
                <Textfield
                  error={errors.outcomesSlotCount && true}
                  name="outcomesSlotCount"
                  onChange={(e) => setNumOutcomes(Number(e.target.value))}
                  placeholder="You can add between 2 and 256 outcomes..."
                  ref={register({ required: true, min: MIN_OUTCOMES, max: MAX_OUTCOMES })}
                  type="number"
                />
                {errors.outcomesSlotCount && (
                  <ErrorContainer>
                    {errors.outcomesSlotCount.type === 'max' && (
                      <ErrorMessage>{maxOutcomesError}</ErrorMessage>
                    )}
                    {errors.outcomesSlotCount.type === 'min' && (
                      <ErrorMessage>{minOutcomesError}</ErrorMessage>
                    )}
                    {errors.outcomesSlotCount.type === 'required' && (
                      <ErrorMessage>Required field</ErrorMessage>
                    )}
                  </ErrorContainer>
                )}
              </>
            }
          />
        </Row>
        <Row cols="1fr">
          <TitleValue
            title="Reporting Address"
            titleControl={
              <TitleControl
                onClick={() => {
                  setValue('oracle', address, true)
                  setOracleAddress(address)
                }}
              >
                Use MyWallet
              </TitleControl>
            }
            value={
              <>
                <Textfield
                  error={errors.oracle && true}
                  name="oracle"
                  onChange={(e) => setOracleAddress(e.target.value)}
                  placeholder="Type in a valid reporting address..."
                  ref={register({
                    required: true,
                    pattern: ADDRESS_REGEX,
                    validate: (value: string) => isAddress(value),
                  })}
                  type="text"
                />
                {errors.oracle && (
                  <ErrorContainer>
                    {errors.oracle.type === 'pattern' && (
                      <ErrorMessage>Invalid address</ErrorMessage>
                    )}
                    {errors.oracle.type === 'validate' && (
                      <ErrorMessage>Address checksum failed</ErrorMessage>
                    )}
                  </ErrorContainer>
                )}
              </>
            }
          />
        </Row>
        <ButtonContainer>
          <Button disabled={submitDisabled} onClick={prepareCondition}>
            Prepare
          </Button>
          <ErrorContainer>
            <ErrorMessage>{error && error.message}</ErrorMessage>
          </ErrorContainer>
        </ButtonContainer>
      </CenteredCard>
    </>
  )
}
