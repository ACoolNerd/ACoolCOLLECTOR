import 'package:flutter/material.dart';

/// BETH BETA: Production Mockup for the CCC Genesis Drop
/// Visualizes the Live Stream, Fiserv Escrow, and Oakley/Meta AR Integration.

class CCCGenesisProductionMockup extends StatelessWidget {
  const CCCGenesisProductionMockup({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A), // Deep cinematic black
      appBar: AppBar(
        title: const Text(
          'LIVE: The Vibe Vault',
          style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, letterSpacing: 2.0),
        ),
        backgroundColor: Colors.black,
        centerTitle: true,
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 16, top: 10, bottom: 10),
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text("142K VIEWERS", style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
      body: Column(
        children: [
          // 1. Live Video Player Placeholder (100T Compound x Insomniac)
          Container(
            width: double.infinity,
            height: 250,
            color: Colors.black,
            child: Stack(
              children: [
                Center(
                  child: Icon(Icons.play_circle_outline, size: 64, color: Colors.white.withOpacity(0.5)),
                ),
                Positioned(
                  bottom: 10,
                  left: 10,
                  child: Row(
                    children: [
                      _buildPartnerBadge("Lakers"),
                      const SizedBox(width: 8),
                      _buildPartnerBadge("100T"),
                      const SizedBox(width: 8),
                      _buildPartnerBadge("NiP"),
                    ],
                  ),
                )
              ],
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event Details
                  const Text("CCC Genesis: Swae Lee x Chauncey Gardner", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Location: 100 Thieves Content Compound", style: TextStyle(color: Colors.grey[400], fontSize: 14)),
                  const SizedBox(height: 24),

                  // 2. Fiserv Escrow Syndicate Status
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A1A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.amber.withOpacity(0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("Syndicate Vault Status", style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                            Text("FULLY FUNDED", style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        LinearProgressIndicator(
                          value: 1.0, // 100% Funded
                          backgroundColor: Colors.white10,
                          color: Colors.amber,
                          minHeight: 8,
                        ),
                        const SizedBox(height: 12),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("\$100,000 / \$100,000", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            Text("1,000 Members", style: TextStyle(color: Colors.white70)),
                          ],
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 3. Asset & Oakley AR Integration
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [Colors.blueAccent.withOpacity(0.1), Colors.purpleAccent.withOpacity(0.1)]),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.blueAccent.withOpacity(0.5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.view_in_ar, color: Colors.blueAccent),
                            SizedBox(width: 10),
                            Text("Meta x Oakley AR View", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text("A Pinnacle Asset has been pulled. The Digital Twin is generating on Google Cloud.", style: TextStyle(color: Colors.white70)),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blueAccent,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              // Trigger AR Session
                            },
                            child: const Text("Launch AR Viewer", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  
                  // 4. Vaulting Status
                  const Center(
                    child: Text("🔒 Asset is en route to RLR Management Vault", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPartnerBadge(String name) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(12)),
      child: Text(name, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
