import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('IDENTITY HUB'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 40),
            const Center(
              child: CircleAvatar(
                radius: 60,
                backgroundColor: Color(0xFF3B82F6),
                child: Icon(Icons.person, size: 60, color: Colors.white),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'ACoolNERD',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const Text(
              'iam@acoolcollector.com',
              style: TextStyle(color: Colors.white54),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFEF4444)),
              ),
              child: const Text(
                'ACTIVE COLLECTOR',
                style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
            const SizedBox(height: 40),
            _buildStatSection('ECOSYSTEM STATS', [
              _buildProfileStat('ASSETS', '3,886'),
              _buildProfileStat('VALUE', '\$2.4M'),
              _buildProfileStat('STITCHES', '142'),
            ]),
            const SizedBox(height: 20),
            _buildStatSection('RASCI ALIGNMENT', [
              _buildProfileStat('ROLE', 'Collector'),
              _buildProfileStat('ACCESS', 'Full'),
              _buildProfileStat('DNA', 'Verified'),
            ]),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  backgroundColor: Colors.white10,
                ),
                child: const Text('TERMINATE SESSION'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatSection(String title, List<Widget> stats) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold, letterSpacing: 1.5),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: stats,
          ),
          const Divider(height: 40, color: Colors.white10),
        ],
      ),
    );
  }

  Widget _buildProfileStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38)),
      ],
    );
  }
}
