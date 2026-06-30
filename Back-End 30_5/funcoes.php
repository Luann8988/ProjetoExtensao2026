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
$q_alunos = isset($_GET['search_aluno']) ? $mysqli->real_escape_string($_GET['search_aluno']) : '';
$where_alunos = $q_alunos ? "WHERE nome LIKE '%$q_alunos%' OR Email LIKE '%$q_alunos%'" : "";
$sql_alunos = "SELECT * FROM alunos $where_alunos ORDER BY nome ASC";
$query_alunos = $mysqli->query($sql_alunos);

// mostrar livros
$sql_livros = "SELECT * FROM livros";
$query_livros = $mysqli->query($sql_livros) or die($mysqli->error);

// mostrar materiais
$sql_materiais = "SELECT * FROM materiais";
$query_materiais = $mysqli->query($sql_materiais) or die($mysqli->error);

// mostrar emprestimos
//$sql_emprestimos = "";
/*
$query_emprestimos = $mysqli->query("select * from emprestimos 
inner join livros on (emprestimos.FK_IDlivro = livros.IDlivro) 
inner join alunos on (emprestimos.FK_IDaluno = alunos.IDaluno)") or die($mysqli->error);
*/

// Consulta apenas para ATUALIZAR status (não será usada para exibir)
$query_atualizar = $mysqli->query("SELECT * FROM emprestimos") or die($mysqli->error);

while($emprestimo_atual = $query_atualizar->fetch_assoc()){
    if ($emprestimo_atual['atrasado'] == 1) {
        $data_devolucao = new DateTime($emprestimo_atual['data_devolucao']);
        $data_atual = new DateTime();
        if ($data_atual > $data_devolucao) {
            $mysqli->query("UPDATE emprestimos SET atrasado = 4 WHERE FK_IDaluno = " . $emprestimo_atual['FK_IDaluno'] . " AND FK_IDlivro = " . $emprestimo_atual['FK_IDlivro']);
        }
    }
}

// empréstimos ativos
$query_dashboard = $mysqli->query("SELECT * FROM emprestimos 
    INNER JOIN livros ON emprestimos.FK_IDlivro = livros.IDlivro 
    INNER JOIN alunos ON emprestimos.FK_IDaluno = alunos.IDaluno
    ORDER BY emprestimos.data_emprestimo DESC") or die($mysqli->error);

// devoluções
$query_devolucoes = $mysqli->query("SELECT * FROM emprestimos 
    INNER JOIN livros ON emprestimos.FK_IDlivro = livros.IDlivro 
    INNER JOIN alunos ON emprestimos.FK_IDaluno = alunos.IDaluno
    ORDER BY emprestimos.data_emprestimo DESC") or die($mysqli->error);
                                                                                                //ate aki

$totalemprestimos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos")->fetch_assoc()['total'];
$totalemprestimosativos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 1")->fetch_assoc()['total'];
$totalemprestimosatrasados = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 4")->fetch_assoc()['total'];
$totalemprestimosdevolvidos = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado   = 2")->fetch_assoc()['total'];
$total_solicitacoes_pendentes = $mysqli->query("SELECT COUNT(*) as total FROM emprestimos WHERE atrasado = 0")->fetch_assoc()['total'];

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

//deletar materiais
if (isset($_GET['deletar_material'])){
    $id = intval($_GET['deletar_material']);
    $sql_query = $mysqli->query("SELECT * FROM materiais WHERE IDmaterial = '$id'") or die($mysqli->error);
    if ($sql_query->num_rows > 0) {
        $arquivo = $sql_query->fetch_assoc();
        $caminhoArquivo = $arquivo['path'];
        if (file_exists($caminhoArquivo)) {
            unlink($caminhoArquivo);
        }
        $delConcluido = $mysqli->query("DELETE FROM materiais WHERE IDmaterial = '$id'") or die($mysqli->error);
        if ($delConcluido){
            echo "<script>alert('Arquivo excluído com sucesso!'); window.location.href = 'Professor.php#materiais';</script>";
            exit;
        } else {
            echo "<script>alert('Erro ao excluir arquivo do banco.');</script>";
        }
    } else {
        echo "<script>alert('Material não encontrado.');</script>";
    }
}

// 1. GESTÃO DE LIVROS: Cadastro, Edição e Exclusão
if(isset($_POST['uploadLivro']) || isset($_POST['editarLivro'])) {
    $titulo = $_POST['Titulo'];
    $autor = $_POST['Autor'];
    $descricao = $_POST['Descricao'];
    $isbn = $_POST['ISBN'];
    $quantidade = (int)$_POST['Quantidade'];
    $categoria = $_POST['Categoria'] ?? 'Geral';
    $paginas = (int)($_POST['Paginas'] ?? 0);
    $capa_url = $_POST['CapaURL'] ?? '';
    $pdf_url = $_POST['PdfURL'] ?? '';
    
    if(isset($_POST['editarLivro'])) {
        $id = intval($_POST['IDlivro']);
        // Usar prepared statements para UPDATE
        $sql = "UPDATE livros SET Titulo=?, Autor=?, Descricao=?, ISBN=?, Quantidade=?, Categoria=?, Paginas=?, CapaURL=?, PdfURL=? WHERE IDlivro=?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ssssisissi", $titulo, $autor, $descricao, $isbn, $quantidade, $categoria, $paginas, $capa_url, $pdf_url, $id);
        $msg = "atualizado";
    } else {
        // Usar prepared statements para INSERT
        $sql = "INSERT INTO livros (Titulo, Autor, Descricao, ISBN, Quantidade, Categoria, Paginas, CapaURL, PdfURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ssssisiss", $titulo, $autor, $descricao, $isbn, $quantidade, $categoria, $paginas, $capa_url, $pdf_url);
        $msg = "cadastrado";
    }

    if ($stmt->execute()) {
        echo "<script>alert('Livro $msg com sucesso!'); window.location.href = '../Front-End/Professor.html?tab=livros';</script>";
    } else {
        echo "<script>alert('Erro: " . $stmt->error . "');</script>";
    }
    $stmt->close();
    exit; // É importante sair após o processamento do formulário
}

// 2. GESTÃO DE ALUNOS: Cadastro, Edição e Exclusão
if(isset($_POST['adicionarAluno'])) {
    $nome = $mysqli->real_escape_string($_POST['nomealuno']);
    $senha = $mysqli->real_escape_string($_POST['senhaaluno']);
    $email = $mysqli->real_escape_string($_POST['emailaluno'] ?? '');

    if(isset($_POST['IDaluno'])) {
        $id = intval($_POST['IDaluno']);
        $mysqli->query("UPDATE alunos SET nome='$nome', Senha='$senha', Email='$email' WHERE IDaluno=$id");
    } else {
        $mysqli->query("INSERT INTO alunos (nome, Senha, Email) VALUES ('$nome', '$senha', '$email')");
    }
    header("Location: Professor.php#alunos");
}

if(isset($_GET['deletar_aluno'])) {
    $id = intval($_GET['deletar_aluno']);
    $mysqli->query("DELETE FROM alunos WHERE IDaluno = $id");
    header("Location: Professor.php#alunos");
}

// 3. GESTÃO DE PROFESSORES: Cadastro e Exclusão
if(isset($_POST['adicionarProfessor'])) {
    $email = $mysqli->real_escape_string($_POST['emailProfessor']);
    $senha = $mysqli->real_escape_string($_POST['senhaProfessor']);

    if(isset($_POST['IDprofessor_edit'])) {
        $id = intval($_POST['IDprofessor_edit']);
        $mysqli->query("UPDATE professores SET Email='$email', Senha='$senha' WHERE IDprofessor=$id");
    } else {
        $mysqli->query("INSERT INTO professores (Email, Senha) VALUES ('$email', '$senha')");
    }
    header("Location: Professor.php");
}

if(isset($_GET['deletar_professor'])) {
    $id = intval($_GET['deletar_professor']);
    $mysqli->query("DELETE FROM professores WHERE IDprofessor = $id");
    header("Location: Professor.php");
}

// 4. GESTÃO DE EMPRÉSTIMOS E DEVOLUÇÕES (Estoque Automático)
// Registrar Empréstimo (Confirmar que o aluno levou o livro)
if (isset($_GET['atualizar_emprestimoLivro']) && isset($_GET['atualizar_emprestimoAluno'])) {
    $idlivro = intval($_GET['atualizar_emprestimoLivro']);
    $idaluno = intval($_GET['atualizar_emprestimoAluno']);
    
    // Verifica se há estoque disponível
    $res = $mysqli->query("SELECT Quantidade FROM livros WHERE IDlivro = $idlivro");
    $livro = $res->fetch_assoc();

    if ($livro['Quantidade'] > 0) {
        // Status 1 = Emprestado. Define data de devolução para +7 dias.
        $mysqli->query("UPDATE emprestimos SET atrasado = 1, data_devolucao = DATE_ADD(CURDATE(), INTERVAL 7 DAY) WHERE FK_IDaluno = $idaluno AND FK_IDlivro = $idlivro");
        // Baixa no estoque
        $mysqli->query("UPDATE livros SET Quantidade = Quantidade - 1 WHERE IDlivro = $idlivro");
        echo "<script>alert('Empréstimo confirmado e estoque atualizado!'); window.location.href = 'Professor.php';</script>";
    } else {
        echo "<script>alert('Erro: Livro sem estoque disponível!'); window.location.href = 'Professor.php';</script>";
    }
    exit;
}

// Registrar Devolução
if (isset($_GET['devolver_livro_id']) && isset($_GET['aluno_id'])) {
    $idlivro = intval($_GET['devolver_livro_id']);
    $idaluno = intval($_GET['aluno_id']);
    
    // Status 2 = Devolvido
    $mysqli->query("UPDATE emprestimos SET atrasado = 2, data_devolucao = CURDATE() WHERE FK_IDaluno = $idaluno AND FK_IDlivro = $idlivro");
    // Retorno ao estoque
    $mysqli->query("UPDATE livros SET Quantidade = Quantidade + 1 WHERE IDlivro = $idlivro");
    
    echo "<script>alert('Devolução registrada e estoque restaurado!'); window.location.href = 'Professor.php';</script>";
    exit;
}

// Criar registro de empréstimo (Novo)
if(isset($_POST['criarEmprestimo'])) {
    $idaluno = intval($_POST['FK_IDaluno']);
    $idlivro = intval($_POST['FK_IDlivro']);
    $mysqli->query("INSERT INTO emprestimos (FK_IDaluno, FK_IDlivro, data_emprestimo, atrasado) VALUES ($idaluno, $idlivro, CURDATE(), 0)");
    header("Location: Professor.php");
    exit;
}

// Deletar livro
if (isset($_GET['deletar_livro'])){
    $id = intval($_GET['deletar_livro']);
    $sql_query = $mysqli->query("SELECT * FROM livros WHERE IDlivro = '$id'") or die($mysqli->error);
    if ($sql_query->num_rows > 0) {
        $delConcluido = $mysqli->query("DELETE FROM livros WHERE IDlivro = '$id'") or die($mysqli->error);
        if ($delConcluido){
            echo "<script>alert('Livro excluído com sucesso!'); window.location.href = 'Professor.php#livros';</script>";
            exit;
        } else {
            echo "<script>alert('Erro ao excluir livro do banco.');</script>";
        }
    } else {
        echo "<script>alert('Livro não encontrado.');</script>";
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

// Aleterar status do empréstimo para "pego", adicionando a data de devolução (7 dias depois do empréstimo)
if (isset($_GET['atualizar_emprestimoLivro']) && isset($_GET['atualizar_emprestimoAluno'])) {
    $idlivro = intval($_GET['atualizar_emprestimoLivro']);
    $idaluno = intval($_GET['atualizar_emprestimoAluno']);
    
    // Prepara a consulta
    $stmt = $mysqli->prepare(
"UPDATE emprestimos SET atrasado = 1, data_devolucao = DATE_ADD(CURDATE(), INTERVAL 7 DAY) WHERE FK_IDaluno = ? AND FK_IDlivro = ?"   );
    if ($stmt === false) {
        die("Erro na preparação: " . $mysqli->error);
    }
    
    // Liga os parâmetros (i = inteiro, dois parâmetros)
    $stmt->bind_param("ii", $idaluno, $idlivro);
    
    // Executa
    if ($stmt->execute()) {
        echo "<script>alert('Empréstimo atualizado com sucesso!'); window.location.href = 'Professor.php';</script>";
        exit;
    } else {
        echo "<script>alert('Erro ao atualizar: " . $stmt->error . "');</script>";
    }
    
    $stmt->close();
}

// Deletar empréstimos usando prepared statement
if (isset($_GET['deletar_emprestimoLivro']) && isset($_GET['deletar_emprestimoAluno'])) {
    $idlivro = intval($_GET['deletar_emprestimoLivro']);
    $idaluno = intval($_GET['deletar_emprestimoAluno']);
    
    // Prepara a consulta
    $stmt = $mysqli->prepare("DELETE FROM emprestimos WHERE FK_IDaluno = ? AND FK_IDlivro = ?");
    if ($stmt === false) {
        die("Erro na preparação: " . $mysqli->error);
    }
    
    // Liga os parâmetros (i = inteiro, dois parâmetros)
    $stmt->bind_param("ii", $idaluno, $idlivro);
    
    // Executa
    if ($stmt->execute()) {
        echo "<script>alert('Empréstimo deletado com sucesso!'); window.location.href = 'Professor.php';</script>";
        exit;
    } else {
        echo "<script>alert('Erro ao deletar: " . $stmt->error . "');</script>";
    }
    
    $stmt->close();
}