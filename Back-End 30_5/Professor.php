<?php

include('conexao.php');
session_start();

// Lógica de Login do Professor
if(isset($_POST['email']) && isset($_POST['senha'])) {
    $email = $mysqli->real_escape_string($_POST['email']);
    $senha = $mysqli->real_escape_string($_POST['senha']);

    $sql_code = "SELECT * FROM professores WHERE Email = '$email' AND Senha = '$senha'";
    $sql_query = $mysqli->query($sql_code) or die("Falha: " . $mysqli->error);

    if($sql_query->num_rows == 1) {
        $usuario = $sql_query->fetch_assoc();
        $_SESSION['id_professor'] = $usuario['IDprofessor'];
        $_SESSION['email_professor'] = $usuario['Email'];
        
        header("Location: Professor.php");
        exit;
    } else {
        $erro = "E-mail ou senha incorretos!";
    }
}

//mostrar alunos
$sql_alunos = "SELECT * FROM alunos";
$query_alunos = $mysqli->query($sql_alunos) or die($mysqli->error);

// mostrar emprestimos
$sql_emprestimos = "select * from emprestimos 
inner join livros on (emprestimos.FK_IDlivro = livros.IDlivro) 
inner join alunos on (emprestimos.FK_IDaluno = alunos.IDaluno);";
                    
$query_emprestimos = $mysqli->query($sql_emprestimos) or die($mysqli->error);
$totalemprestimos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos")->fetch_assoc()['total'];
$totalemprestimosativos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 1")->fetch_assoc()['total'];
$totalemprestimosatrasados = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 4")->fetch_assoc()['total'];
$totalemprestimosdevolvidos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado   = 2")->fetch_assoc()['total'];

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
if(isset($_POST['uploadLivro'])) {

        $titulo = $mysqli->real_escape_string($_POST['Titulo']);
        $autor = $mysqli->real_escape_string($_POST['Autor']);
        $descricao = $mysqli->real_escape_string($_POST['Descricao']);
        $isbn = $mysqli->real_escape_string($_POST['ISBN']);
        $quantidade = (int)$_POST['Quantidade'];
    
        $sql_insert_livro = "INSERT INTO livros (Titulo, Autor, Descricao, ISBN, Quantidade) VALUES ('$titulo', '$autor', '$descricao', '$isbn', '$quantidade')";
        if ($mysqli->query($sql_insert_livro)) {
            echo "<p>Livro cadastrado com sucesso!</p>";
        } else {
            echo "<p>Erro ao cadastrar livro: " . $mysqli->error . "</p>";
        }



}



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
        <form action="" method="POST">
            <input type="email" name="email" placeholder="E-mail" required>
            <input type="password" name="senha" placeholder="Senha" required>
            <button type="submit">Entrar</button>
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
                        <table class="data-table">
                            <thead><tr><th>Código</th><th>Aluno</th><th>Livro</th><th>Data Emp.</th><th>Data Dev.</th><th>Status</th></tr></thead>
                            <tbody id="listaEmprestimos">
                                <?php
                                while($emprestimos = $query_dashboard->fetch_assoc()){
                                    if ($emprestimos['atrasado'] == 0 || $emprestimos['atrasado'] == 1) {
                                ?>
                                <tr>
                                    <td><a><?php echo $emprestimos['FK_IDaluno']; ?></a></td>
                                    <td><a><?php echo $emprestimos['nome']; ?></a></td>
                                    <td><a><?php echo $emprestimos['Titulo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['data_emprestimo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['data_devolucao']; ?></a></td>
                                    <td>
                                        <a href="Professor.php?atualizar_emprestimoLivro=<?php echo $emprestimos['IDlivro'] . '&' . 'atualizar_emprestimoAluno=' . $emprestimos['FK_IDaluno']; ?>" onclick="return confirm('Tem certeza que deseja atualizar este emprestimo para pego?')">
                                            <?php echo nomearStatus($emprestimos['atrasado']); ?>
                                        </a>
                                    </td>
                                <?php
                                }}  
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ALUNOS -->
                <div id="alunosSection" class="section">
                    <div class="data-section">
                        <div class="data-header">👥 Alunos</div>
                        <div class="grid" id="alunosGrid">
                        <?php while($aluno = $query_alunos->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($aluno['nome']) ?></h3>
                                    <p>
                                        <span class="password-toggle" data-password="<?= htmlspecialchars($aluno['Senha']) ?>">••••••</span>
                                        <button type="button" class="btn-small" onclick="togglePassword(this)">Revelar</button>
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

                    <div class="data-section"><!-- Formulário de upload de materia -->
                        <form method='post' enctype="multipart/form-data" action="">
                            <p><input type="file" name="arquivo" id="arquivo"></p>
                            <button name="uploadMaterial" type="submit">Enviar</button>
                        </form>
                    </div>

                    <div class="data-section"><!-- Formulário de upload de livros -->
                        <form method='post' enctype="multipart/form-data" action="">
                            <input type="string" name="Titulo" id="Titulo" placeholder="Título" required>
                            <input type="string" name="Autor" id="Autor" placeholder="Autor" required>
                            <input type="string" name="Descricao" id="Descricao" placeholder="Descrição" required>
                            <input type="string" name="ISBN" id="ISBN" placeholder="ISBN" required>
                            <input type="int" name="Quantidade" id="Quantidade" placeholder="Quantidade" required>
                            <button name="uploadLivro" type="submit">Cadastrar Livro</button>
                        </form>
                    </div>
                        <button class="btn-secondary" onclick="showModal('modalAddBook')">
                            Adicionar Livro
                        </button>
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

<script src="Script.js"></script>
</body>
</html>