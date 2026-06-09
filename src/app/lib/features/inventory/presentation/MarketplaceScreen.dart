import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/ACoolAPI_Client.dart';

final marketplaceProvider = FutureProvider<List<dynamic>>((ref) async {
  final data = await ACoolAPIClient().getMarketplaceListings();
  return data['listings'];
});

class MarketplaceScreen extends ConsumerWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listings = ref.watch(marketplaceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ACoolMARKETPLACE'),
      ),
      body: listings.when(
        data: (items) => GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.75,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return Card(
              clipBehavior: BorderAlpha.hardEdge,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Container(
                      color: Colors.black26,
                      child: const Center(
                        child: Icon(Icons.style, color: Color(0xFF3B82F6), size: 40),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['productName'],
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          item['seller'],
                          style: const TextStyle(fontSize: 12, color: Colors.white60),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '\$${(item['price'] / 100).toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Color(0xFFEF4444),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Marketplace Unavailable: $err')),
      ),
    );
  }
}
