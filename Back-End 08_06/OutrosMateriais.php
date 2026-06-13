<?php
// Render simples (opcional). Mantido para compatibilidade se o Front-End quiser navegar.
include('conexao.php');
include('protect.php');

$materiais = [];
$stmt = $mysqli->prepare('SELECT IDmaterial, nome, descricao, quantidade, date_upload FROM materiais ORDER BY date_upload DESC');
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
  $materiais[] = $row;
}

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Outros Materiais</title>
  <link rel="stylesheet" href="Front-End/Styles.css">
</head>
<body>
  <h1>Outros Materiais</h1>
  <table border="1" cellpadding="8" cellspacing="0" style="width:100%;">
    <thead>
      <tr>
        <th>Nome</th>
        <th>Descrição</th>
        <th>Quantidade</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($materiais as $m): ?>
        <tr>
          <td><?php echo htmlspecialchars($m['nome']); ?></td>
          <td><?php echo htmlspecialchars((string)$m['descricao']); ?></td>
          <td><?php echo (int)$m['quantidade']; ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</body>
</html>

