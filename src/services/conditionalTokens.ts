import CTHelpersConstructor from '@gnosis.pm/conditional-tokens-contracts/utils/id-helpers'
import { Contract, ethers } from 'ethers'
import { TransactionReceipt, TransactionResponse } from 'ethers/providers'
import { BigNumber, Interface } from 'ethers/utils'
import Web3Utils, { toChecksumAddress } from 'web3-utils'

import { CONFIRMATIONS_TO_WAIT } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import { getLogger } from 'util/logger'
import { improveErrorMessage } from 'util/tools'
import { PositionIdsArray, Token } from 'util/types'

const logger = getLogger('Conditional Tokens')

// HACK - yarn build is breaking web3-utils soliditySha3. This should get the same results
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function soliditySha3(...args: any[]) {
  const t = args.map(({ t }) => t)
  const v = args.map(({ v }) => v)

  return ethers.utils.solidityKeccak256(t, v)
}

const CTHelpers = CTHelpersConstructor({ ...Web3Utils, soliditySha3 })

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
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] values, bytes data) external',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
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

  static getCombinedCollectionId(collections: Array<{ conditionId: string; indexSet: BigNumber }>) {
    return CTHelpers.combineCollectionIds(
      collections.map(({ conditionId, indexSet }) =>
        CTHelpers.getCollectionId(conditionId, indexSet)
      )
    )
  }

  static getPositionId(collateralToken: string, collectionId: string): string {
    return CTHelpers.getPositionId(collateralToken, collectionId)
  }

  get address(): string {
    return this.contract.address
  }

  async getPositionsFromPartition(
    partition: BigNumber[],
    parentCollection: string,
    conditionId: string,
    collateral: string
  ): Promise<PositionIdsArray[]> {
    const partitionsPromises = partition.map(async (indexSet: BigNumber) => {
      const collectionId = await this.getCollectionId(parentCollection, conditionId, indexSet)

      const positionId = ConditionalTokensService.getPositionId(collateral, collectionId)
      logger.info(
        `conditionId: ${conditionId} / collectionId ${collectionId} / parentCollection: ${parentCollection} / indexSet: ${indexSet.toString()}`
      )
      logger.info(`Position: ${positionId}`)

      const balance = await this.balanceOf(positionId)

      return { positionId, balance }
    })
    const partitions = await Promise.all(partitionsPromises)
    return partitions
  }

  async prepareCondition(
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number
  ): Promise<TransactionReceipt | void> {
    const tx: TransactionResponse = await this.contract.prepareCondition(
      oracleAddress,
      questionId,
      outcomeSlotCount
    )
    return tx
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  async splitPosition(
    collateralToken: string,
    parentCollectionId: string,
    conditionId: string,
    partition: BigNumber[],
    amount: BigNumber
  ): Promise<TransactionReceipt | void> {
    const tx: TransactionResponse = await this.contract.splitPosition(
      collateralToken,
      parentCollectionId,
      conditionId,
      partition,
      amount
    )

    logger.log(`Transaction hash: ${tx.hash}`)

    return tx
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  async redeemPositions(
    collateralToken: string,
    parentCollectionId: string, // If doesn't exist, must be zero, ethers.constants.HashZero
    conditionId: string,
    indexSets: string[]
  ): Promise<TransactionReceipt | void> {
    const tx: TransactionResponse = await this.contract.redeemPositions(
      collateralToken,
      parentCollectionId,
      conditionId,
      indexSets
    )

    logger.log(`Transaction hash: ${tx.hash}`)

    return tx
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  async getCollectionId(
    parentCollectionId: string,
    conditionId: string,
    indexSet: BigNumber
  ): Promise<string> {
    return await this.contract.getCollectionId(parentCollectionId, conditionId, indexSet)
  }

  async mergePositions(
    collateralToken: string,
    parentCollectionId: string, // If doesn't exist, must be zero, ethers.constants.HashZero
    conditionId: string,
    partition: string[],
    amount: BigNumber
  ): Promise<TransactionReceipt | void> {
    const tx: TransactionResponse = await this.contract.mergePositions(
      collateralToken,
      parentCollectionId,
      conditionId,
      partition,
      amount
    )

    logger.log(`Transaction hash: ${tx.hash}`)

    return tx
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
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
    if (this.signer) {
      const owner = await this.signer.getAddress()
      const owners = Array.from(new Array(positionIds.length), () => owner)
      return this.contract.balanceOfBatch(owners, positionIds)
    } else {
      return [new BigNumber(0)]
    }
  }

  async reportPayouts(questionId: string, payouts: number[]): Promise<TransactionReceipt | void> {
    const tx: TransactionResponse = await this.contract.reportPayouts(questionId, payouts)
    logger.log(`Transaction hash: ${tx.hash}`)

    return tx
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  // Method  used to wrapp multiple erc1155
  async safeBatchTransferFrom(
    addressFrom: string,
    addressTo: string,
    positionIds: Array<string>,
    outcomeTokensToTransfer: Array<BigNumber>
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.safeTransferFrom(
      addressFrom,
      addressTo,
      positionIds,
      outcomeTokensToTransfer,
      ethers.constants.HashZero
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  // Method  used to wrapp some erc1155
  async safeTransferFrom(
    addressFrom: string,
    addressTo: string,
    positionId: string,
    outcomeTokensToTransfer: BigNumber
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.safeTransferFrom(
      addressFrom,
      addressTo,
      positionId,
      outcomeTokensToTransfer,
      '0x'
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  async getProfileSummary(): Promise<Token> {
    const [decimals, symbol] = await Promise.all([this.contract.decimals(), this.contract.symbol()])

    return {
      address: this.contract.address,
      decimals,
      symbol,
    }
  }

  async getConditionIdFromEvent(
    conditionId: string,
    networkConfig: NetworkConfig
  ): Promise<string> {
    const earliestBlockToCheck = networkConfig.getEarliestBlockToCheck()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = this.contract.filters.ConditionPreparation(conditionId)

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: earliestBlockToCheck,
      toBlock: 'latest',
    })

    if (logs.length === 0) {
      throw new Error(`No ConditionPreparation event found for conditionId '${conditionId}'`)
    }
    if (logs.length > 1) {
      logger.warn(
        `There should be only one ConditionPreparation event for conditionId '${conditionId}'`
      )
    }

    const iface = new ethers.utils.Interface(conditionalTokensAbi)
    const event = iface.parseLog(logs[0])

    return event.values.conditionId
  }

  async isConditionCreationEventTriggered(
    conditionId: string,
    networkConfig: NetworkConfig
  ): Promise<boolean> {
    try {
      const conditionIdFromEvent = await this.getConditionIdFromEvent(conditionId, networkConfig)
      return !!conditionIdFromEvent
    } catch {
      return false
    }
  }

  static encodePrepareCondition = (
    questionId: string,
    oracleAddress: string,
    outcomeSlotCount: number
  ): string => {
    const prepareConditionInterface = new Interface(conditionalTokensAbi)

    return prepareConditionInterface.functions.prepareCondition.encode([
      toChecksumAddress(oracleAddress),
      questionId,
      new BigNumber(outcomeSlotCount),
    ])
  }

  static encodeReportPayout = (questionId: string, payouts: number[]): string => {
    const reportPayoutInterface = new Interface(conditionalTokensAbi)
    return reportPayoutInterface.functions.reportPayouts.encode([questionId, payouts])
  }

  static encodeRedeemPositions = (
    collateralToken: string,
    parentCollectionId: string, // If doesn't exist, must be zero, ethers.constants.HashZero
    conditionId: string,
    indexSets: string[]
  ): string => {
    const redeemPositionsInterface = new Interface(conditionalTokensAbi)

    return redeemPositionsInterface.functions.redeemPositions.encode([
      collateralToken,
      parentCollectionId,
      conditionId,
      indexSets,
    ])
  }
}
