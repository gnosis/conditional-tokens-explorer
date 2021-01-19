/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Meta
// ====================================================

export interface Meta__meta_block {
  __typename: "_Block_";
  /**
   * The hash of the block
   */
  hash: any | null;
  /**
   * The block number
   */
  number: number;
}

export interface Meta__meta {
  __typename: "_Meta_";
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: Meta__meta_block;
}

export interface Meta {
  /**
   * Access to subgraph metadata
   */
  _meta: Meta__meta | null;
}

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
