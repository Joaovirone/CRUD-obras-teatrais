import 'package:flutter/material.dart';
import 'service/auth_service.dart';

void main() {
  runApp(const MaterialApp(home: LoginPage()));
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  // Controles para pegar o texto dos inputs
  final _userController = TextEditingController();
  final _passController = TextEditingController();
  final _authService = AuthService();

  void _fazerLogin() async {
    bool sucesso = await _authService.login(
      _userController.text, 
      _passController.text
    );

    if (sucesso) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Login realizado com sucesso!"), backgroundColor: Colors.green),
      );
      // Aqui depois vamos navegar para a Home
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Erro ao logar. Verifique as credenciais."), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Teatro Manager - Login")),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            TextField(
              controller: _userController,
              decoration: const InputDecoration(labelText: "Usuário/E-mail"),
            ),
            TextField(
              controller: _passController,
              decoration: const InputDecoration(labelText: "Senha"),
              obscureText: true, // Esconde a senha
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fazerLogin,
              child: const Text("Entrar"),
            ),
          ],
        ),
      ),
    );
  }
}