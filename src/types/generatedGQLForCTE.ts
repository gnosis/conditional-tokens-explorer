/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PaginatedConditions
// ====================================================

export interface PaginatedConditions_conditions {
  __typename: "Condition";
  id: string;
}

export interface PaginatedConditions {
  conditions: PaginatedConditions_conditions[];
}

export interface PaginatedConditionsVariables {
  first?: number | null;
  skip?: number | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ConditionsList
// ====================================================

export interface ConditionsList_conditions_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface ConditionsList_conditions_positions {
  __typename: "Position";
  id: string;
  collateralToken: ConditionsList_conditions_positions_collateralToken;
}

export interface ConditionsList_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  createTimestamp: any;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
  resolveTimestamp: any | null;
  resolveBlockNumber: any | null;
  positions: ConditionsList_conditions_positions[] | null;
}

export interface ConditionsList {
  conditions: ConditionsList_conditions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCondition
// ====================================================

export interface GetCondition_condition_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface GetCondition_condition_positions {
  __typename: "Position";
  id: string;
  collateralToken: GetCondition_condition_positions_collateralToken;
}

export interface GetCondition_condition {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  createTimestamp: any;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
  resolveTimestamp: any | null;
  resolveBlockNumber: any | null;
  positions: GetCondition_condition_positions[] | null;
}

export interface GetCondition {
  condition: GetCondition_condition | null;
}

export interface GetConditionVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Positions
// ====================================================

export interface Positions_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface Positions_positions_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface Positions_positions_collection_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
}

export interface Positions_positions_collection_positions {
  __typename: "Position";
  id: string;
}

export interface Positions_positions_collection {
  __typename: "Collection";
  id: string;
  conditions: Positions_positions_collection_conditions[];
  conditionIds: string[];
  indexSets: any[];
  positions: Positions_positions_collection_positions[] | null;
}

export interface Positions_positions_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
}

export interface Positions_positions {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  createTimestamp: any;
  collateralToken: Positions_positions_collateralToken;
  wrappedToken: Positions_positions_wrappedToken | null;
  collection: Positions_positions_collection;
  conditionIds: string[];
  conditions: Positions_positions_conditions[];
}

export interface Positions {
  positions: Positions_positions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PositionsList
// ====================================================

export interface PositionsList_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface PositionsList_positions_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface PositionsList_positions_collection_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
}

export interface PositionsList_positions_collection_positions {
  __typename: "Position";
  id: string;
}

export interface PositionsList_positions_collection {
  __typename: "Collection";
  id: string;
  conditions: PositionsList_positions_collection_conditions[];
  conditionIds: string[];
  indexSets: any[];
  positions: PositionsList_positions_collection_positions[] | null;
}

export interface PositionsList_positions_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
}

export interface PositionsList_positions {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  createTimestamp: any;
  collateralToken: PositionsList_positions_collateralToken;
  wrappedToken: PositionsList_positions_wrappedToken | null;
  collection: PositionsList_positions_collection;
  conditionIds: string[];
  conditions: PositionsList_positions_conditions[];
}

export interface PositionsList {
  positions: PositionsList_positions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPosition
// ====================================================

export interface GetPosition_position_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface GetPosition_position_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface GetPosition_position_collection_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
}

export interface GetPosition_position_collection_positions {
  __typename: "Position";
  id: string;
}

export interface GetPosition_position_collection {
  __typename: "Collection";
  id: string;
  conditions: GetPosition_position_collection_conditions[];
  conditionIds: string[];
  indexSets: any[];
  positions: GetPosition_position_collection_positions[] | null;
}

export interface GetPosition_position_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
}

export interface GetPosition_position {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  createTimestamp: any;
  collateralToken: GetPosition_position_collateralToken;
  wrappedToken: GetPosition_position_wrappedToken | null;
  collection: GetPosition_position_collection;
  conditionIds: string[];
  conditions: GetPosition_position_conditions[];
}

export interface GetPosition {
  position: GetPosition_position | null;
}

export interface GetPositionVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMultiPositions
// ====================================================

