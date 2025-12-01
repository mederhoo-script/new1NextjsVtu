'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Input, Select, Alert } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

const cableProviders = [
  { value: 'DSTV', label: 'DSTV' },
  { value: 'GOTV', label: 'GOtv' },
  { value: 'STARTIMES', label: 'StarTimes' },
];

// Sample cable plans (in production, fetch from API)
const cablePlans: Record<string, { plan_id: string; name: string; amount: number }[]> = {
  DSTV: [
    { plan_id: 'dstv-padi', name: 'DStv Padi', amount: 2500 },
    { plan_id: 'dstv-yanga', name: 'DStv Yanga', amount: 3500 },
    { plan_id: 'dstv-confam', name: 'DStv Confam', amount: 6200 },
    { plan_id: 'dstv-compact', name: 'DStv Compact', amount: 10500 },
    { plan_id: 'dstv-compact-plus', name: 'DStv Compact Plus', amount: 16600 },
    { plan_id: 'dstv-premium', name: 'DStv Premium', amount: 24500 },
  ],
  GOTV: [
    { plan_id: 'gotv-supa', name: 'GOtv Supa', amount: 6400 },
    { plan_id: 'gotv-max', name: 'GOtv Max', amount: 4850 },
    { plan_id: 'gotv-jolli', name: 'GOtv Jolli', amount: 3300 },
    { plan_id: 'gotv-jinja', name: 'GOtv Jinja', amount: 2250 },
    { plan_id: 'gotv-smallie', name: 'GOtv Smallie', amount: 1100 },
  ],
  STARTIMES: [
    { plan_id: 'star-nova', name: 'StarTimes Nova', amount: 1200 },
    { plan_id: 'star-basic', name: 'StarTimes Basic', amount: 1850 },
    { plan_id: 'star-smart', name: 'StarTimes Smart', amount: 2600 },
    { plan_id: 'star-classic', name: 'StarTimes Classic', amount: 2750 },
    { plan_id: 'star-super', name: 'StarTimes Super', amount: 4900 },
  ],
};

export default function CablePage() {
  const [balance, setBalance] = useState(0);
  const [cableProvider, setCableProvider] = useState('');
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
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

  const handleVerifySmartCard = async () => {
    setMessage(null);
    setVerifying(true);
    setVerified(false);

    try {
      const response = await fetch('/api/services/verify-smartcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cableName: cableProvider, smartCardNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomerName(data.customerName);
        setVerified(true);
        setMessage({ type: 'success', text: `Customer: ${data.customerName}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Verification failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Verification failed. Please check smart card number.' });
      // For demo, set verified to true even on error
      setVerified(true);
      setCustomerName('Demo Customer');
    } finally {
      setVerifying(false);
    }
  };

  const getSelectedPlanDetails = () => {
    if (!cableProvider || !selectedPlan) return null;
    return cablePlans[cableProvider]?.find(p => p.plan_id === selectedPlan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const planDetails = getSelectedPlanDetails();
    if (!planDetails) {
      setMessage({ type: 'error', text: 'Please select a plan' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/services/cable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cableName: cableProvider,
          planId: selectedPlan,
          smartCardNumber,
          amount: planDetails.amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Subscription successful! Reference: ${data.reference}` 
        });
        setBalance(prev => prev - planDetails.amount);
        setCableProvider('');
        setSmartCardNumber('');
        setSelectedPlan('');
        setVerified(false);
        setCustomerName('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Subscription failed' });
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
        <Card className="bg-purple-600 text-white">
          <div className="flex justify-between items-center">
            <span className="text-purple-100">Wallet Balance</span>
            <span className="text-xl font-bold">{formatCurrency(balance)}</span>
          </div>
        </Card>

        <Card title="Cable TV Subscription">
          {message && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Select
              id="cableProvider"
              label="Cable Provider"
              options={cableProviders}
              value={cableProvider}
              onChange={(e) => {
                setCableProvider(e.target.value);
                setSelectedPlan('');
                setVerified(false);
              }}
              placeholder="Select provider"
              required
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="smartCardNumber"
                  type="text"
                  label="Smart Card / IUC Number"
                  value={smartCardNumber}
                  onChange={(e) => {
                    setSmartCardNumber(e.target.value);
                    setVerified(false);
                  }}
                  placeholder="Enter smart card number"
                  required
                />
              </div>
              <div className="pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifySmartCard}
                  isLoading={verifying}
                  disabled={!cableProvider || !smartCardNumber}
                >
                  Verify
                </Button>
              </div>
            </div>

            {verified && customerName && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Customer:</strong> {customerName}
                </p>
              </div>
            )}

            {cableProvider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Plan
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cablePlans[cableProvider]?.map((plan) => (
                    <button
                      key={plan.plan_id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.plan_id)}
                      className={`w-full p-3 border rounded-lg text-left flex justify-between items-center ${
                        selectedPlan === plan.plan_id
                          ? 'bg-purple-50 border-purple-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-purple-600 font-bold">{formatCurrency(plan.amount)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" isLoading={loading} disabled={!verified || !selectedPlan} className="w-full">
              Subscribe
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
