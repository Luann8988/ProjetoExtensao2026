<?php

include ("conexao.php");

if (isset($_GET['deletar'])){
    $id = intval($_GET['deletar']);
    $sql_query = $mysqli->query("SELECT * FROM materiais WHERE id = '$id'") or die($mysqli->error);
    $arquivo = $sql_query->fetch_assoc();
    $caminhoArquivo = $arquivo['path'];

    if (file_exists($caminhoArquivo)){//verifica se arquivo existe
        unlink($caminhoArquivo);//exclui o arquivo do servidor
        $dellComcluido = $mysqli->query("DELETE FROM materiais WHERE id = '$id'") or die($mysqli->error);//exclui no banco de dados
        if ($dellComcluido){
            echo "<alert>arquivo excluido com sucesso</alert>";
        } else {
            echo "<p>erro ao excluir arquivo</p>";
        }
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

$sql_query = $mysqli->query("SELECT * FROM materiais") or die($mysqli->error);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>upload de materiais</title>
</head>
<body>
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
            <th>excluir</th>
        </thead>
        <tbody>
        <?php
        while($material = $sql_query->fetch_assoc()){
        ?>
        <tr>
            <td><a target="_blank" href="<?php echo $material['path']; ?>"><?php echo $material['nome']; ?></a></td>
            <td><?php echo $material['date_upload']; ?></td>
            <td><a href="upload.php?deletar=<?php echo $material['id']; ?>" onclick="return confirm('Tem certeza que deseja excluir este arquivo?')">Deletar</a></td>
        <?php
        }
        ?>
        </tbody>
    </table>
    <h1>painel do usuario ou seja aki vai ser o aluno ou do professor</h1><!--conteudo pipipipopopo-->  
    <p>seja bem vindo, <?php echo $_SESSION['nome']; ?>!</p><!--mostra q ta conectado--> 
    <p><a href="logout.php">sair</a></p><!--sair--> 
</body>
</html>