// Professional Library System - Script.js
// Modular, with real persistence, loan management, professional UX

// ================= CONSTANTS & CONFIG =================
const IMAGES_PATH = 'Imagens/';
const STORAGE_VERSION = '1.0';
const OVERDUE_DAYS = 7;

// ================= DATA MODELS (Classes) =================
class Book {
  constructor(id, title, author, image, description, isbn, totalCopies, availableCopies = totalCopies) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = IMAGES_PATH + image;
    this.description = description;
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
}

class LoanManager {
  constructor() {
    this.loans = [];
    this.books = [];
    this.initBooks();
  }

  initBooks() {
    this.books = [
      new Book(1, 'Dom Casmurro', 'Machado de Assis', 'domcasmurro.png', 'Romance clássico sobre amor e traição.', '9788570011234', 5, 3),
      new Book(2, 'O Cortiço', 'Aluísio Azevedo', 'ocortico.png', 'Naturalismo brasileiro retratando cortiço.', '9788570014569', 4, 1),
      new Book(3, 'Capitães da Areia', 'Jorge Amado', 'capitaesdeareia.png', 'Aventura dos meninos de rua em Salvador.', '9788570017898', 6, 4),
      new Book(4, 'Vidas Secas', 'Graciliano Ramos', 'imagem1.png', 'Drama da família de retirantes no sertão.', '9788570012347', 3, 2)
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

// ================= GLOBAL INSTANCE =================
const library = new LoanManager();

// ================= UTILS =================
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
      if (pageType === 'aluno') showBooks();
      else carregarDashboard();
    }
    showToast('Login realizado com sucesso!');
  } else {
    showToast('Credenciais inválidas para este portal!', 'error');
  }
}

// ================= STUDENT FUNCTIONS =================
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
  const studentName = 'Admin User';  // Mock, enhance later
  const serie = '2º Ano';

  const loan = library.createLoan(studentId, studentName, serie, bookId);
  if (loan) {
    showToast(`Emprestado: ${loan.bookTitle}`);
    showBooks();  // Refresh
    showMyLoans();
  } else {
    showToast('Livro indisponível!', 'error');
  }
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

// ================= PROFESSOR FUNCTIONS =================
function carregarDashboard() {
  const stats = library.getStats();
  document.getElementById('total-emp').textContent = stats.total;
  document.getElementById('ativos').textContent = stats.active;
  document.getElementById('atrasados').textContent = stats.overdue;
  document.getElementById('devolucoes').textContent = stats.devoluToday;

  const tbody = document.querySelector('#emprestimos-table tbody');
  tbody.innerHTML = library.loans.slice(0, 8).map(loan => {
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
  }).join('');

  updateSidebarProf(0);
}

function updateSidebarProf(activeIndex) {
  // Update professor sidebar active states
  document.querySelectorAll('.sidebar li').forEach((li, i) => {
    li.classList.toggle('active', i === activeIndex);
  });
}

// Professor actions (now functional modals)
function adicionarLivro() { showModal('modalAddBook'); }
function registrarDevolucao() { showModal('modalDevolucao'); }

// ================= SEARCH =================
function setupSearch() {
  const searchAluno = document.getElementById('searchAluno');
  const searchProf = document.getElementById('searchProf');
  if (searchAluno) {
    searchAluno.oninput = (e) => debounce(() => filterBooks(e.target.value));
  }
  if (searchProf) {
    searchProf.oninput = (e) => debounce(() => filterLoans(e.target.value));
  }
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

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {
  library.loadData();

  const pageType = getCurrentPageType();
  const isLogged = localStorage.getItem('logado') === 'true';
  const userType = localStorage.getItem('tipoUsuario');

  if (isLogged && userType === pageType) {
    // Valid session for this page
    const container = document.getElementById(pageType + 'Container');
    const loginCont = document.getElementById('loginContainer');
    if (container && loginCont) {
      loginCont.style.display = 'none';
      container.style.display = 'block';
      if (pageType === 'aluno') showBooks();
      else carregarDashboard();
    }
  } else if (isLogged) {
    // Mismatch - logout
    logout();
  }

  setupSearch();

  // Close modals on outside click (add if modals exist)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) hideModal(e.target.id);
  });
});
