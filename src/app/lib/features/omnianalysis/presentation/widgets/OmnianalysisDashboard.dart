import 'package:flutter/material.dart';

enum UserRole { collector, vendor, distributor }

class OmnianalysisDashboard extends StatelessWidget {
  final Map<String, dynamic> marketData;
  final UserRole userRole;

  const OmnianalysisDashboard({
    Key? key, 
    required this.marketData, 
    this.userRole = UserRole.collector
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: Text(_getAppBarTitle(), style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.analytics, color: Color(0xFF00FFCC)), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (userRole == UserRole.collector) ..._buildCollectorView(),
            if (userRole == UserRole.vendor) ..._buildVendorView(),
            if (userRole == UserRole.distributor) ..._buildDistributorView(),
          ],
        ),
      ),
    );
  }

  String _getAppBarTitle() {
    switch (userRole) {
      case UserRole.collector: return 'CoOp: Collector View';
      case UserRole.vendor: return 'Vendor Matrix';
      case UserRole.distributor: return 'Distributor Analytics';
    }
  }

  List<Widget> _buildCollectorView() {
    return [
      const Text("Market Arbitrage Detected", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const ArbitrageTicker(),
      const SizedBox(height: 32),
      const Text("Pinnacle Tier vs Gem Tier", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const GradingMatrixCard(
        cardName: "Michael Jordan 1986 Fleer #57",
        psa10Price: "\$250,000",
        bgsBlackLabelPrice: "\$1,000,000+",
        tag1000Price: "Calculating...",
      ),
    ];
  }

  List<Widget> _buildVendorView() {
    return [
      const Text("Live Inventory Turnover", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const InventoryListWidget(), // New Vendor Widget
      const SizedBox(height: 32),
      const Text("Competitor Pricing Shift (Fanatics Live)", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const PricingShiftWidget(), // New Vendor Widget
    ];
  }

  List<Widget> _buildDistributorView() {
    return [
      const Text("Regional Demand Heatmap", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const HeatmapWidget(), // New Distributor Widget
      const SizedBox(height: 32),
      const Text("Macro Market Health ($26B)", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
      const SizedBox(height: 16),
      const MarketHealthWidget(), // New Distributor Widget
    ];
  }
}

// Placeholder Widgets for Vendors and Distributors
class InventoryListWidget extends StatelessWidget { const InventoryListWidget({Key? key}) : super(key: key); @override Widget build(BuildContext context) { return Container(height: 100, color: Colors.white10, child: const Center(child: Text("Active Inventory Feed", style: TextStyle(color: Colors.white54)))); } }
class PricingShiftWidget extends StatelessWidget { const PricingShiftWidget({Key? key}) : super(key: key); @override Widget build(BuildContext context) { return Container(height: 100, color: Colors.white10, child: const Center(child: Text("Live Pricing Adjustments", style: TextStyle(color: Colors.white54)))); } }
class HeatmapWidget extends StatelessWidget { const HeatmapWidget({Key? key}) : super(key: key); @override Widget build(BuildContext context) { return Container(height: 200, color: Colors.white10, child: const Center(child: Text("USA Regional Demand Map", style: TextStyle(color: Colors.white54)))); } }
class MarketHealthWidget extends StatelessWidget { const MarketHealthWidget({Key? key}) : super(key: key); @override Widget build(BuildContext context) { return Container(height: 100, color: Colors.white10, child: const Center(child: Text("Market Index Performance", style: TextStyle(color: Colors.white54)))); } }

class ArbitrageTicker extends StatelessWidget {
  const ArbitrageTicker({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E1E1E), Color(0xFF2A2A2A)]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF00FFCC).withOpacity(0.3)),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text("Fanatics Live Break: 1986 Fleer Box", style: TextStyle(color: Colors.white70)),
          Text("Target: Under \$15k", style: TextStyle(color: Color(0xFF00FFCC), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class GradingMatrixCard extends StatelessWidget {
  final String cardName;
  final String psa10Price;
  final String bgsBlackLabelPrice;
  final String tag1000Price;

  const GradingMatrixCard({
    Key? key,
    required this.cardName,
    required this.psa10Price,
    required this.bgsBlackLabelPrice,
    required this.tag1000Price,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF1A1A1A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(cardName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
            const Divider(color: Colors.white24, height: 30),
            _buildTierRow("PSA 10 (Gem Mint)", psa10Price, Colors.redAccent),
            const SizedBox(height: 12),
            _buildTierRow("BGS Black Label (Pinnacle)", bgsBlackLabelPrice, Colors.amber),
            const SizedBox(height: 12),
            _buildTierRow("TAG 1000 (Pinnacle)", tag1000Price, Colors.blueAccent),
          ],
        ),
      ),
    );
  }

  Widget _buildTierRow(String label, String price, Color highlightColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: highlightColor, shape: BoxShape.circle)),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)),
          ],
        ),
        Text(price, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
