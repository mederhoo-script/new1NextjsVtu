'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Select, Alert } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

const examTypes = [
  { name: 'WAEC', price: 3450, description: 'WAEC Result Checker PIN' },
  { name: 'NECO', price: 1200, description: 'NECO Result Checker PIN' },
  { name: 'NABTEB', price: 1500, description: 'NABTEB Result Checker PIN' },
  { name: 'JAMB', price: 4700, description: 'JAMB Result Checker PIN' },
];

const quantities = [
  { value: '1', label: '1 PIN' },
  { value: '2', label: '2 PINs' },
  { value: '3', label: '3 PINs' },
  { value: '4', label: '4 PINs' },
  { value: '5', label: '5 PINs' },
];

export default function EducationPage() {
  const [balance, setBalance] = useState(0);
  const [selectedExam, setSelectedExam] = useState<typeof examTypes[0] | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [purchasedPins, setPurchasedPins] = useState<Array<{ pin: string; serial: string }>>([]);

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

  const totalAmount = selectedExam ? selectedExam.price * parseInt(quantity) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    
    setMessage(null);
    setLoading(true);
    setPurchasedPins([]);

    try {
      const response = await fetch('/api/services/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: selectedExam.name,
          quantity: parseInt(quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Successfully purchased ${quantity} ${selectedExam.name} PIN(s). Reference: ${data.reference}` 
        });
        setBalance(prev => prev - totalAmount);
        if (data.pins) {
          setPurchasedPins(data.pins);
        }
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
        <Card className="bg-red-600 text-white">
          <div className="flex justify-between items-center">
            <span className="text-red-100">Wallet Balance</span>
            <span className="text-xl font-bold">{formatCurrency(balance)}</span>
          </div>
        </Card>

        <Card title="Buy Education PINs">
          {message && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Exam Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {examTypes.map((exam) => (
                  <button
                    key={exam.name}
                    type="button"
                    onClick={() => setSelectedExam(exam)}
                    className={`p-4 border rounded-lg text-left ${
                      selectedExam?.name === exam.name
                        ? 'bg-red-50 border-red-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold text-lg">{exam.name}</p>
                    <p className="text-sm text-gray-500">{exam.description}</p>
                    <p className="text-red-600 font-semibold mt-1">{formatCurrency(exam.price)}</p>
                  </button>
                ))}
              </div>
            </div>

            <Select
              id="quantity"
              label="Quantity"
              options={quantities}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            {selectedExam && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}

            <Button type="submit" isLoading={loading} disabled={!selectedExam} className="w-full">
              Buy PIN{parseInt(quantity) > 1 ? 's' : ''}
            </Button>
          </form>

          {/* Display purchased PINs */}
          {purchasedPins.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Your PINs:</h4>
              <div className="space-y-2">
                {purchasedPins.map((pin, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <p className="text-sm"><strong>PIN:</strong> {pin.pin}</p>
                    <p className="text-sm"><strong>Serial:</strong> {pin.serial}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
