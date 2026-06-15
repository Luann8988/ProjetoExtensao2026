<?php
session_start();
include('conexao.php');
include('protect.php');

header('Content-Type: application/json');

function json_response($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}

$action = $_GET['action'] ?? '';

// Exclusão de livro (somente professor)
if ($action === 'excluir') {
  if (!isset($_SESSION['id_professor'])) {
    json_response(['ok' => false, 'error' => 'Acesso negado'], 403);
  }

  $id = isset($_POST['id']) ? (int)$_POST['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
  if ($id <= 0) {
    json_response(['ok' => false, 'error' => 'ID inválido'], 422);
  }

  // IMPORTANTE: remove do banco a entidade livro.
  // Se houver FKs em outras tabelas, ajuste necessário pode ser requerido.
  $stmt = $mysqli->prepare('DELETE FROM livros WHERE IDlivro = ?');
  $stmt->bind_param('i', $id);

  if (!$stmt->execute()) {
    json_response(['ok' => false, 'error' => 'Falha ao excluir: ' . $mysqli->error], 500);
  }

  json_response(['ok' => true]);
}

// Listagem simples (útil para recarregar tela) - pode ser usado depois
if ($action === 'listar') {
  $termo = isset($_GET['q']) ? trim($_GET['q']) : '';
  $where = '';
  $params = [];
  $types = '';

  if ($termo !== '') {
    $where = 'WHERE Titulo LIKE ? OR Autor LIKE ?';
    $like = '%' . $termo . '%';
    $params = [$like, $like];
    $types = 'ss';
  }

  $sql = "SELECT IDlivro, Titulo, Autor, Descricao, ISBN, Quantidade, Categoria FROM livros $where ORDER BY IDlivro DESC";
  if ($types) {
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
  } else {
    $res = $mysqli->query($sql);
  }

  $items = [];
  if ($res) {
    while ($row = $res->fetch_assoc()) {
      $items[] = $row;
    }
  }

  json_response(['ok' => true, 'livros' => $items]);
}

json_response(['ok' => false, 'error' => 'Ação inválida'], 400);

