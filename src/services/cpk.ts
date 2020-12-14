import { ethers } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import { Moment } from 'moment'

import { txs } from '@gnosis.pm/safe-apps-sdk/dist/txs'
import { CONFIRMATIONS_TO_WAIT } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import CPK from 'contract-proxy-kit/lib/esm'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { ERC20Service } from 'services/erc20'
import { RealityService } from 'services/reality'
import { Wrapper1155Service } from 'services/wrapper1155'
import { getLogger } from 'util/logger'
import { improveErrorMessage, sleep } from 'util/tools'

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
  address: string
}

interface CPKMergePositionParams {
  CTService: ConditionalTokensService
  collateralToken: string
  parentCollectionId: string // If doesn't exist, must be zero, ethers.constants.HashZero
  conditionId: string
  partition: string[]
  amount: BigNumber
}

interface TransactionResult {
  hash?: string
  safeTxHash?: string
}

interface TxOptions {
  value?: BigNumber
  gas?: number
}

interface CPKWrapParams {
  CTService: ConditionalTokensService
  addressFrom: string
  addressTo: string
  positionId: string
  amount: BigNumber // outcomeTokensToTransfer
}

interface CPKUnwrapParams {
  CTService: ConditionalTokensService
  WrapperService: Wrapper1155Service
  addressFrom: string
  addressTo: string
  positionId: string
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

  getTransactionHash = async (txObject: TransactionResult): Promise<string> => {
    if (txObject.hash) {
      return txObject.hash
    }

    if (txObject.safeTxHash) {
      let transactionHash
      // poll for safe tx data
      while (!transactionHash) {
        const safeTransaction = await txs.getBySafeTxHash(txObject.safeTxHash)
        if (safeTransaction.transactionHash) {
          transactionHash = safeTransaction.transactionHash
        }
        await sleep()
      }
      return transactionHash
    }

    return ''
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

    const txObject = await this.cpk.execTransactions([prepareConditionTx])

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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

    const txObject = await this.cpk.execTransactions(transactions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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

    const txObject = await this.cpk.execTransactions(transactions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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

    const txObject = await this.cpk.execTransactions(transactions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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
      address,
      amount,
      collateralToken,
      conditionId,
      parentCollectionId,
      partition,
    } = splitPositionParams

    const transactions = []

    const txOptions: TxOptions = {}

    if (this.cpk.isSafeApp()) {
      txOptions.gas = 500000
    }

    const collateralService = new ERC20Service(this.provider, collateralToken, this.cpk.address)

    const hasCPKEnoughAlowance = await collateralService.hasEnoughAllowance(
      this.cpk.address,
      CTService.address,
      amount
    )

    logger.log(`Has CPK enough allowance to make the transaction?`, hasCPKEnoughAlowance)
    if (!hasCPKEnoughAlowance) {
      // Approve unlimited amount to be transferred to the Conditional Token
      transactions.push({
        to: collateralToken,
        data: ERC20Service.encodeApproveUnlimited(CTService.address),
      })
    }

    // If we are signed in as a safe we don't need to transfer
    if (!this.cpk.isSafeApp()) {
      // Transfer amount from user
      transactions.push({
        to: collateralToken,
        data: ERC20Service.encodeTransferFrom(address, this.cpk.address, amount),
      })
    }

    transactions.push({
      to: CTService.address,
      data: ConditionalTokensService.encodeSplitPositions(
        collateralToken,
        parentCollectionId,
        conditionId,
        partition,
        amount
      ),
    })

    const txObject = await this.cpk.execTransactions(transactions, txOptions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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

    const txHash = await this.cpk.execTransactions(transactions)

    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  wrapOrTransfer = async (wrapFromParams: CPKWrapParams): Promise<TransactionReceipt | void> => {
    const { CTService, addressFrom, addressTo, amount, positionId } = wrapFromParams

    const transactions = []

    const wasCPKApproved = await CTService.isApprovedForAll(addressFrom, addressTo)

    logger.log(`Was CPK approved for all to make the transaction?`, wasCPKApproved)
    if (!wasCPKApproved) {
      transactions.push({
        to: CTService.address,
        data: ConditionalTokensService.encodeSetApprovalForAll(addressTo),
      })
    }

    transactions.push({
      to: CTService.address,
      data: ConditionalTokensService.encodeSafeTransferFrom(
        addressFrom,
        addressTo,
        positionId,
        amount
      ),
    })

    const txObject = await this.cpk.execTransactions(transactions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
      .then((receipt: TransactionReceipt) => {
        logger.log(`Transaction was mined in block`, receipt)
        return receipt
      })
      .catch((error: Error) => {
        logger.error(error)
        throw improveErrorMessage(error)
      })
  }

  unwrap = async (unwrapFromParams: CPKUnwrapParams): Promise<TransactionReceipt | void> => {
    const {
      CTService,
      WrapperService,
      addressFrom,
      addressTo,
      amount,
      positionId,
    } = unwrapFromParams

    const transactions = []

    const wasCPKApproved = await CTService.isApprovedForAll(addressFrom, addressTo)

    logger.log(`Was CPK approved for all to make the transaction?`, wasCPKApproved)
    if (!wasCPKApproved) {
      transactions.push({
        to: CTService.address,
        data: ConditionalTokensService.encodeSetApprovalForAll(addressTo),
      })
    }

    transactions.push({
      to: WrapperService.address,
      data: Wrapper1155Service.encodeUnwrap(addressFrom, positionId, amount, addressTo),
    })

    const txObject = await this.cpk.execTransactions(transactions)

    const txHash = await this.getTransactionHash(txObject)
    logger.log(`Transaction hash: ${txHash}`)
    logger.log(`CPK address: ${this.cpk.address}`)
    return this.provider
      .waitForTransaction(txHash, CONFIRMATIONS_TO_WAIT)
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
