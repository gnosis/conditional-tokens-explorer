import React from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from '../../components/buttons/Button'
import { ArbitratorDropdown } from '../../components/common/ArbitratorDropdown'
import { CategoriesDropdown } from '../../components/common/CategoriesDropdown'
import { CenteredCard } from '../../components/common/CenteredCard'
import { ConditionTypesDropdown } from '../../components/common/ConditionTypesDropdown'
import { QuestionTypesDropdown } from '../../components/common/QuestionTypesDropdown'
import { AddOutcome } from '../../components/form/AddOutcome'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { ErrorContainer, Error as ErrorMessage } from '../../components/pureStyledComponents/Error'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Row } from '../../components/pureStyledComponents/Row'
import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { FullLoading } from '../../components/statusInfo/FullLoading'
import { IconTypes } from '../../components/statusInfo/common'
import { TitleValue } from '../../components/text/TitleValue'
import {
  ADDRESS_REGEX,
  BYTES_REGEX,
  CONFIRMATIONS_TO_WAIT,
  MAX_OUTCOMES,
  MIN_OUTCOMES,
} from '../../config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { getLogger } from '../../util/logger'
import { isAddress } from '../../util/tools'
import { Categories, ConditionType, QuestionType } from '../../util/types'

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

const logger = getLogger('Prepare Condition')

export const PrepareCondition = () => {
  const { _type: status, CTService, address, connect, provider } = useWeb3ConnectedOrInfura()

  const [numOutcomes, setNumOutcomes] = React.useState(0)
  const [oracleAddress, setOracleAddress] = React.useState('')
  const [questionId, setQuestionId] = React.useState('')
  const [isTransactionExecuting, setIsTransactionExecuting] = React.useState(false)
  const [error, setError] = React.useState<Maybe<Error>>(null)
  const [conditionType, setConditionType] = React.useState<ConditionType>(ConditionType.custom)
  const [questionType, setQuestionType] = React.useState<QuestionType>(QuestionType.binary)
  const [category, setCategory] = React.useState(Categories.businessAndFinance)
  const [arbitrator, setArbitrator] = React.useState('realitio')

  const [outcomes, setOutcomes] = React.useState<Array<string | undefined>>([])
  const [outcome, setOutcome] = React.useState<string | undefined>()

  const history = useHistory()

  const addOutcome = React.useCallback(() => {
    setOutcome('')
    setOutcomes([...outcomes, outcome])
  }, [outcome, outcomes, setOutcomes])

  const removeOutcome = React.useCallback(
    (index: number) => {
      outcomes.splice(index, 1)
      setOutcomes([...outcomes])
    },
    [outcomes]
  )

  const onOutcomeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setOutcome(e.currentTarget.value)

  const {
    errors,
    formState: { isValid },
    register,
    setValue,
  } = useForm<{ outcomesSlotCount: number; oracle: string; questionId: string }>({
    mode: 'onChange',
  })

  const conditionId = isValid
    ? ConditionalTokensService.getConditionId(questionId, oracleAddress, numOutcomes)
    : null

  const prepareCondition = async () => {
    if (!conditionId) return

    setError(null)
    setIsTransactionExecuting(true)

    try {
      if (status === Web3ContextStatus.Connected) {
        const conditionExists = await CTService.conditionExists(conditionId)
        logger.log(`Condition ID ${conditionId}`)
        if (!conditionExists) {
          const tx = await CTService.prepareCondition(questionId, oracleAddress, numOutcomes)
          await provider.waitForTransaction(tx, CONFIRMATIONS_TO_WAIT)

          history.push(`/conditions/${conditionId}`)
        } else {
          setError(new Error('Condition already exists'))
        }
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (e) {
      setError(e)
    } finally {
      setIsTransactionExecuting(false)
    }
  }

  React.useEffect(() => {
    setError(null)
  }, [questionId, oracleAddress, numOutcomes])

  const onClickUseMyWallet = () => {
    if (status === Web3ContextStatus.Connected && address) {
      setValue('oracle', address, true)
      setOracleAddress(address)
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }

  const submitDisabled = !isValid || isTransactionExecuting

  return (
    <>
      <PageTitle>Prepare Condition</PageTitle>
      <CenteredCard>
        <Row cols="1fr">
          <TitleValue
            title="Condition Type"
            value={
              <ConditionTypesDropdown
                onClick={(value: ConditionType) => {
                  setConditionType(value)
                }}
                value={conditionType}
              />
            }
          />
          {conditionType === ConditionType.custom && (
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
          )}
          {conditionType === ConditionType.omen && (
            <>
              <TitleValue
                title="Question"
                value={
                  <Textfield name="question" placeholder="Type in a question..." type="text" />
                }
              />
              <TitleValue
                title="Question Type"
                value={
                  <QuestionTypesDropdown
                    onClick={(value: QuestionType) => {
                      setQuestionType(value)
                    }}
                    value={questionType}
                  />
                }
              />
              <AddOutcome
                addOutcome={addOutcome}
                onChange={onOutcomeChange}
                outcome={outcome}
                outcomes={outcomes}
                removeOutcome={removeOutcome}
              />
            </>
          )}
          {conditionType === ConditionType.custom && (
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
          )}
        </Row>
        <Row cols="1fr">
          {conditionType === ConditionType.omen && (
            <>
              <TitleValue
                title="Resolution Date"
                value={<Textfield name="resolutionDate" placeholder="MM/DD/YYY" type="date" />}
              />
              <TitleValue
                title="Category"
                value={
                  <CategoriesDropdown
                    onClick={(value: Categories) => {
                      setCategory(value)
                    }}
                    value={category}
                  />
                }
              />
              <TitleValue
                title="Arbitrator"
                value={
                  <ArbitratorDropdown
                    onClick={(value: string) => {
                      setArbitrator(value)
                    }}
                    value={arbitrator}
                  />
                }
              />
            </>
          )}
          {conditionType === ConditionType.custom && (
            <TitleValue
              title="Reporting Address"
              titleControl={<TitleControl onClick={onClickUseMyWallet}>Use My Wallet</TitleControl>}
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
          )}
        </Row>
        {isTransactionExecuting && (
          <FullLoading
            actionButton={
              error ? { text: 'OK', onClick: () => setIsTransactionExecuting(true) } : undefined
            }
            icon={error ? IconTypes.error : IconTypes.spinner}
            message={error ? error.message : 'Waiting...'}
            title={error ? 'Error' : 'Prepare Condition'}
          />
        )}
        {error && (
          <ErrorContainer>
            <ErrorMessage>{error.message}</ErrorMessage>
          </ErrorContainer>
        )}
        <ButtonContainer>
          <Button disabled={submitDisabled} onClick={prepareCondition}>
            Prepare
          </Button>
        </ButtonContainer>
      </CenteredCard>
    </>
  )
}
