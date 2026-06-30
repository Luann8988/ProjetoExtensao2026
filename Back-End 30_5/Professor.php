<?php
// O arquivo funcoes.php já inclui conexao.php e session_start()
// Centralizar aqui garante que as variáveis $query_alunos, $query_dashboard, etc, fiquem disponíveis
include('funcoes.php');

//mostrar alunos
$sql_alunos = "SELECT * FROM alunos";
$query_alunos = $mysqli->query($sql_alunos) or die($mysqli->error);

// mostrar emprestimos
$sql_emprestimos = "select * from emprestimos 
inner join livros on (emprestimos.FK_IDlivro = livros.IDlivro) 
inner join alunos on (emprestimos.FK_IDaluno = alunos.IDaluno);";
                    
function nomearStatus($atrasado) {
    switch ($atrasado) {
        case 0:
            return "Não pegou o livro ainda.";
        case 1:
            return "Foi pego pelo aluno e ainda não devolveu.";
        case 2:
            return "Foi pego pelo aluno e já devolveu.";
        case 3:
            return "Foi pego pelo aluno e já devolveu, mas atrasou a devolução.";
        case 4:
            return "Foi pego pelo aluno e ainda não devolveu, mas já passou da data de devolução.";
        default:
            return "Sem imformação de status.";
    }
}
/* usar de exemplo
if (isset($_GET['deletar'])){
    $id = intval($_GET['deletar']);
    $sql_query = $mysqli->query("SELECT * FROM arquivos WHERE id = '$id'") or die($mysqli->error);
    $arquivo = $sql_query->fetch_assoc();
    $caminhoArquivo = $arquivo['path'];

    if (file_exists($caminhoArquivo)){//verifica se arquivo existe
        unlink($caminhoArquivo);//exclui o arquivo do servidor
        $dellComcluido = $mysqli->query("DELETE FROM arquivos WHERE id = '$id'") or die($mysqli->error);//exclui no banco de dados
        if ($dellComcluido){
            echo "<alert>arquivo excluido com sucesso</alert>";
        } else {
            echo "<p>erro ao excluir arquivo</p>";
        }
    }
} 

<td>
    <a href="upload.php?deletar=<?php echo $material['id']; ?>" onclick="return confirm('Tem certeza que deseja excluir este arquivo?')">
        Deletar
    </a>
</td>

*/
//lançamentos de livros 
/*
o canpo atrasado da tabela emprestimos vai funcionar assim:
0 = ainda não foi pego pelo aluno
1 = foi pego pelo aluno e ainda não devolveu
2 = foi pego pelo aluno e já devolveu
3 = foi pego pelo aluno e já devolveu, mas atrasou a devolução
4 = foi pego pelo aluno e ainda não devolveu, mas já passou da data de devolução

*/



//Upload de Materiais
//estenções aceitas
$extensoesAceitas = array('doc', 'docx', 'pdf', 'txt', 'jpg', 'jpeg', 'png', 'mp3', 'ppt');


//ver se deu certo o upload do arquivo
if(isset($_FILES['arquivo'])){
    $arquivo = $_FILES['arquivo'];

    // se tiver qualquer erro
    if ($arquivo['error']){
        die("erro no upload");
    }

    //limitar tamanho
    if ($arquivo['size'] > (1024 * 1024 * 2)){// 2magasbites
        die("muito grande");
    }

    // o que é neserario para o o=upload do arquivo
    $pasta = "C:/wamp64/www/upload/materiais/";// pasta onde vai ser salvo o arquivo
    $nomeDoArquivo = $arquivo['name'];// nome do arquivo
    $novoNomeDoArquivo = uniqid();//novo nome para o arquivo
    $estensao = strtolower(pathinfo($nomeDoArquivo, PATHINFO_EXTENSION));//estensão do arquivo

    //ver se a estensão é aceita
    if (!in_array($estensao, $extensoesAceitas)){
        die("tipo de arquivo não aceito");
    }
    
    $path = "materiais/" . $novoNomeDoArquivo . "." . $estensao;// caminho completo do arquivo
    //variavel bool verificando se o arquivo foi movido para a pasta
    $subirArquivo = move_uploaded_file($arquivo['tmp_name'], $path);
    if ($subirArquivo){
        $mysqli->query("INSERT INTO materiais (nome, path, date_upload) VALUES ('$nomeDoArquivo', '$path', NOW())");
        // Em vez de usar o caminho físico do Windows, use a URL relativa

        //echo "<p>upload feito com sucesso : <a target='_blank' href='$path'>Visualizar</a></p>";
    } else {
        echo "<p>erro ao fazer upload</p>";
    }
}


