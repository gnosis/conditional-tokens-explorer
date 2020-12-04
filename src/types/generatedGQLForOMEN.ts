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
// GraphQL query operation: GetCategories
// ====================================================

export interface GetCategories_categories {
  __typename: "Category";
  id: string;
}

export interface GetCategories {
  categories: GetCategories_categories[];
}

export interface GetCategoriesVariables {
  first: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOmenMarketsByConditionID
// ====================================================

export interface GetOmenMarketsByConditionID_condition_fixedProductMarketMakers_question {
  __typename: "Question";
  title: string | null;
}

export interface GetOmenMarketsByConditionID_condition_fixedProductMarketMakers {
  __typename: "FixedProductMarketMaker";
  id: string;
  question: GetOmenMarketsByConditionID_condition_fixedProductMarketMakers_question | null;
}

export interface GetOmenMarketsByConditionID_condition {
  __typename: "Condition";
  fixedProductMarketMakers: GetOmenMarketsByConditionID_condition_fixedProductMarketMakers[];
}

export interface GetOmenMarketsByConditionID {
  condition: GetOmenMarketsByConditionID_condition | null;
}

export interface GetOmenMarketsByConditionIDVariables {
  id: string;
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