export interface GetMultiPositions_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface GetMultiPositions_positions_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface GetMultiPositions_positions_collection_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
}

export interface GetMultiPositions_positions_collection_positions {
  __typename: "Position";
  id: string;
}

export interface GetMultiPositions_positions_collection {
  __typename: "Collection";
  id: string;
  conditions: GetMultiPositions_positions_collection_conditions[];
  conditionIds: string[];
  indexSets: any[];
  positions: GetMultiPositions_positions_collection_positions[] | null;
}

export interface GetMultiPositions_positions_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
}

export interface GetMultiPositions_positions {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  createTimestamp: any;
  collateralToken: GetMultiPositions_positions_collateralToken;
  wrappedToken: GetMultiPositions_positions_wrappedToken | null;
  collection: GetMultiPositions_positions_collection;
  conditionIds: string[];
  conditions: GetMultiPositions_positions_conditions[];
}

export interface GetMultiPositions {
  positions: GetMultiPositions_positions[];
}

export interface GetMultiPositionsVariables {
  ids: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserWithPositions
// ====================================================

export interface UserWithPositions_user_userPositions_position {
  __typename: "Position";
  id: string;
}

export interface UserWithPositions_user_userPositions_user {
  __typename: "User";
  id: string;
}

export interface UserWithPositions_user_userPositions {
  __typename: "UserPosition";
  id: string;
  position: UserWithPositions_user_userPositions_position;
  balance: any;
  wrappedBalance: any;
  totalBalance: any;
  user: UserWithPositions_user_userPositions_user;
}

export interface UserWithPositions_user {
  __typename: "User";
  userPositions: UserWithPositions_user_userPositions[] | null;
}

export interface UserWithPositions {
  user: UserWithPositions_user | null;
}

export interface UserWithPositionsVariables {
  account: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserPositionBalances
// ====================================================

export interface UserPositionBalances_userPositions_position_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface UserPositionBalances_userPositions_position_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface UserPositionBalances_userPositions_position {
  __typename: "Position";
  id: string;
  collateralToken: UserPositionBalances_userPositions_position_collateralToken;
  wrappedToken: UserPositionBalances_userPositions_position_wrappedToken | null;
}

export interface UserPositionBalances_userPositions_user {
  __typename: "User";
  id: string;
}

export interface UserPositionBalances_userPositions {
  __typename: "UserPosition";
  id: string;
  position: UserPositionBalances_userPositions_position;
  balance: any;
  wrappedBalance: any;
  totalBalance: any;
  user: UserPositionBalances_userPositions_user;
}

export interface UserPositionBalances {
  userPositions: UserPositionBalances_userPositions[];
}

export interface UserPositionBalancesVariables {
  account?: string | null;
  positionId?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ConditionData
// ====================================================

export interface ConditionData_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface ConditionData_positions {
  __typename: "Position";
  id: string;
  collateralToken: ConditionData_positions_collateralToken;
}

export interface ConditionData {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  createTimestamp: any;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
  resolveTimestamp: any | null;
  resolveBlockNumber: any | null;
  positions: ConditionData_positions[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PositionData
// ====================================================

export interface PositionData_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface PositionData_wrappedToken {
  __typename: "WrappedToken";
  id: string;
}

export interface PositionData_collection_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: string;
  payouts: any[] | null;
  payoutNumerators: any[] | null;
  payoutDenominator: any | null;
}

export interface PositionData_collection_positions {
  __typename: "Position";
  id: string;
}

export interface PositionData_collection {
  __typename: "Collection";
  id: string;
  conditions: PositionData_collection_conditions[];
  conditionIds: string[];
  indexSets: any[];
  positions: PositionData_collection_positions[] | null;
}

export interface PositionData_conditions {
  __typename: "Condition";
  id: string;
  oracle: string;
  questionId: string;
  outcomeSlotCount: number;
  resolved: boolean;
}

export interface PositionData {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  createTimestamp: any;
  collateralToken: PositionData_collateralToken;
  wrappedToken: PositionData_wrappedToken | null;
  collection: PositionData_collection;
  conditionIds: string[];
  conditions: PositionData_conditions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
