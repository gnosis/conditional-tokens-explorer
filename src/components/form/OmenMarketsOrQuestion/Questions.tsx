import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleValue } from 'components/text/TitleValue'
import {
  GetConditionWithQuestionsOfPosition_position_conditions,
  GetConditionWithQuestions_condition,
} from 'types/generatedGQLForCTE'
import { getRealityQuestionUrl } from 'util/tools'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

type ConditionsProps =
  | GetConditionWithQuestionsOfPosition_position_conditions
  | GetConditionWithQuestions_condition
interface Props {
  data: ConditionsProps[]
}

// TODO Move to common
const ButtonCopyInlineFlex = styled(ButtonCopy)`
  display: inline-flex;
`

const ButtonExpandInlineFlex = styled(ButtonExpand)`
  display: inline-flex;
`

const ExternalLinkInlineFlex = styled(ExternalLink)`
  display: inline-flex;
`

const DisplayBlock = styled.div`
  display: block;
`

export const Questions = ({ data: conditionsWithQuestions }: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  const [openQuestions, setOpenQuestions] = useState(false)
  const areQuestionsMoreThanOne = useMemo(() => conditionsWithQuestions.length > 1, [
    conditionsWithQuestions,
  ])

  const getRealityQuestionUrlMemoized = useCallback(
    (questionId: string): string => getRealityQuestionUrl(questionId, networkConfig),
    [networkConfig]
  )

  return (
    <Row>
      <TitleValue
        title={areQuestionsMoreThanOne ? 'Questions' : 'Question'}
        value={
          <DisplayBlock>
            {conditionsWithQuestions[0].question?.title || conditionsWithQuestions[0].id}
            <ButtonCopyInlineFlex value={conditionsWithQuestions[0].question?.id} />
            {conditionsWithQuestions[0].question?.id && <ExternalLinkInlineFlex href={getRealityQuestionUrlMemoized(conditionsWithQuestions[0].question?.id)} />}
            {areQuestionsMoreThanOne && (
              <ButtonExpandInlineFlex onClick={() => setOpenQuestions(true)} />
            )}
          </DisplayBlock>
        }
      />
      {openQuestions && areQuestionsMoreThanOne && (
        <DisplayHashesTableModal
          hashes={conditionsWithQuestions.map(({ id, question }) => {
            return { hash: id, title: question?.title || id }
          })}
          isOpen={openQuestions}
          onRequestClose={() => setOpenQuestions(false)}
          title="Questions"
          titleTable="Question Title"
        />
      )}
    </Row>
  )
}
