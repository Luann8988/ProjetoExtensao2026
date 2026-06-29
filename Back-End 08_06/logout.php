<?php

if (!isset($_SESSION)) {
    session_start(); //inicia a secao so pra sair dela depois
}

session_destroy();//sai, tira todas as variaveis da secao

header("Location: index.php"); //volta pro inicio
