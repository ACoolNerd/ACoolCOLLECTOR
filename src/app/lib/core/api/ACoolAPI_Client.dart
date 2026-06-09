import 'package:dio/dio.dart';

class ACoolAPIClient {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:3000/api/v1',
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
  ));

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      throw Exception('ACoolOMNI: Auth sequence failed');
    }
  }

  Future<List<dynamic>> getInventory() async {
    try {
      final response = await _dio.get('/inventory');
      return response.data['assets'];
    } catch (e) {
      throw Exception('ACoolOMNI: Data retrieval failed');
    }
  }

  Future<Map<String, dynamic>> lookupPrice(String id) async {
    try {
      final response = await _dio.get('/pricing/lookup/$id');
      return response.data;
    } catch (e) {
      throw Exception('ACoolOMNI: Pricing lookup failed');
    }
  }

  Future<Map<String, dynamic>> scanCard(String base64Image) async {
    try {
      final response = await _dio.post('/vision/scan', data: {
        'image': base64Image,
      });
      return response.data;
    } catch (e) {
      throw Exception('ACoolOMNI: Vision scan sequence interrupted');
    }
  }

  Future<Map<String, dynamic>> getMarketplaceListings() async {
    try {
      final response = await _dio.get('/marketplace/listings');
      return response.data;
    } catch (e) {
      throw Exception('ACoolOMNI: Marketplace sync failed');
    }
  }

  Future<Map<String, dynamic>> stitchToBusiness(Map<String, dynamic> assetDNA) async {
    try {
      final response = await _dio.post('/stitch/handoff', data: {
        'assetDNA': assetDNA,
        'destinationApp': 'ACoolBUSINESS',
        'targetRole': 'Vendor'
      });
      return response.data;
    } catch (e) {
      throw Exception('ACoolOMNI: Stitch bridge failed');
    }
  }
}
