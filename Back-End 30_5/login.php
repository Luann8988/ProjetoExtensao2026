<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

// Importa a conexão com o banco de dados
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $senha = isset($_POST['senha']) ? trim($_POST['senha']) : '';

    if (empty($email) || empty($senha)) {
        echo json_encode(["ok" => false, "error" => "Por favor, preencha todos os campos."]);
        exit;
    }

    // 1. TENTAR LOGAR COMO PROFESSOR
    $sql_prof = "SELECT IDprofessor, nome, Senha, 'professor' AS tipo FROM professores WHERE Email = ?";
    $stmt = $mysqli->prepare($sql_prof);
    
    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Validação direta da senha (texto limpo conforme o banco atual)
            if ($senha === $user['Senha']) {
                $_SESSION['user_id'] = $user['IDprofessor'];
                $_SESSION['user_nome'] = $user['nome'];
                $_SESSION['user_tipo'] = $user['tipo'];

                echo json_encode([
                    "ok" => true,
                    "tipo" => $user['tipo'],
                    "nome" => $user['nome']
                ]);
                exit;
            }
        }
        $stmt->close();
    }

    // 2. TENTAR LOGAR COMO ALUNO
    $sql_aluno = "SELECT IDaluno, nome, Senha, 'aluno' AS tipo FROM alunos WHERE Email = ?";
    $stmt = $mysqli->prepare($sql_aluno);
    
    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            if ($senha === $user['Senha']) {
                $_SESSION['user_id'] = $user['IDaluno'];
                $_SESSION['user_nome'] = $user['nome'];
                $_SESSION['user_tipo'] = $user['tipo'];

                echo json_encode([
                    "ok" => true,
                    "tipo" => $user['tipo'],
                    "nome" => $user['nome']
                ]);
                exit;
            }
        }
        $stmt->close();
    }

    // Se falhar em ambas as buscas
    echo json_encode(["ok" => false, "error" => "E-mail ou senha incorretos."]);
    exit;
} else {
    echo json_encode(["ok" => false, "error" => "Método inválido."]);
    exit;
}