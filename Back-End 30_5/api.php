<?php
header('Content-Type: application/json');
include('conexao.php');
include('funcoes.php'); // Para usar a função nomearStatus

// Segurança: Apenas professores logados podem acessar
if (!isset($_SESSION['id_professor'])) {
    http_response_code(403); // Proibido
    echo json_encode(['error' => 'Acesso não autorizado.']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'get_dashboard_data') {
    // 1. Contar solicitações pendentes (status 0)
    $result_pendentes = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 0");
    $total_solicitacoes_pendentes = $result_pendentes->fetch_assoc()['total'];

    // 2. Buscar a lista de empréstimos ativos e pendentes
    $query_dashboard = $mysqli->query("SELECT e.FK_IDaluno, a.nome, l.Titulo, l.IDlivro, e.data_emprestimo, e.data_devolucao, e.atrasado 
        FROM emprestimos e
        INNER JOIN livros l ON e.FK_IDlivro = l.IDlivro 
        INNER JOIN alunos a ON e.FK_IDaluno = a.IDaluno
        WHERE e.atrasado IN (0, 1, 4)
        ORDER BY e.data_emprestimo DESC");
    
    $emprestimos = [];
    if ($query_dashboard) {
        while($row = $query_dashboard->fetch_assoc()) {
            // Adiciona o status formatado ao array
            $row['status_nome'] = nomearStatus($row['atrasado']);
            $emprestimos[] = $row;
        }
    }

    // 3. Retorna os dados em formato JSON
    echo json_encode([
        'pending_count' => (int)$total_solicitacoes_pendentes,
        'loans' => $emprestimos
    ]);
} else {
    http_response_code(400); // Requisição inválida
    echo json_encode(['error' => 'Ação inválida.']);
}

$mysqli->close();