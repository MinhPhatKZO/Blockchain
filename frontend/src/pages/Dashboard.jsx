import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMetaMask } from '../contexts/MetaMaskContext'
import MetaMaskConnect from '../components/MetaMaskConnect'
import SendPayment from '../components/SendPayment'
import TransactionHistory from '../components/TransactionHistory'
import BalanceCheck from '../components/BalanceCheck'
import '../App.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { isConnected, account } = useMetaMask()
  const [activeTab, setActiveTab] = useState('metamask')

  return (
    <div className="app-container">
      <header style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#667eea', margin: 0 }}>ChainPay</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>{user?.username}</span>
          {isConnected && (
            <span style={{
              background: '#10b981',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              {account?.substring(0, 6)}...{account?.substring(38)}
            </span>
          )}
          <button onClick={logout} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <button
            className={`btn ${activeTab === 'metamask' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('metamask')}
            style={{ flex: 1 }}
          >
            MetaMask
          </button>
          <button
            className={`btn ${activeTab === 'balance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('balance')}
            style={{ flex: 1 }}
          >
            Balance
          </button>
          <button
            className={`btn ${activeTab === 'send' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('send')}
            style={{ flex: 1 }}
          >
            Send Payment
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ flex: 1 }}
          >
            Transaction History
          </button>
        </div>

        {activeTab === 'metamask' && <MetaMaskConnect />}
        {activeTab === 'balance' && <BalanceCheck />}
        {activeTab === 'send' && <SendPayment />}
        {activeTab === 'history' && <TransactionHistory />}
      </div>
    </div>
  )
}

export default Dashboard