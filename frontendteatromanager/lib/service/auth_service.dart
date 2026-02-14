import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();
  
  // No Linux/Android Emulator, esse IP aponta para o seu localhost do Java
  final String baseUrl = "http://localhost:5002/api/v1/usuarios";

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dio.post(
        "$baseUrl/login",
        data: {
          "username": username,
          "password": password,
        },
      );

      if (response.statusCode == 200) {
        // Se seu Java retorna apenas a String do Token
        String token = response.data.toString();
        
        // Salva o token com segurança no celular
        await _storage.write(key: 'jwt_token', value: token);
        return true;
      }
    } catch (e) {
      print("Erro ao logar: $e");
    }
    return false;
  }
}