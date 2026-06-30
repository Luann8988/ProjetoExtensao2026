<?php
session_start();
include('conexao.php');

// Proteção Simples
if(!isset($_SESSION['id_aluno'])) {
    // Se não estiver logado, exibe apenas o formulário de login
    $exibirPainel = false;
} else {
    $exibirPainel = true;
    
    //libros
    $sql_livros = "SELECT * FROM livros";
    $query_livros = $mysqli->query($sql_livros) or die($mysqli->error);

    //materiais
    $sql_materiais = "SELECT * FROM materiais";
    $query_materiais = $mysqli->query($sql_materiais) or die($mysqli->error);

    // emprestimos
    $sql_emprestimos = "SELECT * FROM emprestimos 
    INNER JOIN livros 
    ON emprestimos.FK_IDlivro = livros.IDlivro
    where emprestimos.FK_IDaluno = ".$_SESSION['id_aluno']  ;
    $query_emprestimos = $mysqli->query($sql_emprestimos) or die($mysqli->error);

    // histórico (devolvidos)
    $sql_historico = "SELECT * FROM emprestimos 
    INNER JOIN livros ON emprestimos.FK_IDlivro = livros.IDlivro
    WHERE emprestimos.FK_IDaluno = ".$_SESSION['id_aluno']." 
    AND atrasado IN (2, 3)";
    $query_historico = $mysqli->query($sql_historico) or die($mysqli->error);
}

// Lógica de Login (Simplificada para o exemplo)
if(isset($_POST['matricula']) && isset($_POST['senha'])) {
    $matricula = $mysqli->real_escape_string($_POST['matricula']);
    $senha = $_POST['senha'];

    // Login de teste estático
    if ($matricula === '98763867' && $senha === '17082006') {
        $_SESSION['id_aluno'] = 999; // ID Fixo para o aluno de teste
        $_SESSION['nome_aluno'] = 'Aluno de Teste';
        header("Location: Aluno.php");
        exit;
    }
    
    $stmt = $mysqli->prepare("SELECT IDaluno, nome, Senha FROM alunos WHERE matricula = ?");
    $stmt->bind_param("s", $matricula);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows == 1) {
        $usuario = $result->fetch_assoc();
        // Verifica a senha usando password_verify
        if (password_verify($senha, $usuario['Senha'])) {
            $_SESSION['id_aluno'] = $usuario['IDaluno'];
            $_SESSION['nome_aluno'] = $usuario['nome'];
            header("Location: Aluno.php");
            exit;
        }
    }
}

//emprestimo
/*
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['solicitar_emprestimo'])) {
    $idLivro = $_POST['idLivro'];
    if(solicitaremprestimo($idLivro)) {
        echo "<script>alert('Empréstimo solicitado com sucesso!');</script>";
    } else {
        echo "<script>alert('Erro ao solicitar empréstimo. Tente novamente.');</script>";
    }
}

*/

// Logica de solicitar empréstimo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['solicitar_emprestimo'])) {
    $idLivro = intval($_POST['id_livro']);
    $IDaluno = $_SESSION['id_aluno'];

    // 1. VERIFICAÇÃO PRÉVIA: Verifica se este aluno já tem este livro registrado
    $sql_check = "SELECT * FROM emprestimos WHERE FK_IDaluno = '$IDaluno' AND FK_IDlivro = '$idLivro'";
    $result_check = $mysqli->query($sql_check);

    if ($result_check && $result_check->num_rows > 0) {
        // Se encontrar algum registro, impede o INSERT e mostra aviso amigável
        echo "<script>alert('Você já possui ou já solicitou o empréstimo deste livro!');</script>";
    } else {
        // 2. INSERÇÃO: Se não houver duplicata, procede com o cadastro normalmente
        $sql_code = "INSERT INTO emprestimos (FK_IDaluno, FK_IDlivro, data_emprestimo, data_devolucao) VALUES ('$idAluno', '$idLivro', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY))";
        
        if ($mysqli->query($sql_code)) {
            echo "<script>alert('Empréstimo solicitado com sucesso!');</script>";
        } else {
            echo "<script>alert('Lamentamos, mas este livro está esgotado no momento.');</script>";
        }
    }
}

