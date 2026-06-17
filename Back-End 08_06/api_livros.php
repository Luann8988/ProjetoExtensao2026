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

// ===================== BUSCA POR ISBN (Google Books) =====================
if ($action === 'buscar_por_isbn') {
  $googleApiKey = 'AIzaSyAXkFHczitsFeFVQpboxTgdms532i0q_A4';

  $isbn = $_GET['isbn'] ?? '';
  $isbn = trim($isbn);

  if ($isbn === '') {
    json_response(['ok' => false, 'error' => 'ISBN inválido'], 422);
  }

  $query = 'isbn:' . $isbn;
  $url = 'https://www.googleapis.com/books/v1/volumes?q=' . urlencode($query) . '&maxResults=1&key=' . urlencode($googleApiKey);

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);
  $raw = curl_exec($ch);
  $err = curl_error($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($raw === false) {
    json_response(['ok' => false, 'error' => 'Falha de rede: ' . $err], 500);
  }

  $data = json_decode($raw, true);
  if (!is_array($data)) {
    json_response(['ok' => false, 'error' => 'Resposta inválida da API do Google'], 502);
  }

  if (isset($data['totalItems']) && intval($data['totalItems']) > 0 && isset($data['items'][0]['volumeInfo'])) {
    $v = $data['items'][0]['volumeInfo'];

    $title = $v['title'] ?? '';
    $authors = $v['authors'] ?? [];
    $author = is_array($authors) ? implode(', ', $authors) : (string)$authors;
    $description = $v['description'] ?? '';
    $categories = $v['categories'] ?? [];
    $category = (is_array($categories) && count($categories) > 0) ? (string)$categories[0] : 'Geral';
    $thumbnail = $v['imageLinks']['thumbnail'] ?? '';

    json_response([
      'ok' => true,
      'titulo' => $title,
      'autor' => $author,
      'descricao' => $description,
      'categoria' => $category,
      'thumbnail' => $thumbnail,
      'isbn' => $isbn,
    ]);
  }

  json_response(['ok' => false, 'error' => 'Nenhum livro encontrado para este ISBN'], 404);
}

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

