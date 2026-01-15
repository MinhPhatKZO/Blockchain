import React, { createContext, useState, useContext, useEffect } from 'react'
import { detectEthereumProvider } from '@metamask/detect-provider'
import Web3 from 'web3'

const MetaMaskContext = createContext()

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext)
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider')
  }
  return context
}

export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [provider, setProvider] = useState(null)
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    initMetaMask()
  }, [])

  const initMetaMask = async () => {
    try {
      const provider = await detectEthereumProvider()
      if (provider) {
        setProvider(provider)
        const web3Instance = new Web3(provider)
        setWeb3(web3Instance)
        
        // Check if already connected
        const accounts = await provider.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await updateBalance(accounts[0], web3Instance)
        }

        // Listen for account changes
        provider.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0])
            updateBalance(accounts[0], web3Instance)
          } else {
            setAccount(null)
            setBalance('0')
          }
        })

        // Listen for chain changes
        provider.on('chainChanged', () => {
          window.location.reload()
        })
      } else {
        setError('MetaMask not detected. Please install MetaMask extension.')
      }
    } catch (error) {
      console.error('Error initializing MetaMask:', error)
      setError('Failed to initialize MetaMask')
    }
  }

  const connect = async () => {
    if (!provider) {
      setError('MetaMask not detected')
      return { success: false, message: 'MetaMask not detected' }
    }

    setLoading(true)
    setError(null)

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        await updateBalance(accounts[0], web3)
        setLoading(false)
        return { success: true, account: accounts[0] }
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      setError(error.message || 'Failed to connect to MetaMask')
      setLoading(false)
      return { success: false, message: error.message || 'Failed to connect' }
    }
  }

  const disconnect = () => {
    setAccount(null)
    setBalance('0')
  }

  const updateBalance = async (address, web3Instance = web3) => {
    if (!address || !web3Instance) return

    try {
      const balanceWei = await web3Instance.eth.getBalance(address)
      const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether')
      setBalance(balanceEth)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const getContractBalance = async (contractAddress, contractABI) => {
    if (!web3 || !account) {
      throw new Error('Web3 or account not initialized')
    }

    try {
      const contract = new web3.eth.Contract(contractABI, contractAddress)
      const balance = await contract.methods.getBalance(account).call()
      return web3.utils.fromWei(balance, 'ether')
    } catch (error) {
      console.error('Error getting contract balance:', error)
      throw error
    }
  }

  const value = {
    account,
    web3,
    provider,
    balance,
    loading,
    error,
    connect,
    disconnect,
    updateBalance,
    getContractBalance,
    isConnected: !!account
  }

  return <MetaMaskContext.Provider value={value}>{children}</MetaMaskContext.Provider>
}