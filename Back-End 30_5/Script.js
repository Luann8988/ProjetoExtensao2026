const IMAGES_PATH = 'Imagens/';
const PDF_PATH = 'PDF/'; // Pasta para os arquivos PDF
const STORAGE_VERSION = '1.3'; 
const OVERDUE_DAYS = 7;

class Book {
  constructor(id, title, author, image, pdfUrl, description, isbn, totalCopies, availableCopies = totalCopies, category = 'Geral') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = image.startsWith('http') ? image : IMAGES_PATH + image;
    // Agora o PDF aponta para a pasta correta
    this.pdfUrl = (pdfUrl && pdfUrl.startsWith('http')) ? pdfUrl : (pdfUrl ? PDF_PATH + pdfUrl : null); 
    this.description = description;
    this.isbn = isbn;
    this.totalCopies = totalCopies;
    this.availableCopies = availableCopies;
    this.category = category;
  }

  canLoan() {
    return this.availableCopies > 0;
  }

  loanCopy() {
    if (this.canLoan()) {
      this.availableCopies--;
      return true;
    }
    return false;
  }

  returnCopy() {
    if (this.availableCopies < this.totalCopies) {
      this.availableCopies++;
      return true;
    }
    return false;
  }

  hasPdf() {
    return !!this.pdfUrl;
  }
}

class LoanManager {
  constructor() {
    this.loans = [];
    this.books = [];
    this.initBooks();
  }

  initBooks() {
    this.books = [
      new Book(1, 'Dom Casmurro', 'Machado de Assis', 'domcasmurro.png', 'domcasmurro.pdf', 'Romance clássico sobre amor e traição.', '9788570011234', 5, 3),
      new Book(2, 'O Cortiço', 'Aluísio Azevedo', 'ocortico.png', 'ocortico.pdf', 'Romance naturalista que retrata a vida em um cortiço carioca.', '9788570011235', 4, 1, 'Clássicos'),
      new Book(3, 'A Escrava Isaura', 'Bernardo Guimarães', 'escravaisaura.png', 'escravaisaura.pdf', 'Romance abolicionista que narra a luta de Isaura pela liberdade.', '9788570016789', 4, 1, 'Drama'),
      new Book(4, 'Senhora', 'José de Alencar', 'senhora.png', 'senhora.pdf', 'Romance urbano sobre amor, dinheiro e convenções sociais.', '9788570019012', 6, 4, 'Romance'),
      new Book(5, 'O Guarani', 'José de Alencar', 'guarani.png', 'guarani.pdf', 'Romance indianista ambientado no Brasil colonial.', '9788570010123', 5, 5, 'Aventura'),
      new Book(6, 'Iracema', 'José de Alencar', 'iracema.png', 'iracema.pdf', 'Romance indianista sobre a origem do Ceará.', '9788570012345', 4, 2, 'Romance'),
      new Book(7, 'O Mulato', 'Aluísio Azevedo', 'mulato.png', 'mulato.pdf', 'Romance naturalista sobre racismo e preconceito.', '9788570016780', 3, 1, 'Drama'),
      new Book(8, 'A Luneta Mágica', 'Machado de Assis', 'luneta.png', 'luneta.pdf', 'Conto fantástico sobre a percepção da realidade.', '9788570018900', 5, 4, 'Clássicos'),
      new Book(9, 'O Seminarista', 'Bernardo Guimarães', 'seminarista.png', 'seminarista.pdf', 'Romance sobre dilemas morais.', '9788570015670', 4, 2, 'Drama'),
    ];
  }

  isOverdue(loan) {
    const devDate = new Date(loan.dataDev.split('/').reverse().join('-'));
    const today = new Date();
    return (today - devDate) > (OVERDUE_DAYS * 24 * 60 * 60 * 1000);
  }

  createLoan(studentId, studentName, serie, bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book || !book.canLoan()) return null;

