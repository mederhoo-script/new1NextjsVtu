'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card, Select } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types/database';

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'airtime', label: 'Airtime' },
  { value: 'data', label: 'Data' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'cable', label: 'Cable TV' },
  { value: 'education', label: 'Education' },
  { value: 'wallet_fund', label: 'Wallet Funding' },
  { value: 'wallet_transfer', label: 'Wallet Transfer' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let query = supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((page - 1) * 10, page * 10 - 1);

        if (typeFilter) {
          query = query.eq('type', typeFilter);
        }
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        const { data, count } = await query;
        
        if (data) {
          setTransactions(data);
          setTotalPages(Math.ceil((count || 0) / 10));
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchTransactions();
  }, [typeFilter, statusFilter, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airtime': return '📱';
      case 'data': return '📶';
      case 'electricity': return '⚡';
      case 'cable': return '📺';
      case 'education': return '📚';
      case 'wallet_fund': return '💰';
      case 'wallet_transfer': return '💸';
      default: return '💳';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          
          <div className="flex gap-3">
            <Select
              id="typeFilter"
              options={transactionTypes}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              id="statusFilter"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <Card>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xl" title={tx.type}>
                            {getTypeIcon(tx.type)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {tx.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{page}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
