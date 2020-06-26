/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ConditionList
// ====================================================

export interface ConditionList_conditions {
  __typename: "Condition";
  id: string;
  oracle: any;
  questionId: any;
  outcomeSlotCount: number;
}

export interface ConditionList {
  conditions: ConditionList_conditions[];
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

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