    const loan = {
      id: Date.now(),
      codigo: `EMPR-${Date.now().toString().slice(-4)}`,
      studentId,
      studentName,
      serie,
      bookId,
      bookTitle: book.title,
      dataEmp: new Date().toLocaleDateString('pt-BR'),
      dataDev: new Date(Date.now() + OVERDUE_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      status: 'active'
    };

    if (book.loanCopy()) {
      this.loans.push(loan);
      this.saveData();
      return loan;
    }
    return null;
  }

  returnLoan(loanId) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan || loan.status !== 'active') return false;

    const book = this.books.find(b => b.id === loan.bookId);
    loan.status = this.isOverdue(loan) ? 'overdue_returned' : 'returned';
    loan.dataDevolucao = new Date().toLocaleDateString('pt-BR');

    book.returnCopy();
    this.saveData();
    return true;
  }

  getStudentLoans(studentId) {
    return this.loans.filter(l => l.studentId === studentId);
  }

  getStats() {
    const total = this.loans.length;
    const active = this.loans.filter(l => l.status === 'active').length;
    const overdue = this.loans.filter(l => l.status === 'active' && this.isOverdue(l)).length;
    const devoluToday = this.loans.filter(l => l.status.includes('returned') && l.dataDevolucao === new Date().toLocaleDateString('pt-BR')).length;
    return { total, active, overdue, devoluToday };
  }
}

const library = new LoanManager();

let timeout;
function debounce(fn, delay = 300) {
  clearTimeout(timeout);
  timeout = setTimeout(fn, delay);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


function logout() {
  localStorage.clear();
  window.location.href = 'Index.php';// mudanca no Index.html para Index.php
}

function showModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
  document.getElementById(id).style.display = 'none';
}



function afterStudentLogin() {
  showBooks();
}

// ================= LIVROS E EMPRÉSTIMOS =================
function showBooks() {
    showSection('bookCatalog');
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    grid.innerHTML = library.books.map(book => `
        <div class="card">
            <img src="${book.image}" alt="${book.title}" class="capa">
            <div class="card-content">
                <h3>${book.title}</h3>
                <p><strong>${book.author}</strong></p>
                <p>${book.description}</p>
                <div class="actions">
                    <button class="btn-emprestar" ${!book.canLoan() ? 'disabled' : ''} onclick="emprestarLivro(${book.id})">
                        ${book.canLoan() ? 'Emprestar' : 'Esgotado'}
                    </button>
                    ${book.pdfUrl ? `<button class="btn-pdf" onclick="openPdf('${book.pdfUrl}')">Ler PDF</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    updateSidebar(0);
}

function openPdf(url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        showToast('PDF não disponível', 'error');
    }
}

function emprestarLivro(bookId) {
    const studentId = localStorage.getItem('studentId') || window.studentId;
    const studentName = localStorage.getItem('studentName') || window.studentName || "Aluno";

    const loan = library.createLoan(studentId, studentName, "N/A", bookId);
    if (loan) {
        showToast(`Emprestado: ${loan.bookTitle}`);
        showBooks();
    } else {
        showToast('Livro indisponível!', 'error');
    }
}

function showMyLoans() {
    showSection('myLoansSection');
    const studentId = localStorage.getItem('studentId');
    const myLoans = library.loans.filter(l => l.studentId === studentId && l.status === 'active');
    const tbody = document.querySelector('#myLoansTable tbody');
    if(!tbody) return;

    tbody.innerHTML = myLoans.map(loan => `
        <tr>
            <td>${loan.bookTitle}</td>
            <td>${loan.dataEmp}</td>
            <td>${loan.dataDev}</td>
            <td><button class="btn-secondary" onclick="devolverLivro(${loan.id})">Devolver</button></td>
        </tr>
    `).join('');
    updateSidebar(1);
}

function devolverLivro(loanId) {
  if (library.returnLoan(loanId)) {
    showToast('Livro devolvido!');
    showMyLoans();
  }
}

