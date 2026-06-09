import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/ACoolAPI_Client.dart';

class StitchHandoffScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> assetDNA;

  const StitchHandoffScreen({super.key, required this.assetDNA});

  @override
  ConsumerState<StitchHandoffScreen> createState() => _StitchHandoffScreenState();
}

class _StitchHandoffScreenState extends ConsumerState<StitchHandoffScreen> {
  bool _isStitching = false;
  bool _isComplete = false;

  Future<void> _initializeStitch() async {
    setState(() => _isStitching = true);
    
    // Artificial delay to manifest the Antigravity animation
    await Future.delayed(const Duration(seconds: 3));
    
    try {
      await ACoolAPIClient().stitchToBusiness(widget.assetDNA);
      if (mounted) {
        setState(() {
          _isStitching = false;
          _isComplete = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isStitching = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stitch Bridge Error: DNA Fragmentation Detected')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('STITCH INTEROP BRIDGE'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (!_isStitching && !_isComplete) ...[
                const Icon(Icons.settings_input_component, color: Color(0xFF3B82F6), size: 100),
                const SizedBox(height: 30),
                Text(
                  'READY TO STITCH',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24),
                ),
                const SizedBox(height: 10),
                const Text(
                  'COLLECTOR DNA -> BUSINESS SCHEMA',
                  style: TextStyle(color: Colors.white54, letterSpacing: 1.5),
                ),
                const SizedBox(height: 50),
                ElevatedButton(
                  onPressed: _initializeStitch,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 60),
                  ),
                  child: const Text('ACTIVATE STITCH BRIDGE'),
                ),
              ],
              if (_isStitching) ...[
                const CircularProgressIndicator(color: Color(0xFF3B82F6)),
                const SizedBox(height: 30),
                const Text(
                  'MANIFESTING DATA DNA...',
                  style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text('Verifying ACoolSCHEMA_v1 Integrity', style: TextStyle(fontSize: 12, color: Colors.white38)),
              ],
              if (_isComplete) ...[
                const Icon(Icons.check_circle_outline, color: Colors.green, size: 100),
                const SizedBox(height: 30),
                const Text(
                  'STITCH SUCCESSFUL',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Asset manifested in ACoolBUSINESS portal.',
                  style: TextStyle(color: Colors.white54),
                ),
                const SizedBox(height: 50),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('RETURN TO PORTFOLIO'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
