/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Conditions
// ====================================================

export interface Conditions_conditions {
  __typename: "Condition";
  id: string;
  oracle: any;
  questionId: any;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: any;
}

export interface Conditions {
  conditions: Conditions_conditions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCondition
// ====================================================

export interface GetCondition_condition {
  __typename: "Condition";
  id: string;
  oracle: any;
  questionId: any;
  outcomeSlotCount: number;
  resolved: boolean;
  creator: any;
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
// GraphQL query operation: GetPosition
// ====================================================

export interface GetPosition_position_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface GetPosition_position_collection_positions {
  __typename: "Position";
  id: string;
}

export interface GetPosition_position_collection {
  __typename: "Collection";
  id: string;
  conditionIds: string[];
  indexSets: any[];
  positions: GetPosition_position_collection_positions[] | null;
}

export interface GetPosition_position_conditions {
  __typename: "Condition";
  id: string;
}

export interface GetPosition_position {
  __typename: "Position";
  id: string;
  indexSets: any[];
  activeValue: any;
  collateralToken: GetPosition_position_collateralToken;
  collection: GetPosition_position_collection;
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
// GraphQL query operation: Positions
// ====================================================

export interface Positions_positions_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface Positions_positions {
  __typename: "Position";
  id: string;
  collateralToken: Positions_positions_collateralToken;
}

export interface Positions {
  positions: Positions_positions[];
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

export interface UserWithPositions_user_userPositions {
  __typename: "UserPosition";
  id: string;
  position: UserWithPositions_user_userPositions_position;
  balance: any;
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

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