function showHistory() {
  showSection('historySection');
  const studentId = localStorage.getItem('studentId');
  const history = library.loans.filter(l => l.studentId === studentId && l.status.includes('returned'));
  const tbody = document.querySelector('#historyTable tbody');
  if(!tbody) return;

  tbody.innerHTML = history.map(loan => {
    const statusClean = loan.status.includes('overdue') ? 'Devolvido com Atraso' : 'Devolvido';
    return `
      <tr>
        <td>${loan.bookTitle}</td>
        <td>${loan.dataEmp}</td>
        <td>${loan.dataDevolucao || 'Pendente'}</td>
        <td>${statusClean}</td>
      </tr>
    `;
  }).join('');
  updateSidebar(2);
}

// ================= PROFESSOR / DASHBOARD =================
// se essa funcao n funcionar deixa quieto kk
function rolarParaSessao(sectionId, elementoClicado) {
    // 1. Remove a cor amarela (active) de todos os botões do menu
    document.querySelectorAll('.sidebar-prof li').forEach(li => {
        li.classList.remove('active');
    });

    // 2. Adiciona a cor amarela apenas no botão que foi clicado
    if (elementoClicado) {
        elementoClicado.classList.add('active');
    }

    // 3. Procura a div correspondente e rola a tela até ela suavemente
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function carregarDashboard() {
  const stats = library.getStats();
  const tEmp = document.getElementById("totalEmprestimos");
  const aEmp = document.getElementById("emprestimosAtivos");
  const atEmp = document.getElementById("emprestimosAtrasados");
  const dToday = document.getElementById("devolvidosHoje");

  if(tEmp) tEmp.textContent = stats.total;
  if(aEmp) aEmp.textContent = stats.active;
  if(atEmp) atEmp.textContent = stats.overdue;
  if(dToday) dToday.textContent = stats.devoluToday;

  const tbody = document.getElementById("dashboardTable");
  if(tbody) {
      tbody.innerHTML = library.loans.slice(-5).map(l => `
        <tr>
          <td>${l.studentName}</td>
          <td>${l.bookTitle}</td>
          <td>${l.dataEmp}</td>
          <td>${l.status}</td>
        </tr>
      `).reverse().join("");
  }
}

function navegarProfessor(sectionId, el) {
  const sections = ["dashboardSection", "alunosSection", "relatoriosSection", "livrosSection", "devolucoesSection"];
  sections.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sec.style.display = "none";
  });

  const target = document.getElementById(sectionId);
  if (target) {
      target.style.display = "block";
      target.classList.add('active');
  }

  document.querySelectorAll(".sidebar-prof li").forEach(li => li.classList.remove("active"));
  if (el) el.classList.add("active");

  if(sectionId === 'dashboardSection') carregarDashboard();
  if(sectionId === 'devolucoesSection') loadReturnLoans();
  if(sectionId === 'livrosSection') renderProfessorBooks();
}

function renderProfessorBooks() {
  const grid = document.getElementById('profBooksGrid');
  if (!grid) return;

  grid.innerHTML = library.books.map(book => `
    <div class="card">
        <img src="${book.image}" alt="${book.title}" class="capa" style="height: 150px; object-fit: cover;">
        <div class="card-content">
            <h3 style="font-size: 16px;">${book.title}</h3>
            <p style="font-size: 13px;">Disponível: <strong>${book.availableCopies}/${book.totalCopies}</strong></p>
        </div>
    </div>
  `).join('');
}

function loadReturnLoans() {
  const activeLoans = library.loans.filter(l => l.status === 'active');
  const list = document.getElementById('returnLoansList');
  if(!list) return;

  list.innerHTML = activeLoans.map(loan => `
      <div class="loan-item" style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
        <div><strong>${loan.studentName}</strong> - ${loan.bookTitle}</div>
        <button onclick="returnLoanProf(${loan.id})" class="btn-secondary">Registrar Devolução</button>
      </div>
  `).join('') || '<p>Nenhum empréstimo ativo.</p>';
}

