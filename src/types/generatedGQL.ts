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
}

export interface Conditions {
  conditions: Conditions_conditions[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: fetchPosition
// ====================================================

export interface fetchPosition_position_collateralToken {
  __typename: "CollateralToken";
  id: string;
}

export interface fetchPosition_position_collection {
  __typename: "Collection";
  id: string;
}

export interface fetchPosition_position {
  __typename: "Position";
  collateralToken: fetchPosition_position_collateralToken;
  collection: fetchPosition_position_collection;
}

export interface fetchPosition {
  position: fetchPosition_position | null;
}

export interface fetchPositionVariables {
  id?: string | null;
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
  account: any;
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
