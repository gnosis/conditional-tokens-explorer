import gql from 'graphql-tag'

const questionFragment = gql`
  fragment QuestionData on Question {
    id
    title
  }
`

const conditionWithQuestionsFragment = gql`
  fragment ConditionWithQuestionsFragment on Condition {
    id
    oracle
    questionId
    outcomeSlotCount
    resolved
    question {
      ...QuestionData
    }
  }
`
export const GetConditionWithQuestions = gql`
  query GetConditionWithQuestions($id: ID!) {
    condition(id: $id) {
      ...ConditionWithQuestionsFragment
    }
  }
  ${conditionWithQuestionsFragment}
  ${questionFragment}
`

export const GetConditionWithQuestionsOfPosition = gql`
  query GetConditionWithQuestionsOfPosition($id: ID!) {
    position(id: $id) {
      conditions {
        ...ConditionWithQuestionsFragment
      }
    }
  }
  ${conditionWithQuestionsFragment}
  ${questionFragment}
`