function returnLoanProf(loanId) {
    if (confirm('Confirmar devolução?')) {
      library.returnLoan(loanId);
      showToast('Devolução registrada!');
      loadReturnLoans();
      carregarDashboard();
    }
}

function adicionarNovoLivro(event) {
    event.preventDefault();
    const titulo = document.getElementById('newTitle').value;
    const autor = document.getElementById('newAuthor').value;
    const desc = document.getElementById('newDesc').value;
    const pdf = document.getElementById('newPdf').value;
    const isbn = document.getElementById('newIsbn').value || "000-000";
    const category = document.getElementById('newCategory').value || "Geral";
    const capa = document.getElementById('newCoverUrl').value || "capa-padrao.png";
    const qty = parseInt(document.getElementById('newQty').value) || 1;

    const novoLivro = new Book(
        Date.now(), 
        titulo,
        autor,
        capa, 
        pdf, 
        desc,
        isbn,
        qty, qty,
        category
    );

    library.books.push(novoLivro);
    library.saveData(); 
    
    if (confirm("📚 Livro adicionado com sucesso!\n\nDeseja adicionar mais um livro agora?")) {
        event.target.reset(); // Limpa o formulário para o próximo livro
        const preview = document.getElementById('coverPreview');
        if (preview) preview.style.display = 'none';
        showToast('Pronto para o próximo cadastro');
    } else {
        hideModal('modalAddBook');
        renderProfessorBooks();
        carregarDashboard();
    }
}

// ================= UTILITÁRIOS DE TELA =================
function showSection(sectionId) {
    const sections = ['bookCatalog', 'myLoansSection', 'historySection', 'configSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
}

function updateSidebar(activeIndex) {
    const navItems = document.querySelectorAll('.sidebar li');
    navItems.forEach((li, i) => {
        li.classList.toggle('active', i === activeIndex);
    });
}

function setupSearch() {
  const searchAluno = document.getElementById('searchAluno');
  if (searchAluno) {
    searchAluno.oninput = (e) => debounce(() => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#booksGrid .card').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
        });
    });
  }
}



document.addEventListener('DOMContentLoaded', () => {
    library.loadData();
    setupSearch();

    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) addBookForm.addEventListener('submit', adicionarNovoLivro);

    const alunoContainer = document.getElementById('alunoContainer');
    if (alunoContainer && window.studentId) {
        afterStudentLogin();
    }

    const professorContainer = document.getElementById('professorContainer');
    if (professorContainer) {
        carregarDashboard();
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) hideModal(e.target.id);
    });

    // No final do DOMContentLoaded, após o if do aluno, adicione:
    if (document.getElementById('professorContainer')) {
        // Professor já logado via PHP, container visível
        carregarDashboard();
        // Inicializa as abas, se necessário
        loadReturnLoans();
        // Marca a aba ativa
        const activeTab = document.querySelector('.sidebar-prof .menu-item.active');
        if (activeTab) showSection(activeTab.getAttribute('onclick').match(/'(.+?)'/)[1], activeTab);
    }

    // A função logout() deve redirecionar para logout.php (que já usamos para aluno)
    function logout() {
        window.location.href = 'logout.php';
    }
});

function afterStudentLogin() {
    if (window.studentId) {
        localStorage.setItem('studentId', window.studentId);
        localStorage.setItem('studentName', window.studentName);
    }
    showBooks(); 
}

/**
 * Abre um modal com os detalhes de um livro específico.
 * @param {object} livro - O objeto do livro com todos os seus detalhes.
 */
