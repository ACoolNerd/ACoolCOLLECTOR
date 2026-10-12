'use client';

import React, { useState } from 'react';

export default function ROICalculator() {
    const [rawPrice, setRawPrice] = useState<number>(0);
    const [gradedPrice, setGradedPrice] = useState<number>(0);
    const [service, setService] = useState<string>('PSA');
    const [tier, setTier] = useState<string>('Regular');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const calculateROI = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/roi_calculator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    raw_price: rawPrice,
                    estimated_graded_price: gradedPrice,
                    grading_service: service,
                    grading_tier: tier
                })
            });
            const data = await response.json();
            setResult(data.breakdown);
        } catch (error) {
            console.error("Failed to manifest ROI", error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-[#15151e] p-6 rounded-xl border border-[#333] w-full max-w-md mx-auto text-white">
            <h2 className="text-xl font-bold text-[#d4a84b] mb-4 tracking-wider">ACool ROI Engine</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Raw Card Cost ($)</label>
                    <input
                        type="number"
                        className="w-full bg-[#080810] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#d4a84b]"
                        onChange={(e) => setRawPrice(Number(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Graded Value ($)</label>
                    <input
                        type="number"
                        className="w-full bg-[#080810] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#d4a84b]"
                        onChange={(e) => setGradedPrice(Number(e.target.value))}
                    />
                </div>

                <div className="flex gap-4">
                    <select className="flex-1 bg-[#080810] border border-gray-700 rounded p-2 outline-none" onChange={(e) => setService(e.target.value)}>
                        <option value="PSA">PSA</option>
                        <option value="BGS">BGS</option>
                        <option value="CGC">CGC</option>
                    </select>

                    <select className="flex-1 bg-[#080810] border border-gray-700 rounded p-2 outline-none" onChange={(e) => setTier(e.target.value)}>
                        <option value="Regular">Regular</option>
                        <option value="Express">Express</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>

                <button
                    onClick={calculateROI}
                    className="w-full bg-[#d4a84b] text-black font-bold py-3 rounded mt-4 hover:bg-[#b08b3a] transition-all"
                >
                    {loading ? 'Manifesting Data...' : 'CALCULATE EQUITY'}
                </button>
            </div>

            {result && (
                <div className="mt-6 p-4 border border-[#333] rounded bg-[#080810]">
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Total Investment:</span> <span>${result.total_investment}</span></div>
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Net Profit:</span> <span className="text-[#00ff88]">+${result.net_profit}</span></div>
                    <div className="flex justify-between mb-4"><span className="text-gray-400">ROI:</span> <span className="text-[#00ff88]">{result.roi_percentage}%</span></div>

                    <div className={`text-center py-2 font-bold rounded ${result.roi_percentage > 20 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {result.recommendation}
                    </div>
                </div>
            )}
        </div>
    );
}