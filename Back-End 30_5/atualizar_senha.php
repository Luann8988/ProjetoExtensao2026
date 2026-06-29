<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

date_default_timezone_set('America/Sao_Paulo');
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = isset($_POST['token']) ? trim($_POST['token']) : '';
    $nova_senha = isset($_POST['nova_senha']) ? trim($_POST['nova_senha']) : '';

    if (empty($token) || empty($nova_senha)) {
        echo json_encode(["ok" => false, "error" => "Dados incompletos para a redefinição."]);
        exit;
    }

    // 1. Verificar se o token é válido, não foi usado e não expirou
    $agora = date('Y-m-d H:i:s');
    $sql = "SELECT email, expira_em FROM recuperacao_senhas WHERE token = ? AND utilizado = 0 LIMIT 1";
    $stmt = $mysqli->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(["ok" => false, "error" => "Erro interno no servidor."]);
        exit;
    }

    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["ok" => false, "error" => "Token inválido ou já utilizado."]);
        exit;
    }

    $recuperacao = $result->fetch_assoc();
    $stmt->close();

    // Validação do prazo [Link tem que ter prazo]
    if (strtotime($agora) > strtotime($recuperacao['expira_em'])) {
        echo json_encode(["ok" => false, "error" => "Este link de recuperação expirou! Faça uma nova solicitação."]);
        exit;
    }

    $email = $recuperacao['email'];
    $atualizado = false;

    // 2. Tentar atualizar primeiro na tabela de professores
    $sql_prof = "UPDATE professores SET Senha = ? WHERE Email = ?";
    $stmt_prof = $mysqli->prepare($sql_prof);
    if ($stmt_prof) {
        $stmt_prof->bind_param("ss", $nova_senha, $email);
        $stmt_prof->execute();
        if ($stmt_prof->affected_rows > 0) {
            $atualizado = true;
        }
        $stmt_prof->close();
    }

    // 3. Se não mudou nada em professores, tenta na de alunos
    if (!$atualizado) {
        $sql_aluno = "UPDATE alunos SET Senha = ? WHERE Email = ?";
        $stmt_aluno = $mysqli->prepare($sql_aluno);
        if ($stmt_aluno) {
            $stmt_aluno->bind_param("ss", $nova_senha, $email);
            $stmt_aluno->execute();
            if ($stmt_aluno->affected_rows > 0) {
                $atualizado = true;
            }
            $stmt_aluno->close();
        }
    }

    // 4. Se a senha foi atualizada, inutiliza o token para segurança
    if ($atualizado) {
        $sql_marca = "UPDATE recuperacao_senhas SET utilizado = 1 WHERE token = ?";
        $stmt_marca = $mysqli->prepare($sql_marca);
        if ($stmt_marca) {
            $stmt_marca->bind_param("s", $token);
            $stmt_marca->execute();
            $stmt_marca->close();
        }

        echo json_encode(["ok" => true, "message" => "Senha alterada com sucesso!"]);
    } else {
        echo json_encode(["ok" => false, "error" => "Não foi possível atualizar a senha. Verifique se a nova senha é diferente da atual."]);
    }
    exit;
}