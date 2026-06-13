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

// listar materiais (professor e aluno)
if (isset($_GET['action']) && $_GET['action'] === 'listar') {
  $stmt = $mysqli->prepare('SELECT IDmaterial, nome, descricao, quantidade, usuario, date_upload FROM materiais ORDER BY date_upload DESC');
  $stmt->execute();
  $res = $stmt->get_result();

  $items = [];
  while ($row = $res->fetch_assoc()) {
    $items[] = $row;
  }

  json_response(['ok' => true, 'materiais' => $items]);
}

// cadastrar material (somente professor)
if (isset($_GET['action']) && $_GET['action'] === 'cadastrar') {
  if (!isset($_SESSION['id_professor'])) {
    json_response(['ok' => false, 'error' => 'Acesso negado'], 403);
  }

  $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
  $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : null;
  $quantidade = isset($_POST['quantidade']) ? (int)$_POST['quantidade'] : 0;

  if ($nome === '' || $quantidade < 0) {
    json_response(['ok' => false, 'error' => 'Dados inválidos'], 422);
  }

  $descricaoBanco = $descricao !== '' ? $descricao : null;
  $usuario = (int)$_SESSION['id_professor'];

  $stmt = $mysqli->prepare('INSERT INTO materiais (nome, descricao, quantidade, usuario, date_upload) VALUES (?, ?, ?, ?, NOW())');
  $stmt->bind_param('ssii', $nome, $descricaoBanco, $quantidade, $usuario);


  if (!$stmt->execute()) {
    json_response(['ok' => false, 'error' => $mysqli->error], 500);
  }

  json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Ação inválida'], 400);

