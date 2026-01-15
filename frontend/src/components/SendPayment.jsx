import React, { useState } from 'react'
import { useMetaMask } from '../contexts/MetaMaskContext'
import axios from 'axios'
import Web3 from 'web3'

const SendPayment = () => {
  const { account, web3, isConnected } = useMetaMask()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!isConnected || !account) {
      setMessage({ type: 'error', text: 'Please connect MetaMask first' })
      return
    }

    if (!toAddress || !amount) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    // Validate Ethereum address
    if (!web3?.utils.isAddress(toAddress)) {
      setMessage({ type: 'error', text: 'Invalid recipient address' })
      return
    }

    setLoading(true)

    try {
      // Convert amount from Ether to Wei
      const amountWei = web3.utils.toWei(amount, 'ether')

      // Send payment via backend API
      const response = await axios.post('/api/payment/send', {
        toAddress,
        amount: amountWei.toString()
      })

      setMessage({
        type: 'success',
        text: `Payment sent successfully! Transaction Hash: ${response.data.txHash}`
      })

      // Clear form
      setToAddress('')
      setAmount('')
    } catch (error) {
      console.error('Payment error:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to send payment'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Send P2P Payment</h2>

      {!isConnected && (
        <div className="alert alert-info">
          Please connect your MetaMask wallet first to send payments.
        </div>
      )}

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input
            type="text"
            className="form-input"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            required
            disabled={!isConnected || loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount (ETH)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            required
            disabled={!isConnected || loading}
          />
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            <strong>From:</strong> {account || 'Not connected'}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!isConnected || loading}
        >
          {loading ? 'Sending...' : 'Send Payment'}
        </button>
      </form>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <strong>Note:</strong> The transaction will be processed on the blockchain. 
        Please wait for confirmation. You can check the transaction status in the Transaction History tab.
      </div>
    </div>
  )
}

export default SendPayment