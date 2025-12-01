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

// Sample data plans (in production, fetch from API)
const dataPlans: Record<string, { plan_id: string; plan: string; amount: number }[]> = {
  MTN: [
    { plan_id: 'mtn-500mb', plan: '500MB - 30 Days', amount: 200 },
    { plan_id: 'mtn-1gb', plan: '1GB - 30 Days', amount: 300 },
    { plan_id: 'mtn-2gb', plan: '2GB - 30 Days', amount: 500 },
    { plan_id: 'mtn-5gb', plan: '5GB - 30 Days', amount: 1000 },
    { plan_id: 'mtn-10gb', plan: '10GB - 30 Days', amount: 2000 },
  ],
  GLO: [
    { plan_id: 'glo-1gb', plan: '1GB - 30 Days', amount: 250 },
    { plan_id: 'glo-2gb', plan: '2GB - 30 Days', amount: 500 },
    { plan_id: 'glo-5gb', plan: '5GB - 30 Days', amount: 1000 },
    { plan_id: 'glo-10gb', plan: '10GB - 30 Days', amount: 2000 },
  ],
  AIRTEL: [
    { plan_id: 'airtel-1gb', plan: '1GB - 30 Days', amount: 300 },
    { plan_id: 'airtel-2gb', plan: '2GB - 30 Days', amount: 500 },
    { plan_id: 'airtel-5gb', plan: '5GB - 30 Days', amount: 1000 },
    { plan_id: 'airtel-10gb', plan: '10GB - 30 Days', amount: 2000 },
  ],
  '9MOBILE': [
    { plan_id: '9mobile-1gb', plan: '1GB - 30 Days', amount: 300 },
    { plan_id: '9mobile-2gb', plan: '2GB - 30 Days', amount: 500 },
    { plan_id: '9mobile-5gb', plan: '5GB - 30 Days', amount: 1000 },
  ],
};

export default function DataPage() {
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
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

  const getSelectedPlanDetails = () => {
    if (!network || !selectedPlan) return null;
    return dataPlans[network]?.find(p => p.plan_id === selectedPlan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const planDetails = getSelectedPlanDetails();
    if (!planDetails) {
      setMessage({ type: 'error', text: 'Please select a data plan' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/services/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          phoneNumber: sanitizePhoneNumber(phoneNumber),
          planId: selectedPlan,
          amount: planDetails.amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully purchased ${planDetails.plan} for ${phoneNumber}. Reference: ${data.reference}` 
        });
        setBalance(prev => prev - planDetails.amount);
        setPhoneNumber('');
        setNetwork('');
        setSelectedPlan('');
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
        <Card className="bg-green-600 text-white">
          <div className="flex justify-between items-center">
            <span className="text-green-100">Wallet Balance</span>
            <span className="text-xl font-bold">{formatCurrency(balance)}</span>
          </div>
        </Card>

        <Card title="Buy Data Bundle">
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
              onChange={(e) => {
                setNetwork(e.target.value);
                setSelectedPlan('');
              }}
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

            {network && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data Plan
                </label>
                <div className="space-y-2">
                  {dataPlans[network]?.map((plan) => (
                    <button
                      key={plan.plan_id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.plan_id)}
                      className={`w-full p-3 border rounded-lg text-left flex justify-between items-center ${
                        selectedPlan === plan.plan_id
                          ? 'bg-green-50 border-green-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{plan.plan}</span>
                      <span className="text-green-600 font-bold">{formatCurrency(plan.amount)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" isLoading={loading} disabled={!selectedPlan} className="w-full">
              Buy Data
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
