import gql from 'graphql-tag'

export const queryTopCategories = gql`
  query GetCategories($first: Int!) {
    categories(first: $first, orderBy: numOpenConditions, orderDirection: desc) {
      id
    }
  }
`
