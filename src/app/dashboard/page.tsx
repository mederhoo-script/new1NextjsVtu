'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { formatCurrency, getTransactionDescription } from '@/lib/utils';
import type { Transaction } from '@/types/database';

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch wallet balance
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();
          
          if (wallet) {
            setBalance(wallet.balance);
          }

          // Fetch recent transactions
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (txData) {
            setTransactions(txData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const services = [
    { name: 'Buy Airtime', href: '/services/airtime', icon: '📱', color: 'bg-blue-500' },
    { name: 'Buy Data', href: '/services/data', icon: '📶', color: 'bg-green-500' },
    { name: 'Electricity', href: '/services/electricity', icon: '⚡', color: 'bg-yellow-500' },
    { name: 'Cable TV', href: '/services/cable', icon: '📺', color: 'bg-purple-500' },
    { name: 'Education Pins', href: '/services/education', icon: '📚', color: 'bg-red-500' },
    { name: 'Fund Wallet', href: '/wallet', icon: '💳', color: 'bg-indigo-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Wallet Balance</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? '...' : formatCurrency(balance)}
              </p>
            </div>
            <Link
              href="/wallet"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50"
            >
              Fund Wallet
            </Link>
          </div>
        </Card>

        {/* Quick Services */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                  {service.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">{service.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{getTransactionDescription(tx)}</p>
                    <p className="text-sm text-gray-500">{tx.reference}</p>
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
              <Link
                href="/transactions"
                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium pt-2"
              >
                View All Transactions →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
