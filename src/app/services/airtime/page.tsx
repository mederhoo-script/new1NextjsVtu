'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Alert } from '@/components/ui';
import { formatCurrency, sanitizePhoneNumber, getNetworkFromPhone } from '@/lib/utils';

const networks = [
  { value: 'MTN', label: 'MTN' },
  { value: 'GLO', label: 'GLO' },
  { value: 'AIRTEL', label: 'Airtel' },
  { value: '9MOBILE', label: '9Mobile' },
];

const quickAmounts = [50, 100, 200, 500, 1000, 2000];

export default function AirtimePage() {
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (wallet) setBalance(wallet.balance);
      }
    };
    fetchBalance();
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const detectedNetwork = getNetworkFromPhone(value);
    if (detectedNetwork && !network) {
      setNetwork(detectedNetwork);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/services/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          amount: parseFloat(amount),
          phoneNumber: sanitizePhoneNumber(phoneNumber),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully purchased ${formatCurrency(parseFloat(amount))} airtime for ${phoneNumber}. Reference: ${data.reference}` 
        });
        setBalance(prev => prev - parseFloat(amount));
        setAmount('');
        setPhoneNumber('');
        setNetwork('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Purchase failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="bg-blue-600 text-white">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Wallet Balance</span>
            <span className="text-xl font-bold">{formatCurrency(balance)}</span>
          </div>
        </Card>

        <Card title="Buy Airtime">
          {message && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Select
              id="network"
              label="Network"
              options={networks}
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="Select network"
              required
            />

            <Input
              id="phoneNumber"
              type="tel"
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="08012345678"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 px-3 border rounded-lg text-sm ${
                      amount === amt.toString()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="amount"
              type="number"
              label="Amount (₦)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="50"
              required
              placeholder="Enter amount"
            />

            <Button type="submit" isLoading={loading} className="w-full">
              Buy Airtime
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