function nomearStatus($atrasado) {
    switch ($atrasado) {
        case 0:
            return "O livro ainda não foi pego.";
        case 1:
            return "Aguardando devolução.";
        case 2:
            return "Devolvido.";
        case 3:
            return "Entregue porém atrasado.";
        case 4:
            return "Devolução atrasada.";
        default:
            return "Sem imformação de status.";
    }
}


?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Portal do Aluno | Biblioteca</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="login-body">

<?php if(!$exibirPainel): ?>
    <div class="login-container">
        <form action="" method="POST">
            <h2>Acesso do Aluno</h2>
            <input type="text" name="matricula" placeholder="Sua Matrícula" required>
            <input type="password" name="senha" placeholder="Sua Senha" required>
            <button type="submit">Entrar</button>
            <a href="recuperar_senha.php" style="display: block; margin-top: 20px; font-size: 14px; color: #FFC20E; text-decoration: none; font-weight: 500;">Esqueci minha senha</a>
        </form>
    </div>
<?php else: ?>
    <div id="alunoContainer">
        <header>
            <div class="header-left">
                <img src="Imagens/imagem1.png" alt="Logo" class="logo">
                <div class="titulo-escola">Escola Estadual <br><strong>Prof. Gonçalves Couto</strong></div>
            </div>
            <input type="text" id="inputBusca" placeholder="🔍 Buscar livros..." onkeyup="filtrarLivros()">
            <button onclick="window.location.href='logout.php'" class="btn-logout">Sair</button>
        </header>

        <main>
            <aside class="sidebar">
                <h3>Menu</h3>
                <ul>
                    <li class="menu-item active" onclick="rolarParaSessao('catalogolivros', this)" data-section="catalogolivros">📚 Catálogo</li>
                    <li class="menu-item" onclick="rolarParaSessao('catalogomateriais', this)" data-section="catalogomateriais">📱 materiais</li>
                    <li class="menu-item" onclick="rolarParaSessao('catalogoemprestimos', this)" data-section="catalogoemprestimos">📋 Empréstimos</li>

                </ul>
            </aside>

            <section class="dashboard-content" style="flex: 1;">
                <div id="catalogolivros" class="aba-conteudo">
                    <div class="data-section" style="width: 100%; max-width: 100%;"> 
                        <div class="data-header">📚 Catálogo de Livros</div>
                        <div class="grid">
                        <?php while($livro = $query_livros->fetch_assoc()): ?>
                            <?php 
                                // Prepara os dados do livro para o JavaScript
                                $livro_json = htmlspecialchars(json_encode([
                                    'IDlivro' => $livro['IDlivro'],
                                    'Titulo' => $livro['Titulo'],
                                    'Autor' => $livro['Autor'],
                                    'Descricao' => $livro['Descricao'],
                                    'CapaURL' => !empty($livro['CapaURL']) ? $livro['CapaURL'] : '../Front-End/Imagens/capa-padrao.png',
                                    'PdfURL' => $livro['PdfURL'] ?? null,
                                    'Quantidade' => (int)($livro['Quantidade'] ?? 0)
                                ]), ENT_QUOTES, 'UTF-8');
                            ?>
                            <div class="card book-card" onclick="abrirModalLivro(<?= $livro_json ?>)">
                                <?php
                                    // Define a imagem da capa. Usa uma padrão se não houver.
                                    $capaUrl = !empty($livro['CapaURL']) ? $livro['CapaURL'] : '../Front-End/Imagens/capa-padrao.png';
                                    $disponivel = isset($livro['Quantidade']) && $livro['Quantidade'] > 0;
                                ?>
                                <img src="<?= htmlspecialchars($capaUrl) ?>" alt="Capa do livro <?= htmlspecialchars($livro['Titulo']) ?>" class="capa" style="height: 200px; object-fit: cover; border-radius: 8px 8px 0 0;">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($livro['Titulo']) ?></h3>
                                    <p><strong><?= htmlspecialchars($livro['Autor']) ?></strong></p>
                                    <p class="small">Disponíveis: <strong><?= (int)($livro['Quantidade'] ?? 0) ?></strong></p>
                                    <button class="btn-emprestar" style="width:100%; margin-top:10px;">Ver Detalhes</button>
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                </div>

                <div id="catalogomateriais" class="aba-conteudo">
                    <div class="data-section" style="width: 100%; max-width: 100%;"> 
                        <div class="data-header">📁 Catálogo de Outros Materiais</div>
                        <div class="grid">
                        <?php while($material = $query_materiais->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($material['nome']) ?></h3>
                                    <p><?= htmlspecialchars($material['descricao'] ?? 'Sem descrição disponível') ?></p>
                                    <p><strong>Quantidade disponível:</strong> <?= (int)$material['quantidade'] ?></p>
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                </div>

                <div id="catalogoemprestimos" class="aba-conteudo" >
                    <div class="data-section" style="width: 100%; max-width: 100%;">
                        <div class="data-header">📋 Meus Empréstimos</div>
                        <div>
                            <table  style="width: 100%;"><thead><tr><th>Livro</th><th>Solicitação</th><th>Estado</th></tr></thead>
                            <tbody id="listaEmprestimos">
                                <?php
                                while($emprestimos = $query_emprestimos->fetch_assoc()){
                                ?>
                                <tr>
                                    <td><a><?php echo $emprestimos['Titulo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['Autor']; ?></a></td>
                                    <td><a><?php echo $emprestimos['data_devolucao']; ?></a>
                                </td>
                                <?php
                                }
                                ?>
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div id="catalogohistorico" class="aba-conteudo" style="width: 100%;">
                    <div class="data-section" style="width: 100%; max-width: 100%;">
                        <div class="data-header">📜 Histórico Completo</div>
                        <table class="data-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Livro</th>
                                    <th>Empréstimo</th>
                                    <th>Devolução</th>
                                    <th>Status Final</th>
                                </tr>
                            </thead>
                            <tbody id="listaHistorico">
                                <?php while($hist = $query_historico->fetch_assoc()): ?>
                                <tr>
                                    <td><?= htmlspecialchars($hist['Titulo']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($hist['data_emprestimo'])) ?></td>
                                    <td><?= $hist['data_devolucao'] ? date('d/m/Y', strtotime($hist['data_devolucao'])) : '---' ?></td>
                                    <td>
                                        <span class="<?= $hist['atrasado'] == 3 ? 'status-overdue' : 'status-active' ?>">
                                            <?= $hist['atrasado'] == 3 ? 'Devolvido com Atraso' : 'Devolvido' ?>
                                        </span>
                                    </td>
                                </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>

        <footer class="main-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Sobre a Biblioteca</h4>
                    <p>A biblioteca da Escola Estadual Professor Gonçalves Couto é um espaço dedicado ao incentivo à leitura e à pesquisa.</p>
                </div>
                <div class="footer-section">
                    <h4>Links Rápidos</h4>
                    <ul>
                        <li><a href="#" style="color: inherit; text-decoration: none;">Catálogo</a></li>
                        <li><a href="#" style="color: inherit; text-decoration: none;">Regulamento</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contato</h4>
                    <p><i class="fas fa-envelope"></i> biblioteca@escola.edu.br</p>
                </div>
            </div>
            <div class="footer-bottom">
                &copy; 2026 <strong>Biblioteca Escolar</strong> - Escola Estadual Professor Gonçalves Couto. Muriaé-MG.
            </div>
        </footer>
    </div>

    <!-- Modal de Detalhes do Livro -->
    <div id="modalDetalhesLivro" class="modal">
        <div class="modal-content">
            <span class="close" onclick="fecharModal('modalDetalhesLivro')">&times;</span>
            <div class="modal-body" style="display: flex; gap: 20px; flex-wrap: wrap;">
                <img id="modalCapa" src="" alt="Capa do Livro" style="width: 150px; height: 220px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="flex: 1; min-width: 250px;">
                    <h2 id="modalTitulo" style="margin-top: 0;"></h2>
                    <p><strong id="modalAutor"></strong></p>
                    <p id="modalDisponibilidade" class="small"></p>
                    <hr style="border-color: #444;">
                    <p id="modalDescricao" style="font-size: 14px; color: #ccc; max-height: 80px; overflow-y: auto;"></p>
                </div>
            </div>
            <div class="modal-footer" style="text-align: right; margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                <a id="btnLerPdfModal" href="#" target="_blank" class="btn-pdf" style="display: none;">Ler PDF</a>
                <button id="btnEmprestarModal" class="btn-emprestar">Solicitar Empréstimo</button>
            </div>
        </div>
    </div>

    <script>
        window.studentId = <?= json_encode($_SESSION['id_aluno']) ?>;
        window.studentName = <?= json_encode($_SESSION['nome_aluno']) ?>;
    </script>
    <script src="Script.js"></script>
<?php endif; ?>
</body>
</html>