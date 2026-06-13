<?php
session_start();
include('conexao.php');

include("protect.php");

// ENDPOINT API: Retorna livros em formato JSON para o Front-End
if(isset($_GET['api']) && $_GET['api'] == 'livros') {
    $termo = isset($_GET['q']) ? $mysqli->real_escape_string($_GET['q']) : '';
    $result = $mysqli->query("SELECT * FROM livros WHERE Titulo LIKE '%$termo%' OR Autor LIKE '%$termo%'");
    $livros = [];
    while($row = $result->fetch_assoc()) { $livros[] = $row; }
    header('Content-Type: application/json');
    echo json_encode($livros);
    exit;
}

// Lógica de Login do Aluno
if(isset($_POST['nome']) && isset($_POST['senha'])) {
    $nome = $mysqli->real_escape_string($_POST['nome']);
    $senha = $_POST['senha'];

    $stmt = $mysqli->prepare("SELECT IDaluno, nome, turma, Senha FROM ALUNOS WHERE nome = ?");
    $stmt->bind_param("s", $nome);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows == 1) {
        $usuario = $result->fetch_assoc();
        
        // Implementação de verificação segura (suporta hash e texto puro para transição)
        if(password_verify($senha, $usuario['Senha']) || $senha === $usuario['Senha']) {
            $_SESSION['id_aluno'] = $usuario['IDaluno'];
            $_SESSION['nome_aluno'] = $usuario['nome'];
            $_SESSION['turma_aluno'] = $usuario['turma'];
            header("Location: Aluno.php");
            exit;
        } else {
            $erro = "Usuário ou senha incorretos. Verifique seus dados e tente novamente.";
        }
    } else {
        $erro = "Usuário ou senha incorretos. Verifique seus dados e tente novamente.";
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
</head>
<body class="login-body">

<?php if(!isset($_SESSION['id_aluno'])): ?>
    <!-- TELA DE LOGIN -->
    <div id="loginContainer" class="login-container">
        <?php if(isset($erro)) echo "<div class='error-message' style='display:block;'>$erro</div>"; ?>
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
              <li onclick="showSection('materiaisOutros')">📁 Outros Materiais</li>
              <li onclick="showMyLoans()">📋 Meus Empréstimos</li>
              <li onclick="showHistory()">📜 Histórico</li>
            </ul>

          </aside>


          <section class="dashboard-content">
            <div class="netflix-profile-header" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 20px; border-radius: var(--radius); margin-bottom: 20px; display: flex; align-items: center; gap: 20px;">
              <img id="headerAvatar" src="" class="profile-avatar-preview" alt="Seu avatar" style="display: none;">
              <div>
                <h2 id="headerUserName">Bem-vindo, Aluno!</h2>
                <p id="headerUserSerie"><?php echo $_SESSION['turma_aluno'] ?? 'Série não informada'; ?></p>
                <span id="readerLevelBadge" class="level-badge" style="display:none;"></span>
              </div>
            <div class="stats-mini" style="margin-left: auto; text-align: right; min-width: 160px;">
              <div style="font-size: 14px; margin-bottom: 5px; font-weight: 500;">Livros Ativos: <b id="statCount">0</b>/3</div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div id="loanProgressBar" style="width: 0%; height: 100%; background: #FFC20E; transition: width 0.4s ease-out;"></div>
              </div>
            </div>
            </div>

            <!-- Catálogo de Livros -->
            <div id="bookCatalog">
              <div class="data-section">
                <div class="data-header">📚 Catálogo de Livros</div>
                <div id="booksGrid" class="grid"></div>
              </div>
            </div>

            <!-- Outros Materiais (visualização simples) -->
            <div id="materiaisOutros" style="display:none;">
              <div class="data-section">
                <div class="data-header">📁 Outros Materiais</div>
                <div style="padding: 20px;">
                  <table class="data-table" id="materiaisOutrosTable">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                      </tr>
                    </thead>
                    <tbody id="materiaisOutrosBody">
                      <!-- Carregado via JS (api_materiais.php) -->
                      <tr><td colspan="3">Carregando...</td></tr>
                    </tbody>
                  </table>
                </div>
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
                      <thead>
                        <tr>
                          <th>Livro</th>
                          <th>Empréstimo</th>
                          <th>Devolução</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </table>

              </div>
            </div>

            <!-- Configurações (resumido) -->
            <div id="configSection" style="display:none;">
                <div class="data-section">
                <div class="data-section">
                    <div class="data-header">⚙️ Configurações</div>
                    <div style="padding: 20px;">
                        <p style="margin:0; color: var(--text-light);">Área de configurações removida do escopo.</p>
                    </div>
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