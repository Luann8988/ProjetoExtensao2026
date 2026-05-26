<?php
session_start();
include('conexao.php');

include("protect.php");


// Lógica de Login do Aluno
if(isset($_POST['nome']) && isset($_POST['senha'])) {
    $nome = $mysqli->real_escape_string($_POST['nome']);
    $senha = $_POST['senha'];

    $stmt = $mysqli->prepare("SELECT IDaluno, nome, Senha FROM ALUNOS WHERE nome = ?");
    $stmt->bind_param("s", $nome);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows == 1) {
        $usuario = $result->fetch_assoc();
        
        // Implementação de verificação segura (suporta hash e texto puro para transição)
        if(password_verify($senha, $usuario['Senha']) || $senha === $usuario['Senha']) {
            $_SESSION['id_aluno'] = $usuario['IDaluno'];
            $_SESSION['nome_aluno'] = $usuario['nome'];
            header("Location: Aluno.php");
            exit;
        } else {
            $erro = "Senha incorreta!";
        }
    } else {
        $erro = "Usuário não encontrado!";
    }
}


//estenções aceitas
$extensoesAceitas = ['doc', 'docx', 'pdf', 'txt', 'jpg', 'jpeg', 'png', 'mp3', 'ppt'];

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
    $pasta = "uploads/materiais/"; // Use caminhos relativos para portabilidade
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

$sql_query = $mysqli->query("SELECT * FROM materiais") or die($mysqli->error);

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal do Aluno | Biblioteca Escolar - Prof. Gonçalves Couto</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    /* Esconde a div de erro se não houver erro */
    .error-message { color: red; text-align: center; margin-top: 10px; }
  </style>
</head>
<body class="login-body">

<?php if(!isset($_SESSION['id_aluno'])): ?>
    <!-- TELA DE LOGIN -->
    <div id="loginContainer" class="login-container">
        <?php if(isset($erro)) echo "<p class='error-message'>$erro</p>"; ?>
        <form action="" method="POST">
            <input type="text" name="nome" placeholder="Nome do Aluno" required>
            <input type="password" name="senha" placeholder="Senha" required>
            <button type="submit">Entrar</button>
        </form>
    </div>
