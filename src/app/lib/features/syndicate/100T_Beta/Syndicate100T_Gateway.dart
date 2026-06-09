import 'package:flutter/material.dart';

/// 100 Thieves Edition: Cooperative Syndicate Escrow Gateway
/// Powered by Fiserv/Keith McPherson Protocol & RLR Vault Standards

class Syndicate100TBeta extends StatelessWidget {
  final double targetGoal = 50000.00; // Example: Vintage Pokémon Box
  final double currentFunding = 34500.00;
  final int totalSyndicateMembers = 142;

  const Syndicate100TBeta({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D), // 100T Aesthetic Black
      appBar: AppBar(
        title: const Text('CoOp 100: Syndicate Escrow', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Target: 1st Edition Base Set Booster Box",
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text("Vaulting Standard: RLR Management Certified", style: TextStyle(color: Colors.grey[400])),
            const SizedBox(height: 30),
            
            // Funding Progress Bar
            LinearProgressIndicator(
              value: currentFunding / targetGoal,
              backgroundColor: Colors.white12,
              color: Colors.redAccent, // 100T Red
              minHeight: 12,
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("\$${currentFunding.toStringAsFixed(0)} Escrowed", style: const TextStyle(color: Colors.white, fontSize: 18)),
                Text("Goal: \$${targetGoal.toStringAsFixed(0)}", style: const TextStyle(color: Colors.redAccent, fontSize: 18)),
              ],
            ),
            const SizedBox(height: 40),

            // Oakley / Meta Integration Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.blueAccent.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(8),
                color: Colors.blueAccent.withOpacity(0.1),
              ),
              child: const Row(
                children: [
                  Icon(Icons.visibility, color: Colors.blueAccent),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Oakley & Meta AR Enabled: View your fractional ownership in 3D during the 100T Live Break.",
                      style: TextStyle(color: Colors.white70),
                    ),
                  )
                ],
              ),
            ),

            const Spacer(),
            
            // Action Button
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  // Execute Fiserv Gateway API
                },
                child: const Text("Contribute to Syndicate", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
