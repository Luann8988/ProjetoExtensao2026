<?php

echo "<pre>"; // Para formatar a saída e torná-la mais legível

include('conexao.php');

/**
 * Função para cadastrar um usuário (aluno ou professor) com senha segura.
 * Verifica se o usuário já existe pela matrícula antes de inserir.
 *
 * @param mysqli $mysqli Conexão com o banco de dados.
 * @param string $tipo 'aluno' ou 'professor'.
 * @param array $dados Array com os dados do usuário.
 */
function cadastrarUsuario($mysqli, $tipo, $dados) {
    $tabela = $tipo === 'aluno' ? 'alunos' : 'professores';
    $matricula = $dados['matricula'];

    // 1. Verifica se a matrícula já existe
    $stmt_check = $mysqli->prepare("SELECT matricula FROM $tabela WHERE matricula = ?");
    $stmt_check->bind_param("s", $matricula);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        echo "Usuário do tipo '$tipo' com matrícula '$matricula' já existe. Nenhuma ação foi tomada.\n";
        $stmt_check->close();
        return;
    }
    $stmt_check->close();

    // 2. Criptografa a senha
    $senha_hash = password_hash($dados['senha'], PASSWORD_BCRYPT);
    if (!$senha_hash) {
        die("Erro ao gerar hash da senha para o $tipo.\n");
    }

    // 3. Insere o novo usuário
    if ($tipo === 'aluno') {
        $stmt_insert = $mysqli->prepare("INSERT INTO alunos (matricula, nome, Senha, Email, data_nascimento) VALUES (?, ?, ?, ?, ?)");
        $stmt_insert->bind_param("sssss", $dados['matricula'], $dados['nome'], $senha_hash, $dados['email'], $dados['data_nascimento']);
    } else { // Professor
        $stmt_insert = $mysqli->prepare("INSERT INTO professores (matricula, Email, Senha, data_nascimento) VALUES (?, ?, ?, ?)");
        $stmt_insert->bind_param("ssss", $dados['matricula'], $dados['email'], $senha_hash, $dados['data_nascimento']);
    }

    if ($stmt_insert->execute()) {
        echo "Usuário do tipo '$tipo' com matrícula '$matricula' cadastrado com SUCESSO!\n";
    } else {
        echo "ERRO ao cadastrar usuário do tipo '$tipo' com matrícula '$matricula': " . $stmt_insert->error . "\n";
    }
    $stmt_insert->close();
}

// --- DADOS DOS USUÁRIOS DE TESTE ---

$aluno_teste = [
    'matricula'       => '98763867',
    'senha'           => '17082006',
    'nome'            => 'Aluno de Teste',
    'email'           => 'aluno.teste@escola.com',
    'data_nascimento' => '2006-08-17'
];

$professor_teste = [
    'matricula'       => '8837297',
    'senha'           => '18031992',
    'email'           => 'Professor de Teste', // O campo 'Email' está sendo usado como nome
    'data_nascimento' => '1992-03-18'
];

// --- EXECUTA OS CADASTROS ---

cadastrarUsuario($mysqli, 'aluno', $aluno_teste);
cadastrarUsuario($mysqli, 'professor', $professor_teste);

echo "\nScript finalizado.";
echo "</pre>";