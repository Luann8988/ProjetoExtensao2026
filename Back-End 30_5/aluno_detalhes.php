<?php
include('funcoes.php');

// Segurança: Apenas professores logados podem acessar
if (!isset($_SESSION['id_professor'])) {
    header("Location: Professor.php");
    exit;
}

// 1. Obter ID do aluno da URL e validar
$aluno_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$aluno_id) {
    die("ID de aluno inválido.");
}

// 2. Buscar dados do aluno
$stmt_aluno = $mysqli->prepare("SELECT * FROM alunos WHERE IDaluno = ?");
$stmt_aluno->bind_param("i", $aluno_id);
$stmt_aluno->execute();
$result_aluno = $stmt_aluno->get_result();
$aluno = $result_aluno->fetch_assoc();

if (!$aluno) {
    die("Aluno não encontrado.");
}

// 3. Buscar empréstimos ativos (status 0, 1, 4)
$stmt_ativos = $mysqli->prepare(
    "SELECT l.Titulo, e.data_emprestimo, e.data_devolucao, e.atrasado
     FROM emprestimos e
     JOIN livros l ON e.FK_IDlivro = l.IDlivro
     WHERE e.FK_IDaluno = ? AND e.atrasado IN (0, 1, 4)
     ORDER BY e.data_emprestimo DESC"
);
$stmt_ativos->bind_param("i", $aluno_id);
$stmt_ativos->execute();
$query_ativos = $stmt_ativos->get_result();

// 4. Buscar histórico de empréstimos (status 2, 3)
$stmt_historico = $mysqli->prepare(
    "SELECT l.Titulo, e.data_emprestimo, e.data_devolucao, e.atrasado
     FROM emprestimos e
     JOIN livros l ON e.FK_IDlivro = l.IDlivro
     WHERE e.FK_IDaluno = ? AND e.atrasado IN (2, 3)
     ORDER BY e.data_devolucao DESC"
);
$stmt_historico->bind_param("i", $aluno_id);
$stmt_historico->execute();
$query_historico = $stmt_historico->get_result();

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Aluno - <?= htmlspecialchars($aluno['nome']) ?></title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="login-body">
    <div id="professorContainer">
        <header>
            <div class="header-left">
                <img src="Imagens/imagem3.png" class="logo">
                <div class="titulo-escola">Escola Estadual <br><strong>Professor Gonçalves Couto</strong></div>
            </div>
            <a href="Professor.php" class="btn-logout" style="text-decoration: none;">Voltar ao Painel</a>
        </header>
        <main style="padding: 20px; max-width: 1200px; margin: auto;">
            <section class="dashboard-content" style="width: 100%;">
                
                <!-- Informações do Aluno -->
                <div class="data-section" style="margin-bottom: 20px;">
                    <div class="data-header" style="display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-user-graduate" style="font-size: 24px;"></i>
                        <h2 style="margin: 0; font-size: 22px; color: #FFC20E;"><?= htmlspecialchars($aluno['nome']) ?></h2>
                    </div>
                    <div style="padding: 15px; font-size: 14px;">
                        <p style="margin: 5px 0;"><strong>ID do Aluno:</strong> <?= htmlspecialchars($aluno['IDaluno']) ?></p>
                        <p style="margin: 5px 0;"><strong>E-mail:</strong> <?= htmlspecialchars($aluno['Email'] ?: 'Não informado') ?></p>
                    </div>
                </div>

                <!-- Empréstimos Ativos -->
                <div class="data-section" style="margin-bottom: 20px;">
                    <div class="data-header">📋 Empréstimos Ativos</div>
                    <table class="data-table" style="width:100%">
                        <thead>
                            <tr>
                                <th>Livro</th>
                                <th>Data do Empréstimo</th>
                                <th>Data Prev. Devolução</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($query_ativos->num_rows > 0): ?>
                                <?php while($emprestimo = $query_ativos->fetch_assoc()): ?>
                                    <tr>
                                        <td><?= htmlspecialchars($emprestimo['Titulo']) ?></td>
                                        <td><?= date('d/m/Y', strtotime($emprestimo['data_emprestimo'])) ?></td>
                                        <td><?= $emprestimo['data_devolucao'] ? date('d/m/Y', strtotime($emprestimo['data_devolucao'])) : 'Pendente' ?></td>
                                        <td><span class="status-<?= $emprestimo['atrasado'] ?>"><?= nomearStatus($emprestimo['atrasado']) ?></span></td>
                                    </tr>
                                <?php endwhile; ?>
                            <?php else: ?>
                                <tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum empréstimo ativo no momento.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Histórico de Devoluções -->
                <div class="data-section">
                    <div class="data-header">📜 Histórico de Devoluções</div>
                    <table class="data-table" style="width:100%">
                        <thead>
                            <tr>
                                <th>Livro</th>
                                <th>Data do Empréstimo</th>
                                <th>Data da Devolução</th>
                                <th>Status Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($query_historico->num_rows > 0): ?>
                                <?php while($historico = $query_historico->fetch_assoc()): ?>
                                    <tr>
                                        <td><?= htmlspecialchars($historico['Titulo']) ?></td>
                                        <td><?= date('d/m/Y', strtotime($historico['data_emprestimo'])) ?></td>
                                        <td><?= date('d/m/Y', strtotime($historico['data_devolucao'])) ?></td>
                                        <td><span class="status-<?= $historico['atrasado'] ?>"><?= nomearStatus($historico['atrasado']) ?></span></td>
                                    </tr>
                                <?php endwhile; ?>
                            <?php else: ?>
                                <tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum livro foi devolvido ainda.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
</body>
</html>