function abrirModalLivro(livro) {
    // Preenche os campos do modal com os dados do livro
    document.getElementById('modalCapa').src = livro.CapaURL;
    document.getElementById('modalCapa').alt = `Capa do livro ${livro.Titulo}`;
    document.getElementById('modalTitulo').textContent = livro.Titulo;
    document.getElementById('modalAutor').textContent = livro.Autor;
    document.getElementById('modalDescricao').textContent = livro.Descricao || 'Descrição não disponível.';

    const disponibilidadeEl = document.getElementById('modalDisponibilidade');
    disponibilidadeEl.textContent = `Disponíveis: ${livro.Quantidade}`;

    // Botão de Empréstimo
    const btnEmprestar = document.getElementById('btnEmprestarModal');
    const disponivel = livro.Quantidade > 0;
    btnEmprestar.disabled = !disponivel;
    btnEmprestar.textContent = disponivel ? 'Solicitar Empréstimo' : 'Esgotado';
    // Define a ação do botão para submeter um formulário de empréstimo
    btnEmprestar.onclick = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'Aluno.php';
        form.innerHTML = `
            <input type="hidden" name="id_livro" value="${livro.IDlivro}">
            <input type="hidden" name="solicitar_emprestimo" value="1">
        `;
        document.body.appendChild(form);
        form.submit();
    };

    // Botão de Ler PDF
    const btnPdf = document.getElementById('btnLerPdfModal');
    btnPdf.style.display = livro.PdfURL ? 'inline-block' : 'none';
    if (livro.PdfURL) btnPdf.href = livro.PdfURL;

    // Exibe o modal
    showModal('modalDetalhesLivro');
}

/**
 * Fecha um modal pelo seu ID.
 * @param {string} modalId - O ID do modal a ser fechado.
 */
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ================== ATUALIZAÇÃO EM TEMPO REAL (PROFESSOR) ==================

let currentPendingCount = -1; // Inicia com -1 para forçar a primeira atualização

/**
 * Busca novos dados do dashboard (notificações e empréstimos) do servidor.
 */
async function fetchDashboardData() {
    try {
        const response = await fetch('api.php?action=get_dashboard_data');
        if (!response.ok) {
            console.error('Erro ao buscar dados do dashboard:', response.statusText);
            return;
        }
        const data = await response.json();

        // Se for a primeira vez, apenas define o contador inicial
        if (currentPendingCount === -1) {
            currentPendingCount = data.pending_count;
        }

        // Verifica se há novas solicitações
        if (data.pending_count > currentPendingCount) {
            playNotificationSound();
        }

        // Atualiza o contador e a lista
        currentPendingCount = data.pending_count;
        updateNotificationBadge(data.pending_count);
        updateLoansTable(data.loans);

    } catch (error) {
        console.error('Falha na requisição de atualização:', error);
    }
}

/**
 * Toca o som de notificação.
 */
function playNotificationSound() {
    const sound = document.getElementById('notification-sound');
    if (sound) {
        sound.currentTime = 0; // Reinicia o som se já estiver tocando
        sound.play().catch(e => console.error("Erro ao tocar som:", e));
    }
}

/**
 * Atualiza o número no ícone de sino.
 * @param {number} count - O número de notificações pendentes.
 */
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

/**
 * Redesenha a tabela de empréstimos com os dados mais recentes.
 * @param {Array} loans - A lista de objetos de empréstimo.
 */
function updateLoansTable(loans) {
    const tbody = document.getElementById('listaEmprestimos');
    if (!tbody) return;

    // Limpa a tabela e a preenche com os novos dados
    tbody.innerHTML = loans.map(loan => `
        <tr>
            <td>${loan.FK_IDaluno}</td>
            <td>${loan.nome}</td>
            <td>${loan.Titulo}</td>
            <td>${loan.data_emprestimo}</td>
            <td>${loan.data_devolucao || '---'}</td>
            <td><a href="Professor.php?atualizar_emprestimoLivro=${loan.IDlivro}&atualizar_emprestimoAluno=${loan.FK_IDaluno}">${loan.status_nome}</a></td>
            <td>
                ${(loan.atrasado == 1 || loan.atrasado == 4) ? `<a href="Professor.php?devolver_livro_id=${loan.IDlivro}&aluno_id=${loan.FK_IDaluno}" class="btn-primary" style="padding: 2px 5px; font-size: 11px; text-decoration: none;">Devolver</a>` : ''}
            </td>
        </tr>
    `).join('');
}

// Inicia o processo de polling se estivermos na página do professor
if (document.getElementById('professorContainer')) {
    // Chama a função a cada 10 segundos (10000 milissegundos)
    setInterval(fetchDashboardData, 10000);
}

// ================== VERIFICADOR DE FORÇA DE SENHA ==================

/**
 * Verifica a força de uma senha e atualiza a barra de progresso.
 */
function verificarForcaSenha() {
    const senha = document.getElementById('nova_senha').value;
    const forcaBarra = document.getElementById('password-strength-bar');
    const forcaTexto = document.getElementById('password-strength-text');

    let forca = 0;
    let texto = 'Muito Fraca';
    let cor = '#ef4444'; // Vermelho

    // Critérios de força
    if (senha.length >= 8) forca += 25;
    if (senha.match(/[a-z]/)) forca += 15;
    if (senha.match(/[A-Z]/)) forca += 20;
    if (senha.match(/[0-9]/)) forca += 20;
    if (senha.match(/[\W_]/)) forca += 20; // Caracteres especiais

    if (forca < 40) {
        texto = 'Fraca';
        cor = '#ef4444'; // Vermelho
    } else if (forca < 75) {
        texto = 'Média';
        cor = '#f59e0b'; // Laranja
    } else {
        texto = 'Forte';
        cor = '#10b981'; // Verde
    }

    if (senha.length === 0) {
        forca = 0;
        texto = '';
    }

    if (forcaBarra && forcaTexto) {
        forcaBarra.style.width = forca + '%';
        forcaBarra.style.backgroundColor = cor;
        forcaTexto.textContent = texto;
        forcaTexto.style.color = cor;
    }
}

// Adiciona o listener se o campo de senha existir
const campoNovaSenha = document.getElementById('nova_senha');
if (campoNovaSenha) {
    campoNovaSenha.addEventListener('keyup', verificarForcaSenha);
}

// ================== FORMULÁRIO DE CONTATO (ALUNO) ==================

async function enviarFormularioContato(event) {
    event.preventDefault();
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading"></span> Enviando...';

    const formData = new FormData(form);
    formData.append('enviar_contato_aluno', '1'); // Adiciona o gatilho para o PHP

    try {
        const response = await fetch('funcoes.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.ok) {
            showToast(result.message, 'success');
            form.reset();
        } else {
            showToast(result.error || 'Ocorreu um erro.', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão. Verifique sua internet.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Função de login para o front-end (Aluno.html e Professor.html).
 * Verifica credenciais de teste antes de tentar o login normal.
 */
async function login(event) {
    event.preventDefault();
    const form = event.target;
    const matricula = form.querySelector('#usuario').value;
    const senha = form.querySelector('#senha').value;
    const errorMessageDiv = form.querySelector('#loginErrorMessage');

    // Credenciais de teste do Aluno
    if (matricula === '98763867' && senha === '17082006') {
        // Simula o login do aluno no front-end
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('alunoContainer').style.display = 'block';
        // Você pode querer chamar funções de inicialização aqui, como showBooks()
        return;
    }

    // Credenciais de teste do Professor
    if (matricula === '8837297' && senha === '18031992') {
        // Simula o login do professor no front-end
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('professorContainer').style.display = 'block';
        // Você pode querer chamar funções de inicialização aqui, como carregarDashboard()
        return;
    }

    // Se não forem credenciais de teste, exibe um erro (ou poderia prosseguir para um login via API)
    if (errorMessageDiv) {
        errorMessageDiv.textContent = 'Matrícula ou senha inválida. Use as credenciais de teste para acesso rápido.';
        errorMessageDiv.style.display = 'block';
    }
}
