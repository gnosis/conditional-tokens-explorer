import CTHelpersConstructor from '@gnosis.pm/conditional-tokens-contracts/utils/id-helpers'
import { Contract, ethers } from 'ethers'
import { TransactionReceipt, TransactionResponse } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import Web3Utils from 'web3-utils'

import { NetworkConfig } from '../config/networkConfig'

const CTHelpers = CTHelpersConstructor(Web3Utils)

const conditionalTokensAbi = [
  'function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external',
  'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeSlotCount)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'function payoutNumerators(bytes32, uint) public view returns (uint)',
  'function payoutDenominator(bytes32) public view returns (uint)',
  'function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) external',
  'function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) external view returns (bytes32) ',
  'function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint) ',
  'function balanceOf(address owner, uint256 positionId) external view returns (uint256)',
  'function balanceOfBatch(address[] owners, uint256[] ids) public view returns (uint256[])',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data) external',
  'function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint)',
  'function mergePositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) external',
  'function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) external',
  'function reportPayouts(bytes32 questionId, uint[] payouts)',
]

export class ConditionalTokensService {
  private contract: Contract

  constructor(
    private networkConfig: NetworkConfig,
    private provider: ethers.providers.Provider,
    private signer?: ethers.Signer
  ) {
    const contractAddress = networkConfig.getConditionalTokensAddress()

    if (signer) {
      this.contract = new ethers.Contract(contractAddress, conditionalTokensAbi, provider).connect(
        signer
      )
    } else {
      this.contract = new ethers.Contract(contractAddress, conditionalTokensAbi, provider)
    }
  }

  static getConditionId(
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number
  ): Maybe<string> {
    try {
      return ethers.utils.solidityKeccak256(
        ['address', 'bytes32', 'uint256'],
        [oracleAddress, questionId, outcomeSlotCount]
      )
    } catch (err) {
      return null
    }
  }

  static getCollectionId(parentCollection: string, conditionId: string, indexSet: BigNumber) {
    return CTHelpers.combineCollectionIds([
      parentCollection,
      CTHelpers.getCollectionId(conditionId, indexSet),
    ])
  }

  static getConbinedCollectionId(collections: Array<{ conditionId: string; indexSet: BigNumber }>) {
    return CTHelpers.combineCollectionIds(
      collections.map(({ conditionId, indexSet }) =>
        CTHelpers.getCollectionId(conditionId, indexSet)
      )
    )
  }

  static getPositionId(collateralToken: string, collectionId: string): string {
    return CTHelpers.getPositionId(collateralToken, collectionId)
  }

  async prepareCondition(
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number
  ): Promise<string> {
    const transactionObject = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      outcomeSlotCount,
      {
        value: '0x0',
        gasLimit: 750000,
      }
    )
    return transactionObject.hash
  }

  async splitPosition(
    collateralToken: string,
    parentCollectionId: string,
    conditionId: string,
    partition: BigNumber[],
    amount: BigNumber
  ): Promise<TransactionResponse> {
    const tx = await this.contract.splitPosition(
      collateralToken,
      parentCollectionId,
      conditionId,
      partition,
      amount,
      {
        value: '0x0',
        gasLimit: 1750000,
      }
    )
    return tx
  }

  redeemPositions = async (
    collateralToken: string,
    parentCollectionId: string, // If doesn't exist, must be zero, ethers.constants.HashZero
    conditionId: string,
    indexSets: string[]
  ): Promise<TransactionReceipt> => {
    const tx = await this.contract.redeemPositions(
      collateralToken,
      parentCollectionId,
      conditionId,
      indexSets
    )
    return this.provider.waitForTransaction(tx.hash)
  }

  async getOutcomeSlotCount(conditionId: string): Promise<BigNumber> {
    return await this.contract.getOutcomeSlotCount(conditionId)
  }

  async conditionExists(conditionId: string): Promise<boolean> {
    return !(await this.getOutcomeSlotCount(conditionId)).isZero()
  }

  async balanceOf(positionId: string): Promise<BigNumber> {
    if (this.signer) {
      const owner = await this.signer.getAddress()
      return await this.contract.balanceOf(owner, positionId)
    } else {
      return new BigNumber(0)
    }
  }

  async balanceOfBatch(positionIds: Array<string>): Promise<Array<BigNumber>> {
    const owner = await this.signer.getAddress()
    const owners = Array.from(new Array(positionIds.length), (_) => owner)
    return this.contract.balanceOfBatch(owners, positionIds)
  }

  async reportPayouts(questionId: string, payouts: number[]): Promise<TransactionReceipt> {
    const tx = await this.contract.reportPayouts(questionId, payouts)
    return this.provider.waitForTransaction(tx.hash)
  }
}
