<?php

include('conexao.php');
include('funcoes.php');

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal do Professor</title>
    <link rel="stylesheet" href="styles.css">
    <style>
    .error-message { color: red; text-align: center; margin-top: 10px; }
    </style>
</head>
<body class="login-body">

<?php if(!isset($_SESSION['id_professor'])): ?>
    <!-- TELA DE LOGIN -->
    <div id="loginContainer" class="login-container">
        <img src="Imagens/imagem3.png" class="logo" alt="Logo">
        <h2>Portal do Professor</h2>
        <?php if(isset($erro)) echo "<p class='error-message'>$erro</p>"; ?>
        <form action="" method="POST">
            <input type="email" name="email" placeholder="E-mail" required>
            <input type="password" name="senha" placeholder="Senha" required>
            <button type="submit">Entrar</button>
        </form>
    </div>
<?php else: ?>
    <!-- PAINEL COMPLETO DO PROFESSOR -->
    <div id="professorContainer">
        <header>
            <div class="header-left">
                <img src="Imagens/imagem3.png" class="logo">
                <div class="titulo-escola">
                    Escola Estadual <br>
                    <strong>Professor Gonçalves Couto</strong>
                </div>
            </div>
            <input type="text" id="searchProf" placeholder="🔍 Buscar empréstimos...">
            <button onclick="window.location.href='logout.php'" class="btn-logout">Sair</button>
        </header>
        <main>
            <aside class="sidebar-prof">
                <div class="professor-info">
                    <img src="Imagens/avatar.png" alt="Foto do Professor" class="professor-avatar">
                    <div>
                        <div class="professor-name">Prof. <?php echo htmlspecialchars($_SESSION['email_professor']); ?></div>
                        <div class="professor-role">Bibliotecário</div>
                    </div>
                </div>
                <div class="separator"></div>
                <ul>
                    <li class="menu-item active" onclick="rolarParaSessao('dashboard', this)">📊 Dashboard</li>
                    <li class="menu-item" onclick="rolarParaSessao('alunos', this)">👥 Alunos</li>
                    <li class="menu-item" onclick="rolarParaSessao('materiais', this)">📈 Materiais</li>
                    <li class="menu-item" onclick="rolarParaSessao('livros', this)">📚 Livros</li>
                    <li class="menu-item" onclick="rolarParaSessao('devolucoes', this)">🔄 Devoluções</li>
                    <?php if(isset($_SESSION['email_professor']) == "teste@teste.com") { ?>
                        <li class="menu-item" onclick="rolarParaSessao('devolucoes', this)">🤵 <?php echo htmlspecialchars($_SESSION['email_professor']); ?></li>
                    <?php
                    }
                    ?>
                </ul>
            </aside>

            <section class="dashboard-content">
                <!-- DASHBOARD -->
                <div id="dashboard" class="section active">
                    <h2 style="color:#FFC20E;">📊 Dashboard</h2>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-number">
                            <?php echo $totalemprestimos; ?>
                        </div><div class="stat-label">Total Empréstimos</div></div>
                        <div class="stat-card"><div class="stat-number">
                            <?php echo $totalemprestimosativos; ?>
                        </div><div class="stat-label">Ativos</div></div>
                        <div class="stat-card"><div class="stat-number">
                            <?php echo $totalemprestimosatrasados; ?>
                        </div><div class="stat-label">Atrasados</div></div>
                        <div class="stat-card"><div class="stat-number">
                            <?php echo $totalemprestimosdevolvidos; ?>
                        </div><div class="stat-label">Devoluções</div></div>
                    </div>
                </div>

                <!-- EMPRÉSTIMOS -->   
                <div class="data-section">
                    <div class="data-header">📋 Empréstimos Recentes</div>
                    <div id="returnLoansList" class="card">
                        <table style="width: 100%;">
                            <thead style="width: 100%;">
                                <tr>
                                    <th>Código</th>
                                    <th>Aluno</th>
                                    <th>Livro</th>
                                    <th>Solicitado em:</th>
                                    <th>Data Devolução</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaEmprestimos">
                                <?php
                                while($emprestimos = $query_dashboard->fetch_assoc()){
                                    if ($emprestimos['atrasado'] == 0 || $emprestimos['atrasado'] == 1) {
                                ?>
                                <tr>
                                    <td><a><?php echo $emprestimos['FK_IDaluno']; ?></a></td>
                                    <td><a><?php echo $emprestimos['nome']; ?></a></td>
                                    <td><a><?php echo $emprestimos['Titulo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['data_emprestimo']; ?></a></td>
                                    <td><a><?php echo $emprestimos['data_devolucao']; ?></a></td>
                                    <td>
                                        <a href="Professor.php?atualizar_emprestimoLivro=<?php echo $emprestimos['IDlivro'] . '&' . 'atualizar_emprestimoAluno=' . $emprestimos['FK_IDaluno']; ?>" onclick="return confirm('Tem certeza que deseja atualizar este emprestimo para pego?')">
                                            <?php echo nomearStatus($emprestimos['atrasado']); ?>
                                        </a>
                                    </td>
                                <?php
                                }}  
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ALUNOS -->
                <div id="alunos" class="section">
                    <div class="data-section">
                        <div class="data-header">👥 Alunos</div>
                        <div class="grid" id="alunosGrid">
                        <?php while($aluno = $query_alunos->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($aluno['nome']) ?></h3>
                                    <p>
                                        <span class="password-toggle" data-password="<?= htmlspecialchars($aluno['Senha']) ?>">••••••</span>
                                        <button type="button" class="btn-small" onclick="togglePassword(this)">Revelar</button>
                                    </p>
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                </div>

                <!-- materiais -->
                <div id="materiais" class="section">
                    <div class="data-section">
                        <div class="data-header">📈 Materiais</div>
                        <div class="data-section"><!-- Formulário de upload de materia -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <p><input type="file" name="arquivo" id="arquivo"></p>
                                <button name="uploadMaterial" type="submit">Enviar</button>
                            </form>
                        </div>
                        <div class="data-header">📱 Catálogo de Materiais</div>
                        <div class="grid">
                        <?php while($material = $query_materiais->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($material['nome']) ?></h3>
                                    <p><strong><?= htmlspecialchars($material['date_upload']) ?></strong></p>
                                    
                                    <div class="actions">
                                        <button onclick="window.open('<?php echo $material['path']; ?>', '_blank')" class="btn-secondary">
                                            Ver Detalhes
                                        </button>
                                        <a href="Professor.php?deletar_material=<?php echo $material['IDmaterial']; ?>" onclick="return confirm('Tem certeza que deseja excluir este arquivo?')">Deletar</a>
                                    </div>
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                    
                </div>

                <!-- LIVROS -->
                <div id="livros" class="section">
                    <div class="data-section"><div class="data-header">📚 Livros</div>
                        <div class="data-section"><!-- Formulário de upload de livros -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <input type="string" name="Titulo" id="Titulo" placeholder="Título" required>
                                <input type="string" name="Autor" id="Autor" placeholder="Autor" required>
                                <input type="string" name="Descricao" id="Descricao" placeholder="Descrição" required>
                                <input type="string" name="ISBN" id="ISBN" placeholder="ISBN" required>
                                <input type="int" name="Quantidade" id="Quantidade" placeholder="Quantidade" required>
                                <button name="uploadLivro" type="submit" class="btn-secondary">Cadastrar Livro</button>
                            </form>
                        </div>
                        <div class="data-header">📚 Catálogo de Livros</div>
                        <div class="grid">
                        <?php while($livro = $query_livros->fetch_assoc()): ?>
                            <div class="card book-card">
                                <div class="card-content">
                                    <h3><?= htmlspecialchars($livro['Titulo']) ?></h3>
                                    <p><strong><?= htmlspecialchars($livro['Autor']) ?></strong></p>
                                    
                                    <div class="actions">
                                        <form method="POST" action="">
                                            <input type="hidden" name="id_livro" value="<?= $livro['IDlivro'] ?>">
                                            <a href="Professor.php?deletar_livro=<?php echo $livro['IDlivro']; ?>" onclick="return confirm('Tem certeza que deseja excluir este livro?')">Deletar</a>
                                        </form>
                                    </div>
                                    
                                </div>
                            </div>
                        <?php endwhile; ?>
                        </div>
                    </div>
                </div>

                <!-- DEVOLUÇÕES -->
                <div id="devolucoes" class="section">
                    <div class="data-section">
                        <div class="data-header">🔄 Devoluções</div>
                        <div id="returnLoansList" class="card">
                            <table  style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>ID aluno</th>
                                        <th>Nome</th>
                                        <th>Livro</th>
                                        <th>Entrega</th>
                                        <th>Devolução</th>
                                        <th>Excluir</th>
                                    </tr>
                                </thead>
                                <tbody id="listaEmprestimos">
                                    <?php
                                    while($emprestimos = $query_devolucoes->fetch_assoc()){
                                        if ($emprestimos['atrasado'] == 2 || $emprestimos['atrasado'] == 3 || $emprestimos['atrasado'] == 4) {
                                    ?>
                                    <tr>
                                        <td><a><?php echo $emprestimos['FK_IDaluno']; ?></a></td>
                                        <td><a><?php echo $emprestimos['nome']; ?></a></td>
                                        <td><a><?php echo $emprestimos['Titulo']; ?></a></td>
                                        <td><a><?php echo $emprestimos['data_emprestimo']; ?></a></td>
                                        <td><a><?php echo $emprestimos['data_devolucao']; ?></a></td>
                                        <td>
                                            <a href="Professor.php?deletar_emprestimoLivro=<?php echo $emprestimos['IDlivro'] . '&' . 'deletar_emprestimoAluno=' . $emprestimos['FK_IDaluno']; ?>" onclick="return confirm('Tem certeza que deseja excluir este emprestimo?')">
                                                <?php echo nomearStatus($emprestimos['atrasado']); ?>
                                            </a>
                                        </td>
                                    </tr>
                                    <?php
                                    }}  
                                    ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <?php if(isset($_SESSION['email_professor']) == "teste@teste.com") { ?>
                <div id="livros" class="section">
                    <div class="data-section"><div class="data-header">🧑‍🏫 Adicionar professor</div>
                        <div class="data-section"><!-- Formulário de upload de livros -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <input type="email" name="emailProfessor" id="emailProfessor" placeholder="Email do Professor" required>
                                <input type="password" name="senhaProfessor" id="senhaProfessor" placeholder="Senha do Professor" required>
                                <button name="adicionarProfessor" type="submit" class="btn-secondary">Cadastrar Professor</button>
                            </form>
                        </div>
                    </div>
                    <div class="data-section"><div class="data-header">🧑‍🎓 Adicionar aluno</div>
                        <div class="data-section"><!-- Formulário de upload de livros -->
                            <form method='post' enctype="multipart/form-data" action="">
                                <input type="string" name="nomealuno" id="nomealuno" placeholder="Nome do Aluno" required>
                                <input type="password" name="senhaaluno" id="senhaaluno" placeholder="Senha do Aluno" required>
                                <button name="adicionarAluno" type="submit" class="btn-secondary">Cadastrar Aluno</button>
                            </form>
                        </div>
                    </div>
                </div>
                <?php
                }
                ?>

            </section>
        </main>
    </div>
    <script>
        window.professorId = <?php echo json_encode($_SESSION['id_professor']); ?>;
    </script>
<?php endif; ?>

<script src="Script.js"></script>
</body>
</html>