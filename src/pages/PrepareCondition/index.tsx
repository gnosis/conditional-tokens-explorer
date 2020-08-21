import React from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { Button } from '../../components/buttons/Button'
import { ButtonSelect } from '../../components/buttons/ButtonSelect'
import { CenteredCard } from '../../components/common/CenteredCard'
import { Dropdown, DropdownPosition } from '../../components/common/Dropdown'
import { AddOutcome } from '../../components/form/AddOutcome'
import { SelectItem } from '../../components/form/SelectItem'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { ErrorContainer, Error as ErrorMessage } from '../../components/pureStyledComponents/Error'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Row } from '../../components/pureStyledComponents/Row'
import { Textfield } from '../../components/pureStyledComponents/Textfield'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'
import { FullLoading } from '../../components/statusInfo/FullLoading'
import { IconTypes } from '../../components/statusInfo/common'
import { TitleValue } from '../../components/text/TitleValue'
import { ADDRESS_REGEX, BYTES_REGEX, MAX_OUTCOMES, MIN_OUTCOMES } from '../../config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { ConditionalTokensService } from '../../services/conditionalTokens'
import { isAddress } from '../../util/tools'

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

export const PrepareCondition = () => {
  const { _type: status, CTService, address, connect, provider } = useWeb3ConnectedOrInfura()

  const [numOutcomes, setNumOutcomes] = React.useState(0)
  const [oracleAddress, setOracleAddress] = React.useState('')
  const [questionId, setQuestionId] = React.useState('')
  const [isWorking, setIsWorking] = React.useState(false)
  const [error, setError] = React.useState<Maybe<Error>>(null)

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
    setIsWorking(true)

    try {
      if (status === Web3ContextStatus.Connected) {
        const conditionExists = await CTService.conditionExists(conditionId)
        if (!conditionExists) {
          const tx = await CTService.prepareCondition(questionId, oracleAddress, numOutcomes)
          await provider.waitForTransaction(tx)

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
      setIsWorking(false)
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

  const submitDisabled = !isValid || isWorking

  enum ConditionType {
    custom = 'custom',
    omen = 'omen',
  }
  const conditionTypeItems = [
    {
      text: 'Custom Reporter',
      onClick: () => {
        setConditionType(ConditionType.custom)
      },
      value: ConditionType.custom,
    },
    {
      text: 'Omen Condition',
      onClick: () => {
        setConditionType(ConditionType.omen)
      },
      value: ConditionType.omen,
    },
  ]
  const [conditionType, setConditionType] = React.useState(conditionTypeItems[0].value)

  enum QuestionType {
    nuancedBinary = 'nuancedBinary',
    categorical = 'categorical',
    binary = 'binary',
  }
  const questionTypeItems = [
    {
      text: 'Binary',
      onClick: () => {
        setQuestionType(QuestionType.binary)
      },
      value: QuestionType.binary,
    },
    {
      text: 'Nuanced Binary',
      onClick: () => {
        setQuestionType(QuestionType.nuancedBinary)
      },
      value: QuestionType.nuancedBinary,
    },
    {
      text: 'Categorical',
      onClick: () => {
        setQuestionType(QuestionType.categorical)
      },
      value: QuestionType.categorical,
    },
  ]
  const [questionType, setQuestionType] = React.useState(questionTypeItems[0].value)

  const categoryItems = [
    {
      text: 'Business & Finance',
      onClick: () => {
        setCategory(0)
      },
      value: 0,
    },
    {
      text: 'Cryptocurrency',
      onClick: () => {
        setCategory(1)
      },
      value: 1,
    },
    {
      text: 'News & Politics',
      onClick: () => {
        setCategory(2)
      },
      value: 2,
    },
    {
      text: 'Science & Tech',
      onClick: () => {
        setCategory(3)
      },
      value: 3,
    },
    {
      text: 'Sports',
      onClick: () => {
        setCategory(4)
      },
      value: 4,
    },
    {
      text: 'Weather',
      onClick: () => {
        setCategory(5)
      },
      value: 5,
    },
    {
      text: 'Miscellaneous',
      onClick: () => {
        setCategory(6)
      },
      value: 6,
    },
  ]
  const [category, setCategory] = React.useState(categoryItems[0].value)

  const arbitratorItems = [
    {
      text: 'Realit.io',
      onClick: () => {
        setArbitrator('realitio')
      },
      value: 'realitio',
    },
    {
      text: 'Kleros',
      onClick: () => {
        setArbitrator('kleros')
      },
      value: 'kleros',
    },
  ]
  const [arbitrator, setArbitrator] = React.useState(arbitratorItems[0].value)

  const [outcomes, setOutcomes] = React.useState<Array<string | undefined>>([])
  const [outcome, setOutcome] = React.useState<string | undefined>()

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
                    content={
                      conditionTypeItems.filter((item) => item.value === conditionType)[0].text
                    }
                  />
                }
                dropdownPosition={DropdownPosition.center}
                fullWidth
                items={conditionTypeItems.map((item, index) => (
                  <SelectItem
                    content={item.text}
                    key={index}
                    name="conditionType"
                    onClick={item.onClick}
                    value={item.value}
                  />
                ))}
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
                  <Dropdown
                    dropdownButtonContent={
                      <ButtonSelect
                        content={
                          questionTypeItems.filter((item) => item.value === questionType)[0].text
                        }
                      />
                    }
                    dropdownPosition={DropdownPosition.center}
                    fullWidth
                    items={questionTypeItems.map((item, index) => (
                      <SelectItem
                        content={item.text}
                        key={index}
                        name="questionType"
                        onClick={item.onClick}
                        value={item.value}
                      />
                    ))}
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
                  <Dropdown
                    dropdownButtonContent={
                      <ButtonSelect
                        content={categoryItems.filter((item) => item.value === category)[0].text}
                      />
                    }
                    dropdownPosition={DropdownPosition.center}
                    fullWidth
                    items={categoryItems.map((item, index) => (
                      <SelectItem
                        content={item.text}
                        key={index}
                        name="category"
                        onClick={item.onClick}
                        value={item.value.toString()}
                      />
                    ))}
                  />
                }
              />
              <TitleValue
                title="Arbitrator"
                value={
                  <Dropdown
                    dropdownButtonContent={
                      <ButtonSelect
                        content={
                          arbitratorItems.filter((item) => item.value === arbitrator)[0].text
                        }
                      />
                    }
                    dropdownPosition={DropdownPosition.center}
                    fullWidth
                    items={arbitratorItems.map((item, index) => (
                      <SelectItem
                        content={item.text}
                        key={index}
                        name="arbitrator"
                        onClick={item.onClick}
                        value={item.value}
                      />
                    ))}
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
        {isWorking && (
          <FullLoading
            actionButton={error ? { text: 'OK', onClick: () => setIsWorking(true) } : undefined}
            icon={error ? IconTypes.error : IconTypes.spinner}
            message={error ? error.message : 'Working...'}
            title={error ? 'Error' : 'Prepare Condition'}
          />
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
