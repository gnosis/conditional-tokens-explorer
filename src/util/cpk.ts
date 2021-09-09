import { ethers } from 'ethers'
import { Web3Provider } from 'ethers/providers'

import { NetworkConfig } from 'config/networkConfig'
import CPK, { OperationType } from 'contract-proxy-kit/lib/esm'
import multiSendAbi from 'contract-proxy-kit/lib/esm/abis/MultiSendAbi.json'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import { getHexDataLength, joinHexData } from 'contract-proxy-kit/lib/esm/utils/hexData'

type Address = string

interface StandardTransaction {
  operation: OperationType
  to: Address
  value: string
  data: string
}

interface Transaction {
  operation?: OperationType
  to: Address
  value?: string
  data?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NumberLike = number | string | bigint | Record<string, any>

interface GasLimitOptions {
  gas?: NumberLike
  gasLimit?: NumberLike
}

interface BaseTxOptions extends GasLimitOptions {
  gasPrice?: NumberLike
}

interface ExecOptions extends BaseTxOptions {
  nonce?: NumberLike
}

interface TransactionResult {
  hash?: string
  safeTxHash?: string
}

interface TxCallback {
  confirm: (txResult: TransactionResult) => void
  reject: (error: Error) => void
}

type RequestId = number | string

const defaultTxOperation = OperationType.Call
const defaultTxValue = '0'
const defaultTxData = '0x'

const standardizeTransaction = (tx: Transaction): StandardTransaction => {
  return {
    operation: tx.operation ? tx.operation : defaultTxOperation,
    to: tx.to,
    value: tx.value ? tx.value.toString() : defaultTxValue,
    data: tx.data ? tx.data : defaultTxData,
  }
}

class CPKEnhanced extends CPK {
  txCallbacks = new Map<RequestId, TxCallback>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(opts?: any) {
    super(opts)

    window.addEventListener('message', ({ data, origin }) => {
      if (origin === window.origin) {
        return
      }

      const { data: messagePayload, messageId, requestId } = data

      const TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED'
      const TRANSACTION_REJECTED = 'TRANSACTION_REJECTED'

      if (messageId === TRANSACTION_CONFIRMED) {
        const callback = this.txCallbacks.get(requestId)
        if (callback) {
          this.txCallbacks.delete(requestId)
          callback.confirm({ safeTxHash: messagePayload.safeTxHash })
        }
      }
      if (messageId === TRANSACTION_REJECTED) {
        const callback = this.txCallbacks.get(requestId)
        if (callback) {
          this.txCallbacks.delete(requestId)
          callback.reject(new Error('Transaction rejected'))
        }
      }
    })
  }

  sendTransactions(
    transactions: StandardTransaction[],
    options?: ExecOptions
  ): Promise<TransactionResult> {
    const requestId = Math.trunc(Date.now())
    return new Promise<TransactionResult>((confirm, reject) => {
      const SEND_TRANSACTIONS_V2 = 'SEND_TRANSACTIONS_V2'
      const txs = transactions.map(standardizeTransaction)
      const params = { safeTxGas: options?.gas }
      const data = {
        txs,
        params,
      }
      const message = {
        messageId: SEND_TRANSACTIONS_V2,
        requestId,
        data,
      }

      this.txCallbacks.set(requestId, { confirm, reject })

      window.parent.postMessage(message, '*')
    })
  }

  async execTransactions(
    transactions: Transaction[],
    options?: ExecOptions
  ): Promise<TransactionResult> {
    if (this.isSafeApp() && transactions.length >= 1) {
      return this.sendTransactions(transactions.map(standardizeTransaction), options)
    }

    return super.execTransactions(transactions, options)
  }

  encodeMultiSendCallData(transactions: Transaction[]): string {
    if (!this.ethLibAdapter) {
      throw new Error('CPK ethLibAdapter uninitialized')
    }

    const multiSend = this.multiSend || this.ethLibAdapter.getContract(multiSendAbi)
    const standardizedTxs = transactions.map(standardizeTransaction)
    const ethLibAdapter = this.ethLibAdapter
    return multiSend.encode('multiSend', [
      joinHexData(
        standardizedTxs.map((tx) =>
          ethLibAdapter.abiEncodePacked(
            { type: 'uint8', value: tx.operation },
            { type: 'address', value: tx.to },
            { type: 'uint256', value: tx.value },
            { type: 'uint256', value: getHexDataLength(tx.data) },
            { type: 'bytes', value: tx.data }
          )
        )
      ),
    ])
  }
}

export const createCPK = async (provider: Web3Provider, networkConfig: NetworkConfig) => {
  const signer = provider.getSigner()
  const network = await provider.getNetwork()
  const cpkAddresses = networkConfig.getCPKAddresses()
  const networks = cpkAddresses
    ? {
        [network.chainId]: cpkAddresses,
      }
    : {}
  const cpk = new CPKEnhanced({ ethLibAdapter: new EthersAdapter({ ethers, signer }), networks })
  await cpk.init()
  return cpk
}

export default CPKEnhanced
