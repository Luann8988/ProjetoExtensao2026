<?php/*
if (!isset($_SESSION)) {
    session_start();
}

// Verifica se tem alguma das duas sessões ativas e se naõ tiver, ela manda para o index
if (!isset($_SESSION['id_aluno']) && !isset($_SESSION['id_professor'])) {
    header("Location: Index.php");
    exit;
}
/*
// 2 ver
if (!function_exists("protect")) {
    function protect() {
        if (!isset($_SESSION)) {
            session_start();
        }

        if (!isset($_SESSION['id_aluno']) && !isset($_SESSION['id_professor'])) {
            header("Location: Index.php");
            exit;
        }
    }
}
*/