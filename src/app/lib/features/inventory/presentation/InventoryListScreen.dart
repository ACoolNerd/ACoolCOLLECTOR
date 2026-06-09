import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/ACoolAPI_Client.dart';
import 'CardDetailScreen.dart';

final inventoryProvider = FutureProvider<List<dynamic>>((ref) async {
  return ACoolAPIClient().getInventory();
});

class InventoryListScreen extends ConsumerWidget {
  const InventoryListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inventory = ref.watch(inventoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ACoolINVENTORY_Master'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(inventoryProvider),
          ),
        ],
      ),
      body: inventory.when(
        data: (assets) => ListView.builder(
          itemCount: assets.length,
          itemBuilder: (context, index) {
            final asset = assets[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: ListTile(
                title: Text(asset['productName'] ?? 'Unknown Asset'),
                subtitle: Text(asset['consoleName'] ?? 'No category'),
                trailing: Text(
                  '\$${((asset['priceInPennies'] ?? 0) / 100).toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Color(0xFF3B82F6),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => CardDetailScreen(asset: asset),
                    ),
                  );
                },
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Data Stream Interrupted: $err')),
      ),
    );
  }
}
