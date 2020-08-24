export interface Question {
  id: string
  raw: string
  templateId: number
  title: string
  resolution: Date
  arbitratorAddress: string
  category: string
  outcomes: string[]
}

export interface QuestionLog {
  category: string
  lang: string
  title: string
  type: string
  outcomes?: string[]
}

export enum ConditionStatus {
  Open = 'Open',
  Resolved = 'Resolved',
}

export enum ConditionType {
  omen = 'Omen Condition',
  custom = 'Custom Reporter',
}

export enum QuestionType {
  nuancedBinary = 'Nuanced Binary',
  categorical = 'Categorical',
  binary = 'Binary',
}

export enum Categories {
  businessAndFinance = 'Business & Finance',
  cryptocurrency = 'Cryptocurrency',
  newsAndPolitics = 'News & Politics',
  scienceAndTech = 'Science & Tech',
  sports = 'Sports',
  weather = 'Weather',
  miscellaneous = 'Miscellaneous',
}

export enum ConditionErrors {
  INVALID_ERROR = `Invalid condition`,
  FETCHING_ERROR = `Error fetching condition`,
  NOT_FOUND_ERROR = `Condition doesn't exist`,
  NOT_RESOLVED_ERROR = `Condition is not resolved`,
}

export enum PositionErrors {
  INVALID_ERROR = `Invalid position`,
  FETCHING_ERROR = `Error fetching position`,
  NOT_FOUND_ERROR = `Position doesn't exist`,
  EMPTY_BALANCE_ERROR = `User doesn't had position balance`,
}

export type Errors = ConditionErrors | PositionErrors

export type Token = {
  symbol: string
  address: string
  decimals: number
}

export type NetworkId = 1 | 4 | 50

export enum NetworkIds {
  MAINNET = 1,
  RINKEBY = 4,
  GANACHE = 50,
}

export enum Status {
  Ready = 'Ready',
  Loading = 'Loading',
  Refreshing = 'Refreshing',
  Done = 'Done',
  Error = 'Error',
}

export type Oracle = {
  name: KnownOracle
  description: string
  url: string
  address: string
}
