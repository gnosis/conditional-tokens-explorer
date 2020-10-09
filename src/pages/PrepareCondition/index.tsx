import moment from 'moment'
import React, { KeyboardEvent, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

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
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'
import { IconTypes } from 'components/statusInfo/common'
import { Hash } from 'components/text/Hash'
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
import { isAddress } from 'util/tools'
import { Arbitrator, Categories, ConditionType, QuestionOptions } from 'util/types'

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

const Link = styled.a`
  color: ${(props) => props.theme.colors.warning};
`

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

  const [checkForExistingCondition, setCheckForExistingCondition] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const defaultValuesCustom = {
    questionId: '',
    outcomesSlotCount: null,
    oracle: '',
  }

  const oracle = networkConfig.getOracleFromName('realitio' as KnownOracle)

  const defaultValuesOmen = {
    questionTitle: '',
    resolutionDate: null,
    category: Categories.businessAndFinance,
    arbitrator: networkConfig.getArbitratorFromName('realitio'),
    oracle: oracle.address,
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
  const { dirty: isDirtyOmenCondition, isValid: isValidOmenCondition } = formStateOmenCondition

  const category = watchOmenCondition('category')
  const questionTitle = watchOmenCondition('questionTitle')
  const resolutionDate = watchOmenCondition('resolutionDate')
  const arbitrator = watchOmenCondition('arbitrator')
  const oracleOmenCondition = watchOmenCondition('oracle')
  const questionId = watchCustomCondition('questionId')
  const outcomesSlotCount = watchCustomCondition('outcomesSlotCount')
  const oracleCustomCondition = watchCustomCondition('oracle')

  const [conditionId, setConditionId] = React.useState<Maybe<string>>(null)
  const [error, setError] = React.useState<Maybe<Error>>(null)
  const [isConditionAlreadyExist, setErrorConditionAlreadyExist] = React.useState<boolean>(false)
  const [isQuestionAlreadyExist, setErrorQuestionAlreadyExist] = React.useState<boolean>(false)
  const [conditionType, setConditionType] = React.useState<ConditionType>(ConditionType.custom)
  const [outcomes, setOutcomes] = React.useState<Array<string>>([])
  const [outcome, setOutcome] = React.useState<string>('')

  const addOutcome = React.useCallback(() => {
    const sanitizedOutcome = outcome.trim()

    setOutcome('')
    setOutcomes([...outcomes, sanitizedOutcome])
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
      setCheckForExistingCondition(Remote.loading())
      setErrorQuestionAlreadyExist(false)
      setErrorConditionAlreadyExist(false)

      try {
        let conditionExists = false
        let conditionIdToUpdate: Maybe<string> = null
        if (questionId && oracleCustomCondition && outcomesSlotCount) {
          conditionIdToUpdate = ConditionalTokensService.getConditionId(
            questionId,
            oracleCustomCondition,
            outcomesSlotCount
          )
        }

        try {
          if (
            questionTitle &&
            oracleOmenCondition &&
            outcomes.length > 0 &&
            resolutionDate &&
            address
          ) {
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
              oracleOmenCondition + '',
              outcomes.length
            )
          }
        } catch (err) {
          setErrorQuestionAlreadyExist(err.message.includes('question must not exist'))
          logger.error(err)
        }

        logger.log(`Condition ID: ${conditionIdToUpdate}`)
        if (conditionIdToUpdate) {
          conditionExists = await CTService.conditionExists(conditionIdToUpdate)
        }

        setErrorConditionAlreadyExist(conditionExists)

        setError(null)
      } catch (err) {
        setError(err.message)
      }

      setCheckForExistingCondition(Remote.success('Done'))
    }
    checkConditionExist()
  }, [
    outcomes,
    RtioService,
    address,
    networkConfig,
    questionTitle,
    CTService,
    category,
    questionId,
    outcomesSlotCount,
    oracleCustomCondition,
    oracleOmenCondition,
    resolutionDate,
    arbitrator,
  ])

  const isOutcomesFromOmenConditionInvalid = React.useMemo(
    () => conditionType === ConditionType.omen && isDirtyOmenCondition && outcomes.length < 2,
    [conditionType, isDirtyOmenCondition, outcomes]
  )

  const prepareCondition = async () => {
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
        checkForExistingCondition.isLoading() ||
        checkForExistingCondition.isFailure() ||
        isConditionAlreadyExist
      : !isValidOmenCondition ||
        prepareConditionStatus.isLoading() ||
        prepareConditionStatus.isFailure() ||
        checkForExistingCondition.isLoading() ||
        checkForExistingCondition.isFailure() ||
        isConditionAlreadyExist ||
        isQuestionAlreadyExist

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

  const fullLoadingMessage = prepareConditionStatus.isFailure()
    ? prepareConditionStatus.getFailure()
    : prepareConditionStatus.isLoading()
    ? 'Working...'
    : conditionId && (
        <>
          All done! Condition <Hash value={conditionId} /> created.
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

              {isQuestionAlreadyExist && (
                <StatusInfoInline status={StatusInfoType.warning}>
                  The question for this condition already exists on{' '}
                  <Link href={oracle.url} target="_blank">
                    {oracle.description}
                  </Link>
                  . Please change it to a different one.
                </StatusInfoInline>
              )}
            </>
          )}
          {isConditionAlreadyExist && (
            <StatusInfoInline status={StatusInfoType.warning}>
              Condition already exist. Please use another question ID or change the number of
              outcomes.
            </StatusInfoInline>
          )}
          {conditionType === ConditionType.omen && (
            <>
              <AddOutcome
                addOutcome={addOutcome}
                onChange={onOutcomeChange}
                outcome={outcome}
                outcomes={outcomes}
                removeOutcome={removeOutcome}
              />
              {isOutcomesFromOmenConditionInvalid && (
                <ErrorContainer>
                  <ErrorMessage>Outcomes must be greater than 1</ErrorMessage>
                </ErrorContainer>
              )}
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
                title="Oracle"
                value={
                  <>
                    <Textfield
                      error={errorsOmenCondition.oracle && true}
                      name="oracle"
                      onChange={(e) => setValueOmenCondition('oracle', e.target.value, true)}
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
