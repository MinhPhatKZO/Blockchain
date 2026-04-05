import Web3 from 'web3';

export const CHAINPAY_ABI = [
    {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'sendPayment',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'getBalance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
] as const;

export const CONTRACT_BALANCE_UPDATED_EVENT = 'chainpay:contract-balance-updated';

export const getChainPayContract = (web3: Web3, contractAddress: string) =>
    new web3.eth.Contract(CHAINPAY_ABI as any, contractAddress);
