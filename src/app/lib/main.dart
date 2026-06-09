import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/ACoolTHEME.dart';
import 'features/inventory/presentation/InventoryListScreen.dart';
import 'features/inventory/presentation/ScannerScreen.dart';
import 'features/inventory/presentation/MarketplaceScreen.dart';
import 'features/auth/presentation/LoginScreen.dart';
import 'features/profile/presentation/ProfileScreen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: ACoolCollectorApp(),
    ),
  );
}

class ACoolCollectorApp extends StatelessWidget {
  const ACoolCollectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ACoolCOLLECTOR',
      theme: ACoolTheme.zeroGravityTheme,
      home: const LoginScreen(), // Start with Identity Sync
      debugShowCheckedModeBanner: false,
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ACoolOMNI DASHBOARD'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const ProfileScreen()),
              );
            },
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Zero-Gravity Active',
                style: Theme.of(context).textTheme.displayLarge,
              ),
              const SizedBox(height: 10),
              const Text(
                'COLLECTOR DNA VERIFIED',
                style: TextStyle(color: Color(0xFF3B82F6), letterSpacing: 2, fontSize: 12),
              ),
              const SizedBox(height: 40),
              _buildNavButton(
                context, 
                'VIEW INVENTORY', 
                const InventoryListScreen(), 
                Icons.grid_view,
              ),
              const SizedBox(height: 15),
              _buildNavButton(
                context, 
                'MARKETPLACE', 
                const MarketplaceScreen(), 
                Icons.storefront,
                color: const Color(0xFFEF4444),
              ),
              const SizedBox(height: 15),
              _buildNavButton(
                context, 
                'INGEST NEW CARD', 
                const ScannerScreen(), 
                Icons.vignette_outlined,
              ),
              const SizedBox(height: 40),
              const Text(
                'SYSTEM STATUS: OPTIMIZED',
                style: TextStyle(color: Colors.white24, fontSize: 10),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavButton(BuildContext context, String label, Widget target, IconData icon, {Color? color}) {
    return ElevatedButton.icon(
      onPressed: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => target),
        );
      },
      icon: Icon(icon),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        minimumSize: const Size(280, 60),
        backgroundColor: color ?? const Color(0xFF1E1E1E),
        side: BorderSide(color: color ?? const Color(0xFF3B82F6), width: 1),
      ),
    );
  }
}
