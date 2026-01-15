import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMetaMask } from '../contexts/MetaMaskContext'
import axios from 'axios'

const BalanceCheck = () => {
  const { user } = useAuth()
  const { account, isConnected, balance } = useMetaMask()
  const [contractBalance, setContractBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.walletAddress || account) {
      fetchContractBalance()
    }
  }, [user, account])

  const fetchContractBalance = async () => {
    const addressToCheck = account || user?.walletAddress
    if (!addressToCheck) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`/api/payment/balance/${addressToCheck}`)
      setContractBalance(response.data)
    } catch (err) {
      console.error('Balance fetch error:', err)
      setError(err.response?.data?.message || 'Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (wei) => {
    if (!wei) return '0'
    const eth = (parseFloat(wei) / 1e18).toFixed(6)
    return eth
  }

  return (
    <div className="card">
      <h2 className="card-title">Balance Check</h2>

      {loading && <div className="loading">Loading balance...</div>}

      {error && <div className="alert alert-error">{error}</div>}

      {!isConnected && !user?.walletAddress && (
        <div className="alert alert-info">
          Please connect MetaMask or set your wallet address in your profile.
        </div>
      )}

      {(account || user?.walletAddress) && (
        <div>
          {account && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>MetaMask Wallet</h3>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Address:</strong> {account}
              </div>
              <div style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                  ETH Balance
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
                  {parseFloat(balance || 0).toFixed(6)} ETH
                </div>
              </div>
            </div>
          )}

          {contractBalance && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>ChainPay Contract Balance</h3>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Address:</strong> {contractBalance.address}
              </div>
              <div style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                  Contract Balance (Wei)
                </div>
                <div style={{ fontSize: '1rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                  {contractBalance.balance}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                  Contract Balance (ETH)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
                  {formatBalance(contractBalance.balance)} ETH
                </div>
              </div>
            </div>
          )}

          <button
            onClick={fetchContractBalance}
            className="btn btn-secondary"
            style={{ marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Balance'}
          </button>
        </div>
      )}
    </div>
  )
}

export default BalanceCheck