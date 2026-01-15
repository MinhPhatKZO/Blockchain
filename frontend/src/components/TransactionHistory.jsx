import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const TransactionHistory = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get('/api/payment/history')
      setTransactions(response.data || [])
    } catch (err) {
      console.error('Transaction history error:', err)
      setError(err.response?.data?.message || 'Failed to fetch transaction history')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (wei) => {
    if (!wei) return '0'
    const eth = (parseFloat(wei) / 1e18).toFixed(6)
    return `${eth} ETH`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusBadge = (status) => {
    const styles = {
      SUCCESS: { background: '#d1fae5', color: '#065f46' },
      PENDING: { background: '#fef3c7', color: '#92400e' },
      FAILED: { background: '#fee2e2', color: '#991b1b' }
    }
    const style = styles[status] || styles.PENDING

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: '500',
        ...style
      }}>
        {status}
      </span>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Transaction History</h2>
        <button
          onClick={fetchTransactions}
          className="btn btn-secondary"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && transactions.length === 0 && (
        <div className="loading">Loading transactions...</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && transactions.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No transactions found
        </div>
      )}

      {transactions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>From</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>To</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {tx.fromAddress?.substring(0, 10)}...{tx.fromAddress?.substring(34)}
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {tx.toAddress?.substring(0, 10)}...{tx.toAddress?.substring(34)}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    {formatAmount(tx.amount)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(tx.status)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    {formatDate(tx.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {tx.txHash ? (
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#667eea', textDecoration: 'none' }}
                      >
                        {tx.txHash?.substring(0, 10)}...{tx.txHash?.substring(56)}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TransactionHistory