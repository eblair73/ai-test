'use client';

import { useState } from 'react';

interface CalculationResult {
  num1: number;
  num2: number;
  sum: number;
  timestamp: string;
}

export default function Calculator() {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num1: parseFloat(num1),
          num2: parseFloat(num2),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isValidInput = () => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    return !isNaN(n1) && !isNaN(n2) && isFinite(n1) && isFinite(n2);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Number Calculator
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="num1" className="block text-sm font-medium text-gray-700 mb-1">
            First Number
          </label>
          <input
            type="number"
            id="num1"
            step="any"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter first number"
            required
          />
        </div>

        <div>
          <label htmlFor="num2" className="block text-sm font-medium text-gray-700 mb-1">
            Second Number
          </label>
          <input
            type="number"
            id="num2"
            step="any"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter second number"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isValidInput() || loading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            !isValidInput() || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Calculating...' : 'Calculate Sum'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Result</h3>
          <div className="space-y-1 text-gray-700">
            <p>{result.num1} + {result.num2} = <strong className="text-green-600">{result.sum}</strong></p>
            <p className="text-sm text-gray-500">
              Calculated at: {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}