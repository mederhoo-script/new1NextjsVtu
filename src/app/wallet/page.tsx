'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Alert } from '@/components/ui';
import { formatCurrency, getTransactionDescription } from '@/lib/utils';
import type { Transaction } from '@/types/database';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fund' | 'transfer' | 'history'>('fund');
  
  // Fund form state
  const [fundAmount, setFundAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [fundMessage, setFundMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Transfer form state
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        if (wallet) {
          setBalance(wallet.balance);
        }

        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .in('type', ['wallet_fund', 'wallet_transfer'])
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (txData) {
          setTransactions(txData);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundMessage(null);
    setFundLoading(true);

    try {
      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(fundAmount),
          paymentReference: `PAY-${Date.now()}` // Simulated payment reference
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFundMessage({ type: 'success', text: 'Wallet funded successfully!' });
        setBalance(data.balance);
        setFundAmount('');
        fetchWalletData();
      } else {
        setFundMessage({ type: 'error', text: data.error || 'Failed to fund wallet' });
      }
    } catch {
      setFundMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setFundLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMessage(null);
    setTransferLoading(true);

    try {
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(transferAmount),
          recipientEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTransferMessage({ type: 'success', text: 'Transfer successful!' });
        setBalance(data.balance);
        setTransferAmount('');
        setRecipientEmail('');
        fetchWalletData();
      } else {
        setTransferMessage({ type: 'error', text: data.error || 'Transfer failed' });
      }
    } catch {
      setTransferMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setTransferLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="text-center">
            <p className="text-indigo-100 text-sm">Current Balance</p>
            <p className="text-4xl font-bold mt-2">
              {loading ? '...' : formatCurrency(balance)}
            </p>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('fund')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'fund'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fund Wallet
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'transfer'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'fund' && (
          <Card title="Fund Your Wallet">
            {fundMessage && (
              <Alert
                type={fundMessage.type}
                message={fundMessage.text}
                onClose={() => setFundMessage(null)}
              />
            )}
            <form onSubmit={handleFundWallet} className="space-y-4 mt-4">
              <Input
                id="fundAmount"
                type="number"
                label="Amount (₦)"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="100"
                required
                placeholder="Enter amount to fund"
              />
              <p className="text-sm text-gray-500">
                Note: This is a demo. In production, this would integrate with a payment gateway like Paystack or Flutterwave.
              </p>
              <Button type="submit" isLoading={fundLoading} className="w-full">
                Fund Wallet
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'transfer' && (
          <Card title="Transfer to Another User">
            {transferMessage && (
              <Alert
                type={transferMessage.type}
                message={transferMessage.text}
                onClose={() => setTransferMessage(null)}
              />
            )}
            <form onSubmit={handleTransfer} className="space-y-4 mt-4">
              <Input
                id="recipientEmail"
                type="email"
                label="Recipient Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                placeholder="Enter recipient's email"
              />
              <Input
                id="transferAmount"
                type="number"
                label="Amount (₦)"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="100"
                required
                placeholder="Enter amount to transfer"
              />
              <Button type="submit" isLoading={transferLoading} className="w-full">
                Transfer
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card title="Wallet Transaction History">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No wallet transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{getTransactionDescription(tx)}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