?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal do Professor</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Adicionado para ícones e estilos de busca -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
    .error-message { color: red; text-align: center; margin-top: 10px; }
    </style>
</head>
<body class="login-body">

<?php if(!isset($_SESSION['id_professor'])): ?>
    <!-- TELA DE LOGIN -->
    <div id="loginContainer" class="login-container">
        <img src="Imagens/imagem3.png" class="logo" alt="Logo">
        <h2>Portal do Professor</h2>
        <?php if(isset($erro)) echo "<p class='error-message'>$erro</p>"; ?>
        <form action="Professor.php" method="POST">
            <input type="text" name="matricula" placeholder="Sua Matrícula" required>
            <input type="password" name="senha" placeholder="Senha" required>
            <button type="submit">Entrar</button>
            <a href="recuperar_senha.php" class="link-esqueci-senha">Esqueci minha senha</a>
        </form>
    </div>
<?php else: ?>
    <!-- PAINEL COMPLETO DO PROFESSOR -->
    <div id="professorContainer">
        <header>
            <div class="header-left">
                <img src="Imagens/imagem3.png" class="logo">
                <div class="titulo-escola">
                    Escola Estadual <br>
                    <strong>Professor Gonçalves Couto</strong>
                </div>
            </div>
            <div class="notification-container" onclick="rolarParaSessao('dashboardSection', this)" style="cursor: pointer; position: relative; margin-right: 20px;">
                <i class="fas fa-bell" style="font-size: 20px; color: #cbd5e1;"></i>
                <?php if ($total_solicitacoes_pendentes > 0): ?>
                    <span id="notification-badge" class="notification-badge" style="position: absolute; top: -5px; right: -10px; background-color: #ef4444; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; font-weight: bold;">
                        <?php echo $total_solicitacoes_pendentes; ?>
                    </span>
                <?php endif; ?>
            </div>
            <input type="text" id="searchProf" placeholder="🔍 Buscar empréstimos...">
            <button onclick="window.location.href='logout.php'" class="btn-logout">Sair</button>
        </header>
        <main>
            <aside class="sidebar-prof">
                <div class="professor-info">
                    <img src="Imagens/avatar.png" alt="Foto do Professor" class="professor-avatar">
                    <div>
                        <div class="professor-name">Prof. <?php echo htmlspecialchars($_SESSION['email_professor']); ?></div>
                        <div class="professor-role">Bibliotecário</div>
                    </div>
                </div>
                <div class="separator"></div>
                <ul>
                    <li class="menu-item active" onclick="rolarParaSessao('dashboard', this)">📊 Dashboard</li>
                    <li class="menu-item" onclick="rolarParaSessao('alunos', this)">👥 Alunos</li>
                    <li class="menu-item" onclick="rolarParaSessao('relatorios', this)">📈 Relatórios</li>
                    <li class="menu-item" onclick="rolarParaSessao('livros', this)">📚 Livros</li>
                    <li class="menu-item" onclick="rolarParaSessao('devolucoes', this)">🔄 Devoluções</li>
                </ul>
            </aside>

            <section class="dashboard-content">
                <!-- DASHBOARD -->
                <div id="dashboardSection" class="section active">
                    <h2 style="color:#FFC20E; margin-bottom: 25px; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-chart-line"></i> Visão Geral da Biblioteca
                    </h2>
                    <div class="stats-grid">
                        <div class="stat-card" style="border-left-color: #3b82f6;">
                            <i class="fas fa-exchange-alt" style="font-size: 20px; color: #3b82f6; margin-bottom: 10px;"></i>
                            <div class="stat-number"><?php echo $totalemprestimos; ?></div>
                            <div class="stat-label">Total Realizado</div>
                        </div>
                        <div class="stat-card" style="border-left-color: #10b981;">
                            <i class="fas fa-check-circle" style="font-size: 20px; color: #10b981; margin-bottom: 10px;"></i>
                            <div class="stat-number"><?php echo $totalemprestimosativos; ?></div>
                            <div class="stat-label">Empréstimos Ativos</div>
                        </div>
                        <div class="stat-card" style="border-left-color: #ef4444;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 20px; color: #ef4444; margin-bottom: 10px;"></i>
                            <div class="stat-number"><?php echo $totalemprestimosatrasados; ?></div>
                            <div class="stat-label">Livros Atrasados</div>
                        </div>
                        <div class="stat-card" style="border-left-color: #f59e0b;">
                            <i class="fas fa-undo" style="font-size: 20px; color: #f59e0b; margin-bottom: 10px;"></i>
                            <div class="stat-number"><?php echo $totalemprestimosdevolvidos; ?></div>
                            <div class="stat-label">Devolvidos</div>
                        </div>
                    </div>
                    <div class="data-section">
                        <div class="data-header">📋 Empréstimos Recentes</div>
                        <table class="data-table" style="width:100%">
                            <thead><tr><th>Código</th><th>Aluno</th><th>Livro</th><th>Data Emp.</th><th>Data Dev.</th><th>Status</th></tr></thead>
                            <tbody id="listaEmprestimos">                                
                                <?php while($emprestimos = $query_dashboard->fetch_assoc()): ?>
                                    <?php if ($emprestimos['atrasado'] == 0 || $emprestimos['atrasado'] == 1 || $emprestimos['atrasado'] == 4): ?>
                                <tr>
                                    <td><?= htmlspecialchars($emprestimos['FK_IDaluno']) ?></td>
                                    <td><?= htmlspecialchars($emprestimos['nome']) ?></td>
                                    <td><?= htmlspecialchars($emprestimos['Titulo']) ?></td>
                                    <td><?= htmlspecialchars($emprestimos['data_emprestimo']) ?></td>
                                    <td><?= htmlspecialchars($emprestimos['data_devolucao']) ?></td>
                                    <td>
                                        <a href="Professor.php?atualizar_emprestimoLivro=<?= $emprestimos['IDlivro'] ?>&atualizar_emprestimoAluno=<?= $emprestimos['FK_IDaluno'] ?>" onclick="return confirm('Confirmar que o aluno pegou este livro?')">
                                            <?= nomearStatus($emprestimos['atrasado']) ?>
                                        </a>
                                    </td>
                                    <td>
                                        <?php if($emprestimos['atrasado'] == 1 || $emprestimos['atrasado'] == 4): ?>
                                            <a href="Professor.php?devolver_livro_id=<?= $emprestimos['IDlivro'] ?>&aluno_id=<?= $emprestimos['FK_IDaluno'] ?>" class="btn-primary" style="padding: 2px 5px; font-size: 11px; text-decoration: none;">Devolver</a>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                    <?php endif; ?>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ALUNOS -->
                <div id="alunosSection" class="section">
                    <div class="data-section">
                        <div class="data-header">👥 Alunos</div>
                        <div class="grid" id="alunosGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 10px;">
                        <?php while($aluno = $query_alunos->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3>
                                        <a href="aluno_detalhes.php?id=<?= $aluno['IDaluno'] ?>" style="text-decoration: none; color: inherit;" title="Ver detalhes de <?= htmlspecialchars($aluno['nome']) ?>"><?= htmlspecialchars($aluno['nome']) ?></a>
                                    </h3>
                                    <p>
                                        <span class="password-toggle" data-password="<?= htmlspecialchars($aluno['Senha']) ?>">••••••</span>
                                        <button type="button" class="btn-small" onclick="togglePassword(this)">Revelar</button>
                                    </p>
                                    <p>
                                        <a href="Professor.php?deletar_aluno=<?php echo $aluno['IDaluno']; ?>" style="color:red; font-size:11px;" onclick="return confirm('Excluir aluno?')">Excluir</a>
                                    </p>
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                </div>

                <!-- RELATÓRIOS -->
                <div id="relatorios" class="section">
                    <div class="data-section"><div class="data-header">📈 Relatórios</div><button class="btn-primary">Exportar CSV</button></div>
                </div>

                <!-- LIVROS -->
                <div id="livros" class="section">
                    <div class="data-section"><div class="data-header">📚 Livros</div>

                    <div class="data-section" style="padding:15px;"><!-- Formulário de upload de materia -->
                        <form method='post' enctype="multipart/form-data" action="">
                            <p><input type="file" name="arquivo" id="arquivo"></p>
                            <button name="uploadMaterial" type="submit">Enviar</button>
                        </form>
                    </div>

                    <div class="data-section" style="padding:15px;"><!-- Formulário de upload de livros -->
                        <form method='post' action="" id="addBookForm">
                            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <input type="text" name="ISBN" id="newIsbn" placeholder="ISBN (Busca Automática)" style="flex: 1;">
                                <button type="button" class="btn-search-isbn" onclick="buscarDadosGoogleBooks()" style="width: 50px;">🔍</button>
                            </div>
                            <input type="text" name="Titulo" id="newTitle" placeholder="Título" required>
                            <input type="text" name="Autor" id="newAuthor" placeholder="Autor" required>
                            <textarea name="Descricao" id="newDesc" placeholder="Descrição" style="width: 100%; margin-bottom: 10px;"></textarea>
                            
                            <div style="display: flex; gap: 10px;">
                                <input type="text" name="Categoria" id="newCategory" placeholder="Categoria" style="flex: 1;">
                                <input type="number" name="Paginas" id="newPages" placeholder="Páginas" style="width: 80px;">
                                <input type="number" name="Quantidade" placeholder="Qtd" value="1" style="width: 60px;">
                            </div>
                            <input type="hidden" name="CapaURL" id="newCoverUrl">
                            <input type="hidden" name="PdfURL" id="newBookUrl">
                            <button name="uploadLivro" type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Salvar Livro no Banco</button>
                        </form>
                    </div>

                    <div class="data-section">
                        <table class="data-table" style="width:100%">
                            <thead><tr><th>ID</th><th>Título</th><th>Autor</th><th>Estoque</th><th>Ações</th></tr></thead>
                            <tbody>
                                <?php 
                                $query_livros = $mysqli->query("SELECT * FROM livros ORDER BY IDlivro DESC");
                                while($livro = $query_livros->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo $livro['IDlivro']; ?></td>
                                    <td><?php echo htmlspecialchars($livro['Titulo']); ?></td>
                                    <td><?php echo htmlspecialchars($livro['Autor']); ?></td>
                                    <td><?php echo $livro['Quantidade']; ?></td>
                                    <td><a href="Professor.php?deletar_livro=<?php echo $livro['IDlivro']; ?>" style="color:red" onclick="return confirm('Excluir livro?')">Excluir</a></td>
                                </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>

                <!-- DEVOLUÇÕES -->
                <div id="devolucoesSection" class="section" style="width: 100%;">
                    <div class="data-section">
                        <div class="data-header">🔄 Devoluções</div>
                        <div id="returnLoansList">
                            <table  style="width: 100%;"><thead><tr><th>Livro</th><th>Entrega</th><th>Ação</th></tr></thead>
                            <tbody id="listaEmprestimos">
                                <?php
                                while($emprestimos = $query_emprestimos->fetch_assoc()){
                                ?>
                                <tr>
                                    <td><a><?php echo $emprestimos['Titulo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['atrasado']; ?></a></td>
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

                <?php if(isset($_SESSION['email_professor']) == "teste@teste.com") { ?>
                <div id="livros" class="section">
                    <div class="data-section"><div class="data-header">🧑‍🏫 Adicionar professor</div>
                        <div class="data-section"><!-- Formulário de upload de livros -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <input type="email" name="emailProfessor" id="emailProfessor" placeholder="Email do Professor" required>
                                <input type="password" name="senhaProfessor" id="senhaProfessor" placeholder="Senha do Professor" required>
                                <button name="adicionarProfessor" type="submit" class="btn-secondary">Cadastrar Professor</button>
                            </form>
                        </div>
                    </div>
                    <div class="data-section"><div class="data-header">🧑‍🎓 Adicionar aluno</div>
                        <div class="data-section"><!-- Formulário de upload de livros -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <input type="string" name="nomealuno" id="nomealuno" placeholder="Nome do Aluno" required>
                                <input type="password" name="senhaaluno" id="senhaaluno" placeholder="Senha do Aluno" required>
                                <button name="adicionarAluno" type="submit" class="btn-secondary">Cadastrar Aluno</button>
                            </form>
                        </div>
                    </div>
                </div>
                <?php
                }
                ?>

            </section>
        </main>
    </div>

    <!-- JavaScript passa o ID do professor para o cliente (opcional) -->
    <script>
        window.professorId = <?php echo json_encode($_SESSION['id_professor']); ?>;
    </script>
<?php endif; ?>

<!-- Elemento de áudio para a notificação -->
<audio id="notification-sound" src="https://www.myinstants.com/media/sounds/notification_fJzFih4.mp3" preload="auto"></audio>

<script src="Script.js"></script>
</body>
</html>