import moment from 'moment'
import React, { KeyboardEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { ArbitratorDropdown } from 'components/common/ArbitratorDropdown'
import { CategoriesDropdown } from 'components/common/CategoriesDropdown'
import { CenteredCard } from 'components/common/CenteredCard'
import { ConditionTypesDropdown } from 'components/common/ConditionTypesDropdown'
import { AddOutcome } from 'components/form/AddOutcome'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import {
  ADDRESS_REGEX,
  BYTES_REGEX,
  INTEGER_NUMBER,
  MAX_OUTCOMES,
  MIN_OUTCOMES,
} from 'config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { isAddress, truncateStringInTheMiddle } from 'util/tools'
import { Arbitrator, Categories, ConditionType, QuestionOptions } from 'util/types'

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'
const patternOutcomesError = 'Decimal numbers are not allowed'
const conditionAlreadyExist = 'Condition already exists'
const questionMustNotExist = 'Question must not exist'

const logger = getLogger('Prepare Condition')

export const PrepareCondition = () => {
  const {
    _type: status,
    CTService,
    RtioService,
    address,
    connect,
    networkConfig,
  } = useWeb3ConnectedOrInfura()

  const [numOutcomes, setNumOutcomes] = React.useState(0)
  const [oracleAddress, setOracleAddress] = React.useState('')
  const [questionId, setQuestionId] = React.useState('')
  const [questionTitle, setQuestionTitle] = React.useState('')
  const [resolutionDate, setResolutionDate] = React.useState('')
  const [prepareConditionStatus, setPrepareConditionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const [conditionId, setConditionId] = React.useState<Maybe<string>>(null)
  const [error, setError] = React.useState<Maybe<Error>>(null)
  const [conditionType, setConditionType] = React.useState<ConditionType>(ConditionType.custom)
  const [category, setCategory] = React.useState<string>(Categories.businessAndFinance)
  const [arbitrator, setArbitrator] = React.useState<Arbitrator>(
    networkConfig.getArbitratorFromName('realitio')
  )

  const [outcomes, setOutcomes] = React.useState<Array<string>>([])
  const [outcome, setOutcome] = React.useState<string>('')

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

  React.useEffect(() => {
    const checkConditionExist = async () => {
      try {
        let conditionExists = false
        let conditionIdToUpdate: Maybe<string> = null
        if (questionId && oracleAddress && numOutcomes) {
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleAddress,
            numOutcomes
          )
        }
        if (questionTitle && oracleAddress && outcomes.length > 0 && address) {
          const openingDateMoment = moment(resolutionDate)
          const questionOptions: QuestionOptions = {
            arbitratorAddress: arbitrator.address,
            category,
            openingDateMoment,
            outcomes,
            question: questionTitle,
            networkConfig,
            signerAddress: address,
          }
          const questionId = await RtioService.askQuestionConstant(questionOptions)
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleAddress,
            numOutcomes
          )
        }

        logger.log(`Condition ID: ${conditionIdToUpdate}`)
        if (conditionIdToUpdate) {
          conditionExists = await CTService.conditionExists(conditionIdToUpdate)
        }

        if (conditionExists) {
          throw new Error(conditionAlreadyExist)
        }

        setError(null)
      } catch (err) {
        if (err.message.includes(conditionAlreadyExist)) {
          setError(err)
        } else if (err.message.includes(questionMustNotExist.toLowerCase())) {
          setError(new Error(questionMustNotExist))
        } else {
          setError(err.message)
        }
      }
    }
    checkConditionExist()
  }, [
    questionId,
    oracleAddress,
    numOutcomes,
    outcomes,
    RtioService,
    address,
    category,
    networkConfig,
    CTService,
    questionTitle,
    resolutionDate,
    arbitrator.address,
  ])

  const prepareCondition = async () => {
    setPrepareConditionStatus(Remote.loading())

    try {
      if (status === Web3ContextStatus.Connected && address) {
        let conditionIdToUpdate: Maybe<string> = null
        if (conditionType === ConditionType.custom) {
          await CTService.prepareCondition(questionId, oracleAddress, numOutcomes)
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleAddress,
            numOutcomes
          )
        } else {
          const openingDateMoment = moment(resolutionDate)
          const questionOptions: QuestionOptions = {
            arbitratorAddress: arbitrator.address,
            category,
            openingDateMoment,
            outcomes,
            question: questionTitle,
            networkConfig,
            signerAddress: address,
          }

          const questionId = await RtioService.askQuestion(questionOptions)

          await CTService.prepareCondition(questionId, oracleAddress, outcomes.length)
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleAddress,
            outcomes.length
          )
        }
        logger.log(`Condition Id after prepareCondition: ${conditionIdToUpdate}`)
        setConditionId(conditionIdToUpdate)
        setPrepareConditionStatus(Remote.success(conditionIdToUpdate))
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setPrepareConditionStatus(Remote.failure(err))
    }
  }

  const onClickUseMyWallet = () => {
    if (status === Web3ContextStatus.Connected && address) {
      setValue('oracle', address, true)
      setOracleAddress(address)
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }

  const submitDisabled =
    !isValid || prepareConditionStatus.isLoading() || prepareConditionStatus.isFailure() || !!error

  const fullLoadingActionButton = prepareConditionStatus.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        onClick: () => {
          setPrepareConditionStatus(Remote.notAsked<Maybe<string>>())
          if (conditionId) history.push(`/conditions/${conditionId}`)
        },
        text: 'OK',
      }
    : prepareConditionStatus.isFailure()
    ? {
        buttonType: ButtonType.danger,
        text: 'Close',
        onClick: () => setPrepareConditionStatus(Remote.notAsked<Maybe<string>>()),
      }
    : undefined

  const fullLoadingIcon = prepareConditionStatus.isFailure()
    ? IconTypes.error
    : prepareConditionStatus.isSuccess()
    ? IconTypes.ok
    : IconTypes.spinner

  const fullLoadingMessage = prepareConditionStatus.isFailure() ? (
    prepareConditionStatus.getFailure()
  ) : prepareConditionStatus.isLoading() ? (
    'Working...'
  ) : (
    <>
      {conditionId && (
        <>
          All done! Condition{' '}
          <span title={conditionId}>{truncateStringInTheMiddle(conditionId, 8, 6)}</span> created .
        </>
      )}
    </>
  )
  const fullLoadingTitle = prepareConditionStatus.isFailure() ? 'Error' : 'Prepare Condition'

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
                      {errors.questionId.type === 'required' && (
                        <ErrorMessage>Required field</ErrorMessage>
                      )}
                      {errors.questionId.type === 'pattern' && (
                        <ErrorMessage>Invalid Question Id</ErrorMessage>
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
                  <Textfield
                    name="question"
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="Type in a question..."
                    ref={register({ required: true })}
                    type="text"
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
                    onKeyPress={(event: KeyboardEvent) => {
                      if (event.key === '.') {
                        event.preventDefault()
                      }
                    }}
                    placeholder="You can add between 2 and 256 outcomes..."
                    ref={register({
                      required: true,
                      min: MIN_OUTCOMES,
                      max: MAX_OUTCOMES,
                      pattern: INTEGER_NUMBER,
                    })}
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
                      {errors.outcomesSlotCount.type === 'pattern' && (
                        <ErrorMessage>{patternOutcomesError}</ErrorMessage>
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
                value={
                  <Textfield
                    name="resolutionDate"
                    onChange={(e) => setResolutionDate(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    ref={register({
                      required: true,
                    })}
                    type="date"
                  />
                }
              />
              <TitleValue
                title="Category"
                value={
                  <CategoriesDropdown
                    onClick={(value: string) => {
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
                    onClick={(value: Arbitrator) => {
                      setArbitrator(value)
                    }}
                    value={arbitrator}
                  />
                }
              />
            </>
          )}
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
                    {errors.oracle.type === 'required' && (
                      <ErrorMessage>Required field</ErrorMessage>
                    )}
                    {errors.oracle.type === 'pattern' && (
                      <ErrorMessage>Please use a valid reporting address</ErrorMessage>
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
        {(prepareConditionStatus.isLoading() ||
          prepareConditionStatus.isFailure() ||
          prepareConditionStatus.isSuccess()) && (
          <FullLoading
            actionButton={fullLoadingActionButton}
            icon={fullLoadingIcon}
            message={fullLoadingMessage}
            title={fullLoadingTitle}
            width={'400px'}
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
