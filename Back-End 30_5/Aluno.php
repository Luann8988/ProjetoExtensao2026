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
if(isset($_POST['nome']) && isset($_POST['senha'])) {
    $nome = $mysqli->real_escape_string($_POST['nome']);
    $senha = $mysqli->real_escape_string($_POST['senha']);
    $sql_code = "SELECT * FROM ALUNOS WHERE nome = '$nome' AND Senha = '$senha'";
    $sql_query = $mysqli->query($sql_code);
    if($sql_query->num_rows == 1) {
        $usuario = $sql_query->fetch_assoc();
        $_SESSION['id_aluno'] = $usuario['IDaluno'];
        $_SESSION['nome_aluno'] = $usuario['nome'];
        header("Location: Aluno.php");
        exit;
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

// LÓGICA DE INSERÇÃO (Coloque no topo do arquivo, fora do loop while)

// LÓGICA DE INSERÇÃO CORRIGIDA (Topo do arquivo Aluno.php)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['solicitar_emprestimo'])) {
    $idLivro = intval($_POST['id_livro']);
    $idAluno = $_SESSION['id_aluno'];

    // 1. VERIFICAÇÃO PRÉVIA: Verifica se este aluno já tem este livro registrado
    $sql_check = "SELECT * FROM emprestimos WHERE FK_IDaluno = '$idAluno' AND FK_IDlivro = '$idLivro'";
    $result_check = $mysqli->query($sql_check);

    if ($result_check && $result_check->num_rows > 0) {
        // Se encontrar algum registro, impede o INSERT e mostra aviso amigável
        echo "<script>alert('Você já possui ou já solicitou o empréstimo deste livro!');</script>";
    } else {
        // 2. VERIFICA ESTOQUE DISPONÍVEL
        $res_estoque = $mysqli->query("SELECT Quantidade FROM livros WHERE IDlivro = '$idLivro'");
        $livro_info = $res_estoque->fetch_assoc();
        
        if ($livro_info['Quantidade'] > 0) {
            // 3. INSERÇÃO: status 1 = pego pelo aluno e ativo
            $sql_code = "INSERT INTO emprestimos (FK_IDaluno, FK_IDlivro, data_emprestimo, data_devolucao, atrasado) 
                         VALUES ('$idAluno', '$idLivro', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1)";
            
            if ($mysqli->query($sql_code)) {
                // 4. ATUALIZA ESTOQUE
                $mysqli->query("UPDATE livros SET Quantidade = Quantidade - 1 WHERE IDlivro = '$idLivro'");
                echo "<script>alert('Empréstimo solicitado com sucesso!'); window.location.href='Aluno.php';</script>";
            } else {
                echo "<script>alert('Erro ao processar empréstimo.');</script>";
            }
        } else {
            echo "<script>alert('Lamentamos, mas este livro está esgotado no momento.');</script>";
        }
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
            <input type="text" name="nome" placeholder="Seu Nome" required>
            <input type="password" name="senha" placeholder="Sua Senha" required>
            <button type="submit">Entrar</button>
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
                    <li class="menu-item" onclick="rolarParaSessao('catalogohistorico', this)" data-section="catalogohistorico">📜 Histórico</li>
                </ul>
            </aside>

            <section class="dashboard-content" style="flex: 1;">
                <div id="catalogolivros" class="aba-conteudo">
                    <div class="data-section" style="width: 100%; max-width: 100%;"> 
                        <div class="data-header">📚 Catálogo de Livros</div>
                        <div class="grid">
                        <?php while($livro = $query_livros->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($livro['Titulo']) ?></h3>
                                    <p><strong><?= htmlspecialchars($livro['Autor']) ?></strong></p>
                                    
                                    <div class="actions">
                                        <button class="btn-secondary" onclick="abrirVisualizador(<?= htmlspecialchars(json_encode($livro)) ?>)">Ver Detalhes</button>
                                        
                                        <form method="POST" action="">
                                            <input type="hidden" name="id_livro" value="<?= $livro['IDlivro'] ?>">
                                            <button name="solicitar_emprestimo" class="btn-emprestar" type="submit">Emprestar</button>
                                        </form>
                                    </div>
                                    
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
                            <table  style="width: 100%;"><thead><tr><th>Livro</th><th>Entrega</th><th>Ação</th></tr></thead>
                            <tbody id="listaEmprestimos">
                                <?php
                                while($emprestimos = $query_emprestimos->fetch_assoc()){
                                ?>
                                <tr>
                                    <td><?= htmlspecialchars($emprestimos['Titulo']) ?></td>
                                    <td><?= htmlspecialchars($emprestimos['Autor']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($emprestimos['data_devolucao'])) ?></td>
                                </tr>
                                <?php } ?>
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

    <div id="modalViewer" class="modal">
        <div class="modal-content">
            <span class="close" onclick="fecharModal('modalViewer')">&times;</span>
            <h2 id="viewTitulo"></h2>
            <p><strong id="viewAutor"></strong></p>
            <hr>
            <p id="viewDescricao" style="margin: 15px 0;"></p>
            <div id="containerPdf" style="display:none;">
                <button class="btn-pdf" id="btnAbrirPdf">📖 Abrir PDF Completo</button>
            </div>
            <button class="btn-emprestar" id="btnEmprestarModal">Solicitar este Livro</button>
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