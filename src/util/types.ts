import { BigNumber } from 'ethers/utils'

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
  EMPTY_BALANCE_ERC1155_ERROR = `User doesn't have position balance`,
  EMPTY_BALANCE_ERC20_ERROR = `User doesn't have erc20 balance`,
}

export enum BalanceErrors {
  INVALID_ERROR = `Invalid position`,
  FETCHING_ERROR = `Error fetching balance`,
  EMPTY_BALANCE_ERC1155_ERROR = `User doesn't have position balance`,
  EMPTY_BALANCE_ERC20_ERROR = `User doesn't have erc20 balance`,
}

export type Errors = ConditionErrors | PositionErrors | BalanceErrors

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

export interface OutcomeProps {
  id: string
  value: number
}

export enum SplitFromType {
  collateral = 'collateral',
  position = 'position',
}

export enum OracleFilterOptions {
  All = 'all',
  Custom = 'custom',
  Kleros = 'kleros',
  Realitio = 'realitio',
}

export enum CollateralFilterOptions {
  All = 'all',
}

export type PositionIdsArray = {
  positionId: string
  balance: BigNumber
}

export interface SplitStatus {
  positionIds: PositionIdsArray[]
  collateral: string
}

export interface TransferOutcomeOptions {
  amount: BigNumber
  address: string
  positionId: string
}
