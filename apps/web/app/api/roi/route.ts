import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawPrice, targetValue, service, tier } = body;

    // Try calling the Python FastAPI server on localhost:8000
    try {
      const response = await fetch('http://localhost:8000/api/v1/roi_calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_price: rawPrice,
          estimated_graded_price: targetValue,
          grading_service: service,
          grading_tier: tier
        })
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.log("FastAPI backend unreachable, calculating ROI on Next.js side.");
    }

    // Fallback Local ROI Calculation
    const serviceFees: Record<string, Record<string, number>> = {
      PSA: { 'Value Bulk': 25, Regular: 75, Express: 150 },
      BGS: { 'Base (No Sub)': 22, 'Standard (With Sub)': 40, Express: 80, Premium: 250 },
      CGC: { Bulk: 15, Standard: 35, Express: 75 },
      TAG: { Basic: 22, Standard: 39, Express: 59 }
    };

    const fee = serviceFees[service]?.[tier] || 75;
    const totalCost = Number(rawPrice) + fee;
    const netProfit = Number(targetValue) - totalCost;
    const roiPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    return NextResponse.json({
      status: 'success',
      breakdown: {
        raw_cost: rawPrice,
        grading_fee: fee,
        total_investment: totalCost,
        estimated_graded_value: targetValue,
        net_profit: Math.round(netProfit * 100) / 100,
        roi_percentage: Math.round(roiPercentage * 100) / 100,
        recommendation: roiPercentage > 20 ? 'BUY & GRADE' : 'HOLD / PASS'
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
