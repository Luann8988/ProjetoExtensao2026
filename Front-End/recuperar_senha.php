<?php
include('funcoes.php'); // Agora está na mesma pasta
define("ADMIN_EMAIL", "admin@suaescola.com"); // E-mail do administrador para receber as solicitações

// Importa as classes do PHPMailer para o namespace global
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Carrega o autoloader do Composer

$etapa = 1;
$erro = '';
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Recuperação de Senha | Biblioteca</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="login-body">
    <div id="professorContainer">
        <header>
            <div class="header-left">
                <img src="Imagens/imagem3.png" class="logo">
                <div class="titulo-escola">Escola Estadual <br><strong>Prof. Gonçalves Couto</strong></div>
            </div>
            <a href="../Front-End/Index.html" class="btn-logout" style="text-decoration: none;">Voltar ao Início</a>
        </header>

        <main style="display: flex; justify-content: center; align-items: center; padding: 40px 20px;">
            <div class="login-container" style="min-height: auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.4); width: 100%; max-width: 450px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <i class="fas fa-key fa-2x" style="color: #FFC20E; margin-bottom: 10px;"></i>
                    <h2 style="color: white; font-size: 24px; margin: 0;">Redefinir Senha</h2>
                </div>

                <?php if ($erro): ?><p class="error-message" style="display:block;"><?= $erro ?></p><?php endif; ?>
                <?php if ($sucesso): ?><p style="background: #10b981; color: white; padding: 12px; border-radius: 8px; text-align: center; font-weight: 500;"><?= $sucesso ?></p><?php endif; ?>

                <?php if ($etapa === 1): ?>
                    <form action="recuperar_senha.php" method="POST" class="modern-form" style="background: transparent; padding: 0; box-shadow: none; width: 100%;">
                        <p style="font-size: 14px; color: #FFC20E; margin-bottom: 20px; text-align: center;">Informe sua matrícula para enviarmos uma solicitação de redefinição ao administrador.</p>
                        <div class="form-group"><input type="text" name="matricula" placeholder="Número da Matrícula" required></div>
                        <button type="submit" name="solicitar_redefinicao" class="btn-primary w-100">Solicitar Redefinição</button>
                    </form>
                <?php elseif ($etapa === 2): ?>
                    <form action="recuperar_senha.php" method="POST" class="modern-form" style="background: transparent; padding: 0; box-shadow: none; width: 100%;">
                        <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px; text-align: center;">Matrícula <strong><?= htmlspecialchars($_SESSION['reset_matricula']) ?></strong>. Defina sua nova senha.</p>
                        <div class="form-group"><input type="password" name="nova_senha" id="nova_senha" placeholder="Nova Senha" required onkeyup="verificarForcaSenha()"></div>
                        <div class="form-group"><input type="password" name="confirmar_senha" placeholder="Confirmar Nova Senha" required></div>
                        
                        <div id="password-strength-meter" style="width: 100%; height: 8px; background: #334155; border-radius: 5px; margin-top: 5px; margin-bottom: 5px; overflow: hidden;">
                            <div id="password-strength-bar" style="height: 100%; width: 0; transition: all 0.3s ease;"></div>
                        </div>
                        <p id="password-strength-text" style="font-size: 12px; text-align: center; margin-bottom: 20px; color: #94a3b8; height: 16px; font-weight: 500;"></p>

                        <button type="submit" name="redefinir_senha" class="btn-primary w-100">Salvar Nova Senha</button>
                    </form>
                <?php elseif ($etapa === 3): ?>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="../Front-End/Index.html" class="btn-secondary" style="text-decoration: none; display: inline-block; padding: 12px 25px;">Voltar ao Início</a>
                    </div>
                <?php endif; ?>
            </div>
        </main>

        <footer class="main-footer">
            <div class="footer-bottom">
                &copy; 2026 <strong>Biblioteca Escolar</strong> - Escola Estadual Professor Gonçalves Couto. Muriaé-MG.
            </div>
        </footer>
    </div>
    <script src="Script.js"></script>
</body>
</html>
