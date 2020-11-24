import { ethers } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import { Moment } from 'moment'

import { CONFIRMATIONS_TO_WAIT } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import CPK from 'contract-proxy-kit/lib/esm'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { ERC20Service } from 'services/erc20'
import { RealityService } from 'services/reality'
import { getLogger } from 'util/logger'
import { improveErrorMessage } from 'util/tools'

const logger = getLogger('Services::CPKService')

interface CPKPrepareCustomConditionParams {
  questionId: string
  oracleAddress: string
  outcomesSlotCount: number
  CTService: ConditionalTokensService
}

interface CPKPrepareOmenConditionParams {
  oracleAddress: string
  CTService: ConditionalTokensService
  RtyService: RealityService
  arbitrator: string
  category: string
  outcomes: string[]
  question: string
  questionId: string
  openingDateMoment: Moment
  networkConfig: NetworkConfig
}

interface CPKReportPayoutParams {
  CTService: ConditionalTokensService
  questionId: string
  payouts: number[]
}

interface CPKRedeemPositionParams {
  CTService: ConditionalTokensService
  collateralToken: string
  parentCollectionId: string // If doesn't exist, must be zero, ethers.constants.HashZero
  conditionId: string
  indexSets: string[]
}

interface CPKSplitPositionParams {
  CTService: ConditionalTokensService
  collateralToken: string
  parentCollectionId: string
  conditionId: string
  partition: BigNumber[]
  amount: BigNumber
  account: string
}

interface CPKMergePositionParams {
  CTService: ConditionalTokensService
  collateralToken: string
  parentCollectionId: string // If doesn't exist, must be zero, ethers.constants.HashZero
  conditionId: string
  partition: string[]
  amount: BigNumber
}

class CPKService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cpk: any
  provider: ethers.providers.Provider

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(cpk: any, provider: ethers.providers.Provider) {
    this.cpk = cpk
    this.provider = provider
  }

  static async create(
    networkConfig: NetworkConfig,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer
  ) {
    const cpkAddresses = networkConfig.getCPKAddresses()
    const networks = cpkAddresses
      ? {
          [networkConfig.networkId]: cpkAddresses,
        }
      : {}
    const cpk = await CPK.create({
      ethLibAdapter: new EthersAdapter({
        ethers,
        signer,
      }),
      networks,
    })
    return new CPKService(cpk, provider)
  }

  prepareCustomCondition = async (
    prepareCustomConditionParams: CPKPrepareCustomConditionParams
  ): Promise<TransactionReceipt | void> => {
    const { CTService, oracleAddress, outcomesSlotCount, questionId } = prepareCustomConditionParams
    const prepareConditionTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodePrepareCondition(
        questionId,
        oracleAddress,
        outcomesSlotCount
      ),
    }

    const { hash, transactionResponse } = await this.cpk.execTransactions([prepareConditionTx])
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  prepareOmenCondition = async (
    prepareOmenConditionParams: CPKPrepareOmenConditionParams
  ): Promise<TransactionReceipt | void> => {
    const {
      CTService,
      RtyService,
      arbitrator,
      category,
      networkConfig,
      openingDateMoment,
      oracleAddress,
      outcomes,
      question,
      questionId,
    } = prepareOmenConditionParams

    const realitioAddress = RtyService.address

    // Step 1: Create question in realitio
    const createQuestionTx = {
      to: realitioAddress,
      data: RealityService.encodeAskQuestion(
        question,
        outcomes,
        category,
        arbitrator,
        openingDateMoment,
        networkConfig
      ),
    }

    // Step 2: Prepare condition
    const prepareConditionTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodePrepareCondition(
        questionId,
        oracleAddress,
        outcomes.length
      ),
    }

    const transactions = [createQuestionTx, prepareConditionTx]

    const { hash, transactionResponse } = await this.cpk.execTransactions(transactions)
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  reportPayout = async (
    reportPayoutParams: CPKReportPayoutParams
  ): Promise<TransactionReceipt | void> => {
    const { CTService, payouts, questionId } = reportPayoutParams
    const reportPayoutTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodeReportPayout(questionId, payouts),
    }

    const transactions = [reportPayoutTx]

    const { hash, transactionResponse } = await this.cpk.execTransactions(transactions)
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  redeemPosition = async (
    redeemPositionParams: CPKRedeemPositionParams
  ): Promise<TransactionReceipt | void> => {
    const {
      CTService,
      collateralToken,
      conditionId,
      indexSets,
      parentCollectionId,
    } = redeemPositionParams

    const redeemPositionTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodeRedeemPositions(
        collateralToken,
        parentCollectionId,
        conditionId,
        indexSets
      ),
    }

    const transactions = [redeemPositionTx]

    const { hash, transactionResponse } = await this.cpk.execTransactions(transactions)
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  splitPosition = async (
    splitPositionParams: CPKSplitPositionParams
  ): Promise<TransactionReceipt | void> => {
    const {
      CTService,
      account,
      amount,
      collateralToken,
      conditionId,
      parentCollectionId,
      partition,
    } = splitPositionParams

    const transferFromTx = {
      to: collateralToken,
      data: ERC20Service.encodeTransferFrom(account, this.cpk.address, amount),
    }

    const splitPositionTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodeSplitPositions(
        collateralToken,
        parentCollectionId,
        conditionId,
        partition,
        amount
      ),
    }

    const transactions = [transferFromTx, splitPositionTx]

    const { hash, transactionResponse } = await this.cpk.execTransactions(transactions)
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  mergePositions = async (
    mergePositionParams: CPKMergePositionParams
  ): Promise<TransactionReceipt | void> => {
    const {
      CTService,
      amount,
      collateralToken,
      conditionId,
      parentCollectionId,
      partition,
    } = mergePositionParams

    const mergePositionsTx = {
      to: CTService.address,
      data: ConditionalTokensService.encodeMergePositions(
        collateralToken,
        parentCollectionId,
        conditionId,
        partition,
        amount
      ),
    }

    const transactions = [mergePositionsTx]

    const { hash, transactionResponse } = await this.cpk.execTransactions(transactions)
    logger.log(`Transaction hash: ${hash}`)
    logger.log(`CPK address: ${this.cpk.address}`)

    return transactionResponse
      .wait(CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  get address(): string {
    logger.log(`My cpk address is ${this.cpk.address}`)
    return this.cpk.address
  }
}

export { CPKService }
