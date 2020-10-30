import lodashClonedeep from 'lodash.clonedeep'
import moment from 'moment'
import React, { KeyboardEvent, useState, useCallback, useEffect, useMemo, ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Prompt } from 'react-router'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons'
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
import { SmallNote } from 'components/pureStyledComponents/SmallNote'
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
  MAX_DATE,
  MAX_OUTCOMES,
  MAX_OUTCOMES_ALLOWED,
  MIN_OUTCOMES,
  MIN_OUTCOMES_ALLOWED,
} from 'config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { isAddress } from 'util/tools'
import { Arbitrator, ConditionType, QuestionOptions } from 'util/types'

const logger = getLogger('Prepare Condition')

const Link = styled.a`
  color: ${(props) => props.theme.colors.warning};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const ButtonCopyStyled = styled(ButtonCopy)`
  position: relative;
  top: 1px;
`

interface CustomConditionType {
  questionId: string
  outcomesSlotCount: Maybe<number>
  oracle: string
}

interface OmenConditionType {
  questionTitle: string
  resolutionDate: Maybe<string>
  category: Maybe<string>
  arbitrator: Arbitrator
  oracle: string
}

export const PrepareCondition = () => {
  const {
    _type: status,
    CTService,
    RtyService,
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

  const oracle = networkConfig.getOracleFromName('reality' as KnownOracle)

  const defaultValuesOmen = {
    arbitrator: networkConfig.getArbitratorFromName('kleros'),
    category: null,
    oracle: oracle.address,
    questionTitle: '',
    resolutionDate: null,
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
  const {
    dirty: isDirtyCustomCondition,
    isValid: isValidCustomCondition,
  } = formStateCustomCondition

  const {
    control: omenControl,
    errors: errorsOmenCondition,
    formState: formStateOmenCondition,
    getValues: getValuesOmenCondition,
    register: registerOmenCondition,
    setError: setErrorOmenCondition,
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

  const [conditionId, setConditionId] = useState<Maybe<string>>(null)
  const [error, setError] = useState<Maybe<Error>>(null)
  const [isConditionAlreadyExist, setErrorConditionAlreadyExist] = useState<boolean>(false)
  const [isQuestionAlreadyExist, setErrorQuestionAlreadyExist] = useState<boolean>(false)
  const [conditionIdPreview, setConditionIdPreview] = useState<Maybe<string>>(null)
  const [conditionType, setConditionType] = useState<ConditionType>(ConditionType.custom)
  const [outcomes, setOutcomes] = useState<Array<string>>([])
  const [outcome, setOutcome] = useState<string>('')

  const addOutcome = useCallback(() => {
    const sanitizedOutcome = outcome.trim()
    const outcomesCloned = lodashClonedeep(outcomes)
    setOutcome('')
    setOutcomes([...outcomesCloned, sanitizedOutcome])
  }, [outcome, outcomes, setOutcomes])

  const removeOutcome = useCallback(
    (index: number) => {
      const outcomesCloned = lodashClonedeep(outcomes)
      outcomesCloned.splice(index, 1)
      setOutcomes([...outcomesCloned])
    },
    [outcomes]
  )

  const updateOutcome = useCallback(
    (value: string, index: number) => {
      const outcomesCloned = lodashClonedeep(outcomes)
      outcomesCloned[index] = value.trim()
      setOutcomes([...outcomesCloned])
    },
    [outcomes]
  )

  const onChangeOutcome = (e: ChangeEvent<HTMLInputElement>) => {
    setOutcome(e.currentTarget.value)
  }

  useEffect(() => {
    const getConditionIdPreview = async () => {
      setErrorQuestionAlreadyExist(false)
      setErrorConditionAlreadyExist(false)
      setConditionIdPreview(null)

      try {
        if (questionId && oracleCustomCondition && outcomesSlotCount) {
          setConditionIdPreview(
            ConditionalTokensService.getConditionId(
              questionId,
              oracleCustomCondition,
              outcomesSlotCount
            )
          )
        }

        try {
          if (
            questionTitle &&
            oracleOmenCondition &&
            outcomes.length > 0 &&
            resolutionDate &&
            address &&
            category
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
            const questionId = await RtyService.askQuestionConstant(questionOptions)
            setConditionIdPreview(
              ConditionalTokensService.getConditionId(
                questionId,
                oracleOmenCondition + '',
                outcomes.length
              )
            )
          }
        } catch (err) {
          setErrorQuestionAlreadyExist(err.message.includes('question must not exist'))
          logger.error(err)
        }

        setError(null)
      } catch (err) {
        setError(err.message)
      }
    }
    getConditionIdPreview()
  }, [
    outcomes,
    RtyService,
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

  useEffect(() => {
    let cancelled = false

    const checkConditionExist = async () => {
      if (conditionIdPreview) {
        setCheckForExistingCondition(Remote.loading())

        const conditionExists = await CTService.conditionExists(conditionIdPreview)
        if (!cancelled) {
          setErrorConditionAlreadyExist(conditionExists)
          setCheckForExistingCondition(Remote.success('Done'))

          logger.log(`Condition ID: ${conditionIdPreview}`)
        }
      }
    }

    checkConditionExist()

    return () => {
      cancelled = true
    }
  }, [CTService, conditionIdPreview])

  const isOutcomesFromOmenConditionInvalid = useMemo(
    () =>
      conditionType === ConditionType.omen &&
      isDirtyOmenCondition &&
      outcomes.length < MIN_OUTCOMES_ALLOWED,
    [conditionType, isDirtyOmenCondition, outcomes]
  )

  const prepareCondition = useCallback(async () => {

    try {
      if (status === Web3ContextStatus.Connected && address) {
        setPrepareConditionStatus(Remote.loading())
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

          if (resolutionDate && questionTitle && oracleOmen && category) {
            const openingDateMoment = moment(resolutionDate + '')
            logger.log(`outcomes`, outcomes)
            const questionOptions: QuestionOptions = {
              arbitratorAddress: (arbitrator as Arbitrator).address,
              category,
              openingDateMoment,
              outcomes,
              question: questionTitle + '',
              networkConfig,
              signerAddress: address,
            }

            const questionId = await RtyService.askQuestion(questionOptions)

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
  }, [
    CTService,
    RtyService,
    address,
    category,
    conditionType,
    connect,
    getValuesCustomCondition,
    getValuesOmenCondition,
    networkConfig,
    outcomes,
    status,
  ])

  const onClickUseMyWallet = useCallback(() => {
    if (status === Web3ContextStatus.Connected && address) {
      setValueCustomCondition('oracle', address, true)
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }, [address, connect, setValueCustomCondition, status])

  const submitDisabled = useMemo(
    () =>
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
          isQuestionAlreadyExist ||
          isOutcomesFromOmenConditionInvalid,
    [
      isValidCustomCondition,
      conditionType,
      isValidOmenCondition,
      prepareConditionStatus,
      checkForExistingCondition,
      isConditionAlreadyExist,
      isQuestionAlreadyExist,
      isOutcomesFromOmenConditionInvalid,
    ]
  )

  const today = useMemo(() => moment().format('YYYY-MM-DD'), [])

  const fullLoadingActionButton = useMemo(() => {
    if (prepareConditionStatus.isSuccess()) {
      return {
        buttonType: ButtonType.primary,
        onClick: () => {
          setPrepareConditionStatus(Remote.notAsked<Maybe<string>>())
          if (conditionId) history.push(`/conditions/${conditionId}`)
        },
        text: 'OK',
      }
    } else if (prepareConditionStatus.isFailure()) {
      return {
        buttonType: ButtonType.danger,
        text: 'Close',
        onClick: () => setPrepareConditionStatus(Remote.notAsked<Maybe<string>>()),
      }
    } else {
      return undefined
    }
  }, [conditionId, history, prepareConditionStatus])

  const fullLoadingIcon = useMemo(() => {
    return prepareConditionStatus.isFailure()
      ? IconTypes.error
      : prepareConditionStatus.isSuccess()
      ? IconTypes.ok
      : IconTypes.spinner
  }, [prepareConditionStatus])

  const fullLoadingMessage = useMemo(() => {
    return prepareConditionStatus.isFailure()
      ? prepareConditionStatus.getFailure()
      : prepareConditionStatus.isLoading()
      ? 'Working...'
      : conditionId && (
          <>
            All done! Condition <Hash value={conditionId} /> created.
          </>
        )
  }, [conditionId, prepareConditionStatus])

  const fullLoadingTitle = useMemo(
    () => (prepareConditionStatus.isFailure() ? 'Error' : 'Prepare Condition'),
    [prepareConditionStatus]
  )

  const newCustomConditionStatusInfo = useMemo(() => {
    if (checkForExistingCondition.isLoading()) {
      return {
        title: 'Checking existing conditions...',
        status: StatusInfoType.working,
        contents: undefined,
      }
    } else if (conditionIdPreview && isConditionAlreadyExist) {
      return {
        title: 'Duplicated Condition',
        status: StatusInfoType.warning,
        contents: (
          <>
            Condition{' '}
            <Hash href={`/conditions/${conditionIdPreview}`} value={conditionIdPreview}></Hash>{' '}
            already exists. Please use another question ID or change the number of outcomes.
          </>
        ),
      }
    } else if (conditionIdPreview) {
      return {
        title: 'Condition Id Preview',
        status: StatusInfoType.success,
        contents: (
          <>
            {conditionIdPreview}
            <ButtonCopyStyled value={conditionIdPreview} />
          </>
        ),
      }
    } else {
      return undefined
    }
  }, [checkForExistingCondition, conditionIdPreview, isConditionAlreadyExist])

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
                    autoComplete="off"
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
                      autoComplete="off"
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
          {conditionType === ConditionType.omen && (
            <>
              <AddOutcome
                addOutcome={addOutcome}
                onChange={onChangeOutcome}
                outcome={outcome}
                outcomes={outcomes}
                removeOutcome={removeOutcome}
                updateOutcome={updateOutcome}
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
                    placeholder={`You can add between ${MIN_OUTCOMES_ALLOWED} and ${MAX_OUTCOMES_ALLOWED} outcomes...`}
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
                      onChange={(e) => {
                        if (e.target.checkValidity()) {
                          setValueOmenCondition('resolutionDate', e.target.value, true)
                        } else {
                          setErrorOmenCondition('resolutionDate', 'validity')
                        }
                      }}
                      placeholder="MM/DD/YYYY"
                      ref={registerOmenCondition({
                        required: true,
                        min: today,
                        max: MAX_DATE,
                      })}
                      type="date"
                    />
                    {errorsOmenCondition.resolutionDate && (
                      <ErrorContainer>
                        {errorsOmenCondition.resolutionDate.type === 'required' && (
                          <ErrorMessage>Required field</ErrorMessage>
                        )}
                        {['min', 'max', 'validity'].includes(
                          errorsOmenCondition.resolutionDate.type
                        ) && (
                          <ErrorMessage>{`Invalid date or out of range. Valid dates are from today (${today}) to ${MAX_DATE}`}</ErrorMessage>
                        )}
                      </ErrorContainer>
                    )}
                  </>
                }
              />
              <StatusInfoInline status={StatusInfoType.warning}>
                Set the market resolution date at least 6 days after the correct outcome will be
                known and make sure that this market won&apos;t be{' '}
                <Link href="https://conditional.netlify.app/rules.pdf" target="_blank">
                  invalid
                </Link>
                .
              </StatusInfoInline>
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
                      autoComplete="off"
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
                    <SmallNote>
                      <strong>Note:</strong> Reality.eth is the default oracle for Omen conditions.
                    </SmallNote>
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
                    autoComplete="off"
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
        {newCustomConditionStatusInfo && (
          <StatusInfoInline
            status={newCustomConditionStatusInfo.status}
            title={newCustomConditionStatusInfo.title}
          >
            {newCustomConditionStatusInfo.contents}
          </StatusInfoInline>
        )}
        <ButtonContainer>
          <Button disabled={submitDisabled} onClick={prepareCondition}>
            Prepare
          </Button>
        </ButtonContainer>
        <Prompt
          message="Are you sure you want to leave this page? The changes you made will be lost?"
          when={
            conditionType === ConditionType.custom
              ? isDirtyCustomCondition && prepareConditionStatus.isNotAsked()
              : (isDirtyOmenCondition || outcomes.length > 0) && prepareConditionStatus.isNotAsked()
          }
        />
      </CenteredCard>
    </>
  )
}
