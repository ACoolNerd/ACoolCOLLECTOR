import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});

  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen> {
  bool _isScanning = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ZERO-GRAVITY SCANNER'),
      ),
      body: Stack(
        children: [
          // Mock Camera View
          Container(
            color: Colors.black,
            child: const Center(
              child: Icon(
                Icons.camera_alt,
                color: Color(0xFF3B82F6),
                size: 100,
              ),
            ),
          ),
          // Crosshairs Overlay
          Center(
            child: Container(
              width: 280,
              height: 400,
              decoration: BoxDecoration(
                border: Border.all(
                  color: const Color(0xFF3B82F6),
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          // UI Controls
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Column(
              children: [
                if (_isScanning)
                  const CircularProgressIndicator(color: Color(0xFFEF4444)),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    setState(() => _isScanning = true);
                    // Simulate API Call
                    Future.delayed(const Duration(seconds: 2), () {
                      if (mounted) {
                        setState(() => _isScanning = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Asset Sync Initialized')),
                        );
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      color: Color(0xFF3B82F6),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt, color: Colors.white, size: 30),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'SYNC DATA DNA',
                  style: TextStyle(color: Colors.white70, letterSpacing: 2),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
