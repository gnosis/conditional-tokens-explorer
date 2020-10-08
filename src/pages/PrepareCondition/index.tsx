import moment from 'moment'
import React, { KeyboardEvent, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { AddOutcome } from 'components/form/AddOutcome'
import { ArbitratorDropdown } from 'components/form/ArbitratorDropdown'
import { CategoriesDropdown } from 'components/form/CategoriesDropdown'
import { ConditionTypesDropdown } from 'components/form/ConditionTypesDropdown'
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

const conditionAlreadyExist = 'Condition already exists'
const questionMustNotExist = 'Question must not exist'

const logger = getLogger('Prepare Condition')

interface CustomConditionType {
  questionId: string
  outcomesSlotCount: Maybe<number>
  oracle: string
}

interface OmenConditionType {
  questionTitle: string
  resolutionDate: Maybe<string>
  category: string
  arbitrator: Arbitrator
  oracle: string
}

export const PrepareCondition = () => {
  const {
    _type: status,
    CTService,
    RtioService,
    address,
    connect,
    networkConfig,
  } = useWeb3ConnectedOrInfura()

  const history = useHistory()

  const [prepareConditionStatus, setPrepareConditionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const defaultValuesCustom = {
    questionId: '',
    outcomesSlotCount: null,
    oracle: '',
  }

  const defaultValuesOmen = {
    questionTitle: '',
    resolutionDate: null,
    category: Categories.businessAndFinance,
    arbitrator: networkConfig.getArbitratorFromName('realitio'),
    oracle: networkConfig.getOracleFromName('realitio' as KnownOracle).address,
  }

  const {
    errors: errorsCustomCondition,
    formState: formStateCustomCondition,
    getValues: getValuesCustomCondition,
    register: registerCustomCondition,
    setValue: setValueCustomCondition,
    watch: watchCustomCondition,
  } = useForm<CustomConditionType>({
    mode: 'onChange',
    defaultValues: defaultValuesCustom,
  })
  const { isValid: isValidCustomCondition } = formStateCustomCondition

  const {
    control: omenControl,
    errors: errorsOmenCondition,
    formState: formStateOmenCondition,
    getValues: getValuesOmenCondition,
    register: registerOmenCondition,
    setValue: setValueOmenCondition,
    watch: watchOmenCondition,
  } = useForm<OmenConditionType>({
    mode: 'onChange',
    defaultValues: defaultValuesOmen,
  })
  const { isValid: isValidOmenCondition } = formStateOmenCondition

  const category = watchOmenCondition('category')
  const arbitrator = watchOmenCondition('arbitrator')
  const oracleOmenCondition = watchOmenCondition('oracle')
  const questionId = watchCustomCondition('questionId')
  const outcomesSlotCount = watchCustomCondition('outcomesSlotCount')
  const oracleCustomCondition = watchCustomCondition('oracle')

  const [conditionId, setConditionId] = React.useState<Maybe<string>>(null)
  const [error, setError] = React.useState<Maybe<Error>>(null)
  const [conditionType, setConditionType] = React.useState<ConditionType>(ConditionType.custom)
  const [outcomes, setOutcomes] = React.useState<Array<string>>([])
  const [outcome, setOutcome] = React.useState<string>('')

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

  React.useEffect(() => {
    const checkConditionExist = async () => {
      try {
        let conditionExists = false
        let conditionIdToUpdate: Maybe<string> = null
        const { oracle: oracleCustom, outcomesSlotCount, questionId } = getValuesCustomCondition()

        if (questionId && oracleCustom && outcomesSlotCount) {
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleCustom,
            outcomesSlotCount
          )
        }

        const {
          arbitrator,
          oracle: oracleOmen,
          questionTitle,
          resolutionDate,
        } = getValuesOmenCondition()
        if (questionTitle && oracleOmen && outcomes.length > 0 && resolutionDate && address) {
          const openingDateMoment = moment(resolutionDate + '')
          const questionOptions: QuestionOptions = {
            arbitratorAddress: (arbitrator as Arbitrator).address,
            category,
            openingDateMoment,
            outcomes,
            question: questionTitle + '',
            networkConfig,
            signerAddress: address,
          }
          const questionId = await RtioService.askQuestionConstant(questionOptions)
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleOmen + '',
            outcomes.length
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
    outcomes,
    RtioService,
    address,
    networkConfig,
    CTService,
    category,
    questionId,
    outcomesSlotCount,
    oracleCustomCondition,
    getValuesCustomCondition,
    getValuesOmenCondition,
  ])

  const prepareCondition = async () => {
    if (conditionType === ConditionType.omen && outcomes.length < 2 ) {
      setError(new Error(`Outcomes must be greater than 1`))
      return
    }

    setPrepareConditionStatus(Remote.loading())

    try {
      if (status === Web3ContextStatus.Connected && address) {
        let conditionIdToUpdate: Maybe<string> = null
        if (conditionType === ConditionType.custom) {
          const { oracle: oracleCustom, outcomesSlotCount, questionId } = getValuesCustomCondition()
          if (outcomesSlotCount) {
            await CTService.prepareCondition(questionId, oracleCustom, outcomesSlotCount)
            conditionIdToUpdate = ConditionalTokensService.getConditionId(
              questionId,
              oracleCustom,
              outcomesSlotCount
            )
          }
        } else {
          const {
            arbitrator,
            oracle: oracleOmen,
            questionTitle,
            resolutionDate,
          } = getValuesOmenCondition()

          if (resolutionDate && questionTitle && oracleOmen) {
            const openingDateMoment = moment(resolutionDate + '')
            const questionOptions: QuestionOptions = {
              arbitratorAddress: (arbitrator as Arbitrator).address,
              category,
              openingDateMoment,
              outcomes,
              question: questionTitle + '',
              networkConfig,
              signerAddress: address,
            }

            const questionId = await RtioService.askQuestion(questionOptions)

            await CTService.prepareCondition(questionId, oracleOmen + '', outcomes.length)
            conditionIdToUpdate = ConditionalTokensService.getConditionId(
              questionId,
              oracleOmen + '',
              outcomes.length
            )
          }
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
      setValueCustomCondition('oracle', address, true)
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }

  const submitDisabled =
    conditionType === ConditionType.custom
      ? !isValidCustomCondition ||
        prepareConditionStatus.isLoading() ||
        prepareConditionStatus.isFailure() ||
        !!error
      : !isValidOmenCondition ||
        prepareConditionStatus.isLoading() ||
        prepareConditionStatus.isFailure() ||
        !!error

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
                    error={errorsCustomCondition.questionId && true}
                    name="questionId"
                    onChange={(e) => setValueCustomCondition('questionId', e.target.value, true)}
                    placeholder="Type in a question Id..."
                    ref={registerCustomCondition({ required: true, pattern: BYTES_REGEX })}
                    type="text"
                  />
                  {errorsCustomCondition.questionId && (
                    <ErrorContainer>
                      {errorsCustomCondition.questionId.type === 'required' && (
                        <ErrorMessage>Required field</ErrorMessage>
                      )}
                      {errorsCustomCondition.questionId.type === 'pattern' && (
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
                  <>
                    <Textfield
                      error={errorsOmenCondition.questionTitle && true}
                      name="questionTitle"
                      onChange={(e) => setValueOmenCondition('questionTitle', e.target.value, true)}
                      placeholder="Type in a question..."
                      ref={registerOmenCondition({ required: true })}
                      type="text"
                    />
                    {errorsOmenCondition.questionTitle && (
                      <ErrorContainer>
                        {errorsOmenCondition.questionTitle.type === 'required' && (
                          <ErrorMessage>Required field</ErrorMessage>
                        )}
                      </ErrorContainer>
                    )}
                  </>
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
                    error={errorsCustomCondition.outcomesSlotCount && true}
                    name="outcomesSlotCount"
                    onChange={(e) =>
                      setValueCustomCondition('outcomesSlotCount', Number(e.target.value), true)
                    }
                    onKeyPress={(event: KeyboardEvent) => {
                      if (event.key === '.') {
                        event.preventDefault()
                      }
                    }}
                    placeholder="You can add between 2 and 256 outcomes..."
                    ref={registerCustomCondition({
                      required: true,
                      min: MIN_OUTCOMES,
                      max: MAX_OUTCOMES,
                      pattern: INTEGER_NUMBER,
                    })}
                    type="number"
                  />
                  {errorsCustomCondition.outcomesSlotCount && (
                    <ErrorContainer>
                      {errorsCustomCondition.outcomesSlotCount.type === 'max' && (
                        <ErrorMessage>Too many outcome slots</ErrorMessage>
                      )}
                      {errorsCustomCondition.outcomesSlotCount.type === 'min' && (
                        <ErrorMessage>There should be more than one outcome slot</ErrorMessage>
                      )}
                      {errorsCustomCondition.outcomesSlotCount.type === 'required' && (
                        <ErrorMessage>Required field</ErrorMessage>
                      )}
                      {errorsCustomCondition.outcomesSlotCount.type === 'pattern' && (
                        <ErrorMessage>Decimal numbers are not allowed</ErrorMessage>
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
                  <>
                    <Textfield
                      error={errorsOmenCondition.resolutionDate && true}
                      name="resolutionDate"
                      onChange={(e) =>
                        setValueOmenCondition('resolutionDate', e.target.value, true)
                      }
                      placeholder="MM/DD/YYYY"
                      ref={registerOmenCondition({
                        required: true,
                      })}
                      type="date"
                    />
                    {errorsOmenCondition.resolutionDate && (
                      <ErrorContainer>
                        {errorsOmenCondition.resolutionDate.type === 'required' && (
                          <ErrorMessage>Required field</ErrorMessage>
                        )}
                      </ErrorContainer>
                    )}
                  </>
                }
              />
              <TitleValue
                title="Category"
                value={
                  <Controller
                    as={CategoriesDropdown}
                    control={omenControl}
                    name="category"
                    onClick={(value: string) => setValueOmenCondition('category', value, true)}
                    rules={{ required: true }}
                    value={category}
                  />
                }
              />
              <TitleValue
                title="Arbitrator"
                value={
                  <>
                    <Controller
                      as={ArbitratorDropdown}
                      control={omenControl}
                      name="arbitrator"
                      onClick={(value: Arbitrator) =>
                        setValueOmenCondition('arbitrator', value, true)
                      }
                      rules={{ required: true }}
                      value={arbitrator}
                    />
                  </>
                }
              />
              <TitleValue
                title="Reporting Address"
                value={
                  <>
                    <Textfield
                      error={errorsOmenCondition.oracle && true}
                      name="oracle"
                      onChange={(e) => setValueOmenCondition('oracle', e.target.value, true)}
                      placeholder="Type in a valid reporting address..."
                      ref={registerOmenCondition({
                        required: true,
                        pattern: ADDRESS_REGEX,
                        validate: (value: string) => isAddress(value),
                      })}
                      type="text"
                      value={oracleOmenCondition}
                      {...(conditionType === ConditionType.omen && { readOnly: true })}
                    />
                    {errorsOmenCondition.oracle && (
                      <ErrorContainer>
                        {errorsOmenCondition.oracle.type === 'required' && (
                          <ErrorMessage>Required field</ErrorMessage>
                        )}
                        {errorsOmenCondition.oracle.type === 'pattern' && (
                          <ErrorMessage>Please use a valid reporting address</ErrorMessage>
                        )}
                        {errorsOmenCondition.oracle.type === 'validate' && (
                          <ErrorMessage>Address checksum failed</ErrorMessage>
                        )}
                      </ErrorContainer>
                    )}
                  </>
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
                    error={errorsCustomCondition.oracle && true}
                    name="oracle"
                    onChange={(e) => setValueCustomCondition('oracle', e.target.value, true)}
                    placeholder="Type in a valid reporting address..."
                    ref={registerCustomCondition({
                      required: true,
                      pattern: ADDRESS_REGEX,
                      validate: (value: string) => isAddress(value),
                    })}
                    type="text"
                  />
                  {errorsCustomCondition.oracle && (
                    <ErrorContainer>
                      {errorsCustomCondition.oracle.type === 'required' && (
                        <ErrorMessage>Required field</ErrorMessage>
                      )}
                      {errorsCustomCondition.oracle.type === 'pattern' && (
                        <ErrorMessage>Please use a valid reporting address</ErrorMessage>
                      )}
                      {errorsCustomCondition.oracle.type === 'validate' && (
                        <ErrorMessage>Address checksum failed</ErrorMessage>
                      )}
                    </ErrorContainer>
                  )}
                </>
              }
            />
          )}
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
