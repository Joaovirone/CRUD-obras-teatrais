class UsuarioModel {
  final int? id;
  final String username;
  
  UsuarioModel({this.id, required this.username});

  // Transforma o JSON do Java em um objeto Dart
  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      id: json['id'],
      username: json['username'], // Certifique-se que o nome bate com o JSON do Java
    );
  }
}