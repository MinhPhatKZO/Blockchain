import React, { useEffect } from 'react'
import { useMetaMask } from '../contexts/MetaMaskContext'

const MetaMaskConnect = () => {
  const { account, balance, loading, error, connect, disconnect, isConnected, updateBalance } = useMetaMask()

  useEffect(() => {
    if (account) {
      updateBalance(account)
    }
  }, [account])

  const handleConnect = async () => {
    await connect()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <div className="card">
      <h2 className="card-title">MetaMask Connection</h2>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {!isConnected ? (
        <div>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Connect your MetaMask wallet to start using ChainPay
          </p>
          <button
            onClick={handleConnect}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      ) : (
        <div>
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            MetaMask Connected Successfully!
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Wallet Address:</strong>
            </div>
            <div style={{
              background: '#f3f4f6',
              padding: '0.75rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {account}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Balance (ETH):</strong>
            </div>
            <div style={{
              background: '#f3f4f6',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#10b981'
            }}>
              {parseFloat(balance).toFixed(4)} ETH
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="btn btn-danger"
          >
            Disconnect
          </button>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <strong>Note:</strong> Make sure you have MetaMask extension installed in your browser.
        If you're using a test network (like Ganache or Sepolia), make sure your MetaMask is connected to the correct network.
      </div>
    </div>
  )
}

export default MetaMaskConnect