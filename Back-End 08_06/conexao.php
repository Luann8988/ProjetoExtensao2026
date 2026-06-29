<?php
$host = "localhost";
$user = "root";
$pass = "";
$bd = "EscolaEstadual"; // Alterado para o seu banco real

$mysqli = new mysqli($host, $user, $pass, $bd);

if ($mysqli->connect_error) {
    die("Conexão falhou: " . $mysqli->connect_error);
}
?>