
const IMAGES_PATH = 'Imagens/';
const STORAGE_VERSION = '1.1'; /* v1.1: PDF + professores */
const OVERDUE_DAYS = 7;

class Book {
constructor(id, title, author, image, pdfUrl, description, isbn, totalCopies, availableCopies = totalCopies) {
    this.id = id;
    this.title = title;
    this.author = author;
  this.image = IMAGES_PATH + image;
  this.pdfUrl = pdfUrl ? IMAGES_PATH + pdfUrl : null;
  /* Campo PDF pronto para uso */
    this.isbn = isbn;
    this.totalCopies = totalCopies;
    this.availableCopies = availableCopies;
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

  /* Verifica se livro tem PDF disponível */
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
      new Book(1, 'Dom Casmurro', 'Machado de Assis', 'domcasmurro.png', 'domcasmurro.pdf', 'Romance clássico sobre amor e traição.', '9788570011234', 5, 3), /* PDF adicionado */
      new Book(2, 'O Cortiço', 'Aluísio Azevedo', 'ocortico.png', 'ocortico.pdf', 'Naturalismo brasileiro retratando cortiço.', '9788570014569', 4, 1), /* PDF adicionado */
      new Book(3, 'Capitães da Areia', 'Jorge Amado', 'capitaesdeareia.png', 'Aventura dos meninos de rua em Salvador.', '9788570017898', 6, 4),
      new Book(4, 'Vidas Secas', 'Graciliano Ramos', 'Vidas Secas.jpg', 'Drama da família de retirantes no sertão.', '9788570012347', 3, 2),
      new Book(5, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'memorias.jpg', 'Narrativa inovadora do defunto-autor.', '9788570015678', 5, 5),
      new Book(6, 'A Moreninha', 'Joaquim Manuel de Macedo', 'Morena.jpg', 'Romance romântico ambientado no Rio.', '9788570018901', 4, 2),
      new Book(7, 'O Primo Basílio', 'José Maria de Eça de Queirós', 'Primo basílio.jpg', 'Crítica social e adultério em Lisboa.', '9788570013458', 5, 3),
      new Book(8, 'A Escrava Isaura', 'Bernardo Guimarães', 'isaura.png', 'Romance abolicionista sobre Isaura.', '9788570016789', 4, 1),
      new Book(9, 'Senhora', 'José de Alencar', 'senhora.png', 'Romance urbano sobre amor e dinheiro.', '9788570019012', 6, 4),
      new Book(10, 'O Guarani', 'José de Alencar', 'guarani.png', 'Romance indianista ambientado no Brasil colonial.', '9788570010123', 5, 5),
      new Book(11, 'Iracema', 'José de Alencar', 'iracema.png', 'Romance indianista sobre a origem do Ceará.', '9788570012345', 4, 2),
      new Book(12, 'O Mulato', 'Aluísio Azevedo', 'mulato.png', 'Naturalismo sobre racismo e sociedade.', '9788570016780', 3, 1),
      new Book(13, 'A Luneta Mágica', 'Machado de Assis', 'luneta.png', 'Conto fantástico sobre visão e realidade.', '9788570018900', 5, 4),
      new Book(14, 'O Seminarista', 'Bernardo Guimarães', 'seminarista.png', 'Romance sobre dilemas morais e amorosos.', '9788570015670', 4, 2),
      new Book(15, 'O Primo Basílio', 'José Maria de Eça de Queirós', 'basilio.png', 'Crítica social e adultério em Lisboa.', '9788570013458', 5, 3),
      new Book(16, 'A Escrava Isaura', 'Bernardo Guimarães', 'isaura.png', 'Romance abolicionista sobre Isaura.', '9788570016789', 4, 1),
      new Book(17, 'Senhora', 'José de Alencar', 'senhora.png', 'Romance urbano sobre amor e dinheiro.', '9788570019012', 6, 4),
      new Book(18, 'O Guarani', 'José de Alencar', 'guarani.png', 'Romance indianista ambientado no Brasil colonial.', '9788570010123', 5, 5)
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

  saveData() {
    localStorage.setItem('libraryData_v' + STORAGE_VERSION, JSON.stringify({
      books: this.books,
      loans: this.loans
    }));
  }

  loadData() {
    const data = localStorage.getItem('libraryData_v' + STORAGE_VERSION);
    if (data) {
      const parsed = JSON.parse(data);
      this.books.forEach((book, i) => Object.assign(book, parsed.books[i]));
      this.loans = parsed.loans || [];
    } else {
      this.saveData();
    }
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

function getCurrentPageType() {
  const title = document.title.toLowerCase();
  if (title.includes('aluno')) return 'aluno';
  if (title.includes('professor')) return 'professor';
  return 'index';
}

function logout() {
  localStorage.clear();
  window.location.href = 'Index.html';
}

// ================= MODALS =================
function showModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ================= LOGIN =================
function login(e) {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const pageType = getCurrentPageType();

  if ((usuario === 'admin' && senha === '1234' && pageType === 'aluno') ||
      (usuario === 'professor' && senha === '1234' && pageType === 'professor')) {

    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipoUsuario', pageType);
    localStorage.setItem('studentId', usuario);  // for aluno

    library.loadData();

    const container = document.getElementById(pageType + 'Container');
    const loginCont = document.getElementById('loginContainer');
    if (container && loginCont) {
      loginCont.style.display = 'none';
      container.style.display = 'block';
      if (pageType === 'aluno') afterStudentLogin();
      else carregarDashboard();
    }
    showToast('Login realizado com sucesso!');
  } else {
    showToast('Credenciais inválidas para este portal!', 'error');
  }
}

function afterStudentLogin() {
  const profile = localStorage.getItem('studentProfile');
  if (profile) {
    const {name, serie, avatarSeed} = JSON.parse(profile);
    document.getElementById('headerUserName').textContent = `Olá, ${name}!`;
    document.getElementById('headerUserSerie').textContent = serie;
    document.getElementById('headerAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    document.getElementById('headerAvatar').style.display = 'block';
  }
  setupStudentProfile();
  showBooks();
}

function loadProfileHeader() {
  const profile = localStorage.getItem('studentProfile');
  if (profile) {
    const {name, serie, avatarSeed} = JSON.parse(profile);
    document.getElementById('headerUserName').textContent = `Olá, ${name}!`;
    document.getElementById('headerUserSerie').textContent = serie;
    document.getElementById('headerAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    document.getElementById('headerAvatar').style.display = 'block';
  }
}

function showProfile() {
  showModal('modalStudentProfile');
}


function setupStudentProfile() {
  const profileSaved = localStorage.getItem('studentProfile');
  if (!profileSaved) {
    showModal('modalStudentProfile');
  }
}

function showHistory() {
  const studentId = localStorage.getItem('studentId');
  const history = library.loans.filter(l => l.studentId === studentId && l.status.includes('returned'));
  const tbody = document.querySelector('#historyTable tbody');
  tbody.innerHTML = history.map(loan => `
    <tr>
      <td>${loan.bookTitle}</td>
      <td>${loan.dataEmp}</td>
      <td>${loan.dataDevolucao || 'Pendente'}</td>
      <td>${loan.status.replace('_returned', '')}</td>
    </tr>
  `).join('');

  document.getElementById('bookCatalog').style.display = 'none';
  document.getElementById('myLoansSection').style.display = 'none';
  document.getElementById('historySection').style.display = 'block';
  updateSidebar(2);
}



// ================= STUDENT FUNCTIONS =================
function setupStudentProfile() {
  const profileSaved = localStorage.getItem('studentProfile');
  if (!profileSaved) {
    showModal('modalStudentProfile');
  }
}

function selectAvatar(img) {
  document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
  img.classList.add('selected');
  const seed = img.dataset.seed;
  document.getElementById('avatarPreview').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  document.getElementById('avatarPreview').style.display = 'block';
  localStorage.setItem('selectedAvatarSeed', seed); // temp until save
}

function saveStudentProfile(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const serie = document.getElementById('profileSerie').value.trim();
  const avatarSeed = localStorage.getItem('selectedAvatarSeed') || 'student1';
  if (name && serie) {
    const profile = {name, serie, avatarSeed};
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    localStorage.setItem('studentName', name);
    localStorage.setItem('studentSerie', serie);
    localStorage.setItem('studentAvatar', `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`);
    hideModal('modalStudentProfile');
    showToast('Perfil Netflix salvo! 🎉');
  } else {
    showToast('Preencha todos os campos!', 'error');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.addEventListener('submit', saveStudentProfile);
});

function getStudentInfo() {
  const profile = localStorage.getItem('studentProfile');
  return profile ? JSON.parse(profile) : {name: 'Aluno Não Identificado', serie: 'N/A'};
}

function afterStudentLogin() {
  setupStudentProfile();
  showBooks();
}


function showBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  grid.innerHTML = library.books.map(book => `
    <div class="card">
      <img src="${book.image}" alt="${book.title}" class="capa">
      <div class="card-content">
        <h3>${book.title}</h3>
        <p><strong>${book.author}</strong></p>
        <p>${book.description}</p>
        <span class="categoria">${book.availableCopies}/${book.totalCopies} disponíveis</span>
        <button class="btn-emprestar" ${!book.canLoan() ? 'disabled' : ''} onclick="emprestarLivro(${book.id})">Emprestar</button>
      </div>
    </div>
  `).join('');

  updateSidebar(0);
}


function emprestarLivro(bookId) {
  const studentId = localStorage.getItem('studentId');
  const {name: studentName, serie} = getStudentInfo();

  const loan = library.createLoan(studentId, studentName, serie, bookId);
  if (loan) {
    showToast(`Emprestado: ${loan.bookTitle}`);
    showBooks();  // Refresh
    showMyLoans();
  } else {
    showToast('Livro indisponível!', 'error');
  }
}


function showConfiguracoes() {
  document.querySelectorAll('.dashboard-content > div').forEach(div => div.style.display = 'none');
  document.getElementById('configSection').style.display = 'block';
  updateSidebar(3);
}

function showMyLoans() {
  const studentId = localStorage.getItem('studentId');
  const myLoans = library.getStudentLoans(studentId);
  const tbody = document.querySelector('#myLoansTable tbody');
  tbody.innerHTML = myLoans.map(loan => {
    const statusClass = library.isOverdue(loan) ? 'status-overdue' : 'status-active';
    return `
      <tr>
        <td>${loan.bookTitle}</td>
        <td>${loan.dataEmp}</td>
        <td>${loan.dataDev}</td>
        <td><span class="${statusClass}">${loan.status.toUpperCase()}</span></td>
        <td><button class="btn-secondary" onclick="devolverLivro(${loan.id})">Devolver</button></td>
      </tr>
    `;
  }).join('');

  document.getElementById('bookCatalog').style.display = 'none';
  document.getElementById('myLoansSection').style.display = 'block';
  updateSidebar(1);
}


function devolverLivro(loanId) {
  if (library.returnLoan(loanId)) {
    showToast('Livro devolvido com sucesso!');
    showBooks();
    showMyLoans();
  } else {
    showToast('Erro ao devolver!', 'error');
  }
}

function updateSidebar(activeIndex) {
  document.querySelectorAll('.sidebar li').forEach((li, i) => {
    li.classList.toggle('active', i === activeIndex);
  });
}

function carregarDashboard() {
  const stats = library.getStats();
  document.getElementById('total-emp').textContent = stats.total;
  document.getElementById('ativos').textContent = stats.active;
  document.getElementById('atrasados').textContent = stats.overdue;
  document.getElementById('devolucoes').textContent = stats.devoluToday;

  const tbody = document.querySelector('#emprestimos-table tbody');
  tbody.innerHTML = library.loans.slice(-8).map(loan => {
    const statusClass = library.isOverdue(loan) ? 'status-overdue' : 'status-active';
    return `
      <tr>
        <td>${loan.codigo}</td>
        <td>${loan.studentName}</td>
        <td>${loan.serie}</td>
        <td>${loan.bookTitle}</td>
        <td>${loan.dataEmp}</td>
        <td>${loan.dataDev}</td>
        <td><span class="${statusClass}">${loan.status.toUpperCase()}</span></td>
      </tr>
    `;
  }).reverse().join('');

  updateSidebarProf(0);
}


function updateSidebarProf(activeIndex) {
  // Update professor sidebar active states
  document.querySelectorAll('.sidebar li').forEach((li, i) => {
    li.classList.toggle('active', i === activeIndex);
  });
}

function adicionarLivro() {
  showModal('modalAddBook');
}

function addBookHandler(e) {
  e.preventDefault();
  const title = document.getElementById('newTitle').value;
  const author = document.getElementById('newAuthor').value;
  const image = document.getElementById('newImage').value;
  const desc = document.getElementById('newDesc').value;
  const isbn = document.getElementById('newIsbn').value;
  const copies = parseInt(document.getElementById('newCopies').value);

  const newId = library.books.length + 1;
  const newBook = new Book(newId, title, author, image, desc, isbn, copies);
  library.books.push(newBook);
  library.saveData();
  hideModal('modalAddBook');
  showToast('Livro adicionado com sucesso!');
  carregarDashboard();
}

function registrarDevolucao() {
  showModal('modalDevolucao');
  loadReturnLoans();
}

function loadReturnLoans() {
  const activeLoans = library.loans.filter(l => l.status === 'active');
  const list = document.getElementById('returnLoansList');
  const searchReturn = document.getElementById('searchReturn');
  
  function filterLoans() {
    const term = searchReturn.value.toLowerCase();
    const filtered = activeLoans.filter(loan => 
      loan.codigo.toLowerCase().includes(term) || 
      loan.studentName.toLowerCase().includes(term) ||
      loan.serie.toLowerCase().includes(term) ||
      loan.bookTitle.toLowerCase().includes(term)
    );
    list.innerHTML = filtered.map(loan => `
      <div class="loan-item">
        <strong>${loan.codigo}</strong> - ${loan.studentName} (${loan.serie}) - ${loan.bookTitle}
        <span class="status-${library.isOverdue(loan) ? 'overdue' : 'active'}">${library.isOverdue(loan) ? 'Atrasado' : 'Ativo'}</span>
        <button onclick="returnLoanProf(${loan.id})" class="btn-secondary">Devolver</button>
      </div>
    `).join('') || '<p style="text-align: center; color: var(--text-light);">Nenhum empréstimo ativo encontrado</p>';
  }
  
  searchReturn.oninput = debounce(filterLoans);
  filterLoans();
}

function loadAlunosSection() {
  // Modal gerenciar alunos
  showToast('Gerenciador alunos: Lista + bloqueio + detalhes');
  console.log('Alunos ativos:', library.loans.map(l => l.studentId).filter((id, idx, arr) => arr.indexOf(id) === idx));
}

function gerenciarLivros() {
  // Lista todos livros + editar + remover
  const livrosInfo = library.books.map(b => `${b.title} (${b.availableCopies}/${b.totalCopies})`).join('\\n');
  console.log('Livros atuais:\\n' + livrosInfo);
  showToast('Gerenciar Livros: Editar estoque/remover');
}

function registrarDevolucao() {
  showModal('modalDevolucao');
  loadReturnLoans();
}

function exportRelatorio() {
  const stats = library.getStats();
  const csv = [
    ['Relatório Biblioteca', new Date().toLocaleDateString('pt-BR')],
    [],
    ['Total', stats.total],
    ['Ativos', stats.active],
    ['Atrasados', stats.overdue],
    ['Devoluções hoje', stats.devoluToday],
    [],
    ['Código', 'Aluno', 'Série', 'Livro', 'Emp.', 'Dev.', 'Status'],
    ...library.loans.map(l => [
      l.codigo, l.studentName, l.serie, l.bookTitle, l.dataEmp, l.dataDev, l.status
    ])
  ].map(row => row.map(cell => `"${String(cell)}"`).join(',')).join('\\n');
  
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `biblioteca_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📊 Relatório CSV exportado!');
}

function adicionarLivro() {
  showModal('modalAddBook');
}


function gerenciarLivros() {
  showToast('Gerenciar livros avançado em desenvolvimento', 'info');

  function configuracoes() {
    showToast('Configurações em desenvolvimento', 'info');
  }
}




function returnLoanProf(loanId) {
  if (confirm('Confirmar devolução?')) {
    library.returnLoan(loanId);
    showToast('Devolução registrada!');
    hideModal('modalDevolucao');
    carregarDashboard();
  }
}

function exportRelatorio() {
  const stats = library.getStats();
  const csv = [
    ['Relatório Biblioteca', new Date().toLocaleDateString('pt-BR')],
    [],
    ['Total Empréstimos', stats.total],
    ['Ativos', stats.active],
    ['Atrasados', stats.overdue],
    ['Devoluções Hoje', stats.devoluToday],
    [],
    ...library.loans.map(l => [
      l.codigo, l.studentName, l.serie, l.bookTitle, l.dataEmp, l.dataDev, l.status
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\\n');
  
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_biblioteca_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('Relatório exportado!');
}


// ================= SEARCH =================
function setupSearch() {
  const searchAluno = document.getElementById('searchAluno');
  const searchProf = document.getElementById('searchProf');
  if (searchAluno) {
    searchAluno.oninput = (e) => debounce(() => filterBooks(e.target.value));
  }
  if (searchProf) {
    searchProf.oninput = (e) => debounce(() => filterLoansProf(e.target.value));
  }
}

function filterLoansProf(term) {
  term = term.toLowerCase();
  document.querySelectorAll('#emprestimos-table tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}


function filterBooks(term) {
  term = term.toLowerCase();
  document.querySelectorAll('#booksGrid .card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = title.includes(term) || card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
  });
}

function filterLoans(term) {
  term = term.toLowerCase();
  document.querySelectorAll('#emprestimos-table tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

// Sidebar universal handler
function initSidebar() {
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.addEventListener('click', function() {
      const index = Array.from(this.parentNode.children).indexOf(this);
      document.querySelectorAll('.sidebar li').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      if (getCurrentPageType() === 'professor') {
        // Professor logic
      } else {
        if (index === 0) showBooks();
        else if (index === 1) showMyLoans();
        else if (index === 2) showHistory();
        else if (index === 3) showConfiguracoes();
      }
    });
  });
}


document.addEventListener('DOMContentLoaded', function() {
  library.loadData();

  const addBookForm = document.getElementById('addBookForm');
  if (addBookForm) addBookForm.addEventListener('submit', addBookHandler);
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.addEventListener('submit', saveStudentProfile);

  initSidebar();
  setupSearch();

  const pageType = getCurrentPageType();
  const isLogged = localStorage.getItem('logado') === 'true';
  const userType = localStorage.getItem('tipoUsuario');

  if (isLogged && userType === pageType) {
    const container = document.getElementById(pageType + 'Container');
    const loginCont = document.getElementById('loginContainer');
    if (container && loginCont) {
      loginCont.style.display = 'none';
      container.style.display = 'block';
      if (pageType === 'aluno') afterStudentLogin();
      else carregarDashboard();
    }
  } else if (isLogged) {
    logout();
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) hideModal(e.target.id);
  });
});
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    alert('Modo escuro alternado!');
}

function openHelp() {
    alert('Aqui você encontrará informações de ajuda.');
}

function submitSuggestion() {
    const suggestion = document.getElementById('suggestionInput').value;
    if(suggestion.trim() === "") {
        alert("Digite uma sugestão antes de enviar!");
        return;
    }
    alert("Sugestão enviada: " + suggestion);
    document.getElementById('suggestionInput').value = "";
}

function submitFeedback() {
    const feedback = document.getElementById('feedbackInput').value;
    if(feedback.trim() === "") {
        alert("Digite um feedback antes de enviar!");
        return;
    }
    alert("Feedback enviado: " + feedback);
    document.getElementById('feedbackInput').value = "";
}

function showProfile() {
    alert("Funcionalidade de edição de perfil em desenvolvimento!");
}