<?php else: ?>
    <!-- PAINEL COMPLETO DO ALUNO -->
    <div id="alunoContainer">
        <!-- Cabeçalho, sidebar, catálogo, etc. -->
        <header>
          <div class="header-left">
            <img src="Imagens/imagem1.png" alt="Logo" class="logo">
            <div class="titulo-escola">
              Escola Estadual <br>
              <strong>Professor Gonçalves Couto</strong>
            </div>
          </div>
          <div class="search-container">
            <input type="text" id="searchAluno" placeholder="🔍 Buscar livros...">
            <select id="filterCategory" onchange="filterBooks()">
              <option value="">Todas Categorias</option>
              <option value="Romance">Romance</option>
              <option value="Clássicos">Clássicos</option>
              <option value="Drama">Drama</option>
              <option value="Aventura">Aventura</option>
            </select>
            <label style="font-size: 12px; color: white; display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="filterAvailable" onchange="filterBooks()"> Disponíveis
            </label>
          </div>
          <button onclick="window.location.href='logout.php'" class="btn-logout">Sair</button>
        </header>

        <main>
          <aside class="sidebar">
            <h3>Meu Painel</h3>
            <ul>
              <li class="active" onclick="showBooks()">📚 Catálogo de Livros</li>
              <li onclick="showMyLoans()">📋 Meus Empréstimos</li>
              <li onclick="showHistory()">📜 Histórico</li>
              <li onclick="showSection('configSection')">⚙️ Configurações</li>
            </ul>
          </aside>

          <section class="dashboard-content">
            <div class="netflix-profile-header" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 20px; border-radius: var(--radius); margin-bottom: 20px; display: flex; align-items: center; gap: 20px;">
              <img id="headerAvatar" src="" class="profile-avatar-preview" alt="Seu avatar" style="display: none;">
              <div>
                <h2 id="headerUserName">Bem-vindo, Aluno!</h2>
                <p id="headerUserSerie">Complete seu perfil</p>
                <span id="readerLevelBadge" class="level-badge" style="display:none;"></span>
              </div>
            <div class="stats-mini" style="margin-left: auto; text-align: right; min-width: 160px;">
              <div style="font-size: 14px; margin-bottom: 5px; font-weight: 500;">Livros Ativos: <b id="statCount">0</b>/3</div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div id="loanProgressBar" style="width: 0%; height: 100%; background: #FFC20E; transition: width 0.4s ease-out;"></div>
              </div>
            </div>
            </div>

            <!-- Catálogo -->
            <div id="bookCatalog">
              <div class="data-section">
                <div class="data-header">📚 Catálogo de Livros</div>
                    <form method='post' enctype="multipart/form-data" action="" >
        <p>
            <label for="">Selecione um arquivo:</label>
            <input type="file" name="arquivo" id="arquivo">
        </p>
        <button name="upload" type="submit">Enviar</button>
    </form>


    <table border="1" cellspacing="0" cellpadding="15">
        <thead>
            <th>arquivo</th>
            <th>data de envio</th>
        </thead>
        <tbody>
        <?php
        while($material = $sql_query->fetch_assoc()){
        ?>
        <tr>
            <td><a target="_blank" href="<?php echo $material['path']; ?>"><?php echo $material['nome']; ?></a></td>
            <td><?php echo $material['date_upload']; ?></td>
        <?php
        }
        ?>
        </tbody>
    </table>
                <div id="booksGrid" class="grid"></div>
              </div>
            </div>

            <!-- Meus Empréstimos -->
            <div id="myLoansSection" style="display:none;">
              <div class="data-section">
                <div class="data-header">📋 Meus Empréstimos Ativos</div>
                <table class="data-table" id="myLoansTable">
                  <thead>
                    <tr><th>Livro</th><th>Data Empr.</th><th>Data Dev.</th><th>Ação</th></tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>

            <!-- Histórico -->
            <div id="historySection" style="display:none;">
              <div class="data-section">
                <div class="data-header">📜 Histórico Completo</div>
                <table class="data-table" id="historyTable">
                  <thead><tr><th>Livro</th><th>Empréstimo</th><th>Devolução</th><th>Status</th><th>Avaliação</th><th>Comentário</th><th>Recomendações</th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>

            <!-- Configurações (resumido) -->
            <div id="configSection" style="display:none;">
                <div class="data-section">
                    <div class="data-header">📈 Seu Nível de Leitura</div>
                    <div style="padding: 20px;">
                        <p id="levelStatsInfo" style="margin: 0; font-size: 15px; color: var(--text-dark);">Calculando estatísticas...</p>
                    </div>
                </div>

                <div class="data-section">
                    <div class="data-header">👤 Editar Perfil</div>
                    <form id="profileSettingsForm" onsubmit="saveStudentProfile(event)" style="padding: 20px;">
                        <div class="form-group">
                            <label>Seu Nome</label>
                            <input type="text" id="profileName" value="<?php echo $_SESSION['nome_aluno']; ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Sua Série/Turma</label>
                            <input type="text" id="profileSerie" required>
                        </div>
                        <div class="form-group">
                            <label>Estilo do Avatar ( Seed )</label>
                            <input type="text" id="avatarSeedInput" placeholder="Ex: Felix, Daisy, etc">
                        </div>
                        <button type="submit" class="btn-emprestar">Salvar Alterações</button>
                    </form>
                </div>

                <div class="data-section">
                    <div class="data-header">🎨 Aparência e Sistema</div>
                    <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn-secondary" onclick="toggleDarkMode()">🌓 Alternar Modo Escuro/Claro</button>
                    </div>
                </div>

                <div class="data-section">
                    <div class="data-header">🔐 Segurança</div>
                    <div style="padding: 20px;"><p>As senhas são protegidas por criptografia MD5/Hash.</p></div>
                </div>
            </div>
          </section>
        </main>
    </div>

    <!-- JavaScript que passa o ID do aluno para o cliente -->
    <script>
        // Passa o ID do aluno logado do PHP para o JavaScript
        window.studentId = <?php echo json_encode($_SESSION['id_aluno']); ?>;
        window.studentName = <?php echo json_encode($_SESSION['nome_aluno']); ?>;
    </script>
<?php endif; ?>

<script src="Script.js"></script>
</body>
</html>