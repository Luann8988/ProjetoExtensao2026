const IMAGES_PATH = 'Imagens/';
const PDF_PATH = 'PDF/'; // Pasta para os arquivos PDF
const STORAGE_VERSION = '1.1'; 
const OVERDUE_DAYS = 7;

class Book {
  constructor(id, title, author, image, pdfUrl, description, isbn, totalCopies, availableCopies = totalCopies) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = IMAGES_PATH + image;
    // Agora o PDF aponta para a pasta correta
    this.pdfUrl = pdfUrl ? PDF_PATH + pdfUrl : null; 
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
      new Book(2, 'O Cortiço', 'Aluísio Azevedo', 'ocortico.png', 'ocortico.pdf', 'Naturalismo brasileiro retratando cortiço.', '9788570014569', 4, 1),
      new Book(3, 'Capitães da Areia', 'Jorge Amado', 'capitaesdeareia.png', 'capitaesdeareia.pdf', 'Aventura dos meninos de rua em Salvador.', '9788570017898', 6, 4),
      new Book(4, 'Vidas Secas', 'Graciliano Ramos', 'VidasSecas.jpg', 'vidassecas.pdf', 'Drama da família de retirantes no sertão.', '9788570012347', 3, 2),
      new Book(5, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'memorias.jpg', 'memorias.pdf', 'Narrativa inovadora do defunto-autor.', '9788570015678', 5, 5),
      new Book(6, 'A Moreninha', 'Joaquim Manuel de Macedo', 'Morena.jpg', 'moreninha.pdf', 'Romance romântico ambientado no Rio.', '9788570018901', 4, 2),
      new Book(7, 'O Primo Basílio', 'Eça de Queirós', 'primobasilio.jpg', 'primobasilio.pdf', 'Crítica social e adultério em Lisboa.', '9788570013458', 5, 3),
      new Book(8, 'A Escrava Isaura', 'Bernardo Guimarães', 'escravaisaura.png', 'escravaisaura.pdf', 'Romance abolicionista sobre Isaura.', '9788570016789', 4, 1),
      new Book(9, 'Senhora', 'José de Alencar', 'senhora.png', 'senhora.pdf', 'Romance urbano sobre amor e dinheiro.', '9788570019012', 6, 4),
      new Book(10, 'O Guarani', 'José de Alencar', 'guarani.png', 'guarani.pdf', 'Romance indianista ambientado no Brasil colonial.', '9788570010123', 5, 5),
      new Book(11, 'Iracema', 'José de Alencar', 'iracema.png', 'iracema.pdf', 'Romance indianista sobre a origem do Ceará.', '9788570012345', 4, 2),
      new Book(12, 'O Mulato', 'Aluísio Azevedo', 'mulato.png', 'mulato.pdf', 'Naturalismo sobre racismo e sociedade.', '9788570016780', 3, 1),
      new Book(13, 'A Luneta Mágica', 'Machado de Assis', 'luneta.png', 'luneta.pdf', 'Conto fantástico sobre visão e realidade.', '9788570018900', 5, 4),
      new Book(14, 'O Seminarista', 'Bernardo Guimarães', 'seminarista.png', 'seminarista.pdf', 'Romance sobre dilemas morais e amorosos.', '9788570015670', 4, 2),
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
      this.books.forEach((book, i) => {
          if(parsed.books[i]) Object.assign(book, parsed.books[i]);
      });
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
    localStorage.setItem('studentId', usuario);

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
  setupStudentProfile();
  loadProfileHeader();
  showBooks();
}

function loadProfileHeader() {
  const profile = localStorage.getItem('studentProfile');
  if (profile) {
    const {name, serie, avatarSeed} = JSON.parse(profile);
    const nameEl = document.getElementById('headerUserName');
    const serieEl = document.getElementById('headerUserSerie');
    const avatarEl = document.getElementById('headerAvatar');
    
    if(nameEl) nameEl.textContent = `Olá, ${name}!`;
    if(serieEl) serieEl.textContent = serie;
    if(avatarEl) {
        avatarEl.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        avatarEl.style.display = 'block';
    }
  }
}

function setupStudentProfile() {
  const profileSaved = localStorage.getItem('studentProfile');
  if (!profileSaved) {
    showModal('modalStudentProfile');
  }
}

function saveStudentProfile(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const serie = document.getElementById('profileSerie').value.trim();
  const avatarSeed = localStorage.getItem('selectedAvatarSeed') || 'student1';
  if (name && serie) {
    const profile = {name, serie, avatarSeed};
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    hideModal('modalStudentProfile');
    loadProfileHeader();
    showToast('Perfil salvo! 🎉');
  } else {
    showToast('Preencha todos os campos!', 'error');
  }
}

function selectAvatar(img) {
  document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
  img.classList.add('selected');
  const seed = img.dataset.seed;
  document.getElementById('avatarPreview').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  document.getElementById('avatarPreview').style.display = 'block';
  localStorage.setItem('selectedAvatarSeed', seed);
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
  const studentId = localStorage.getItem('studentId');
  const profile = JSON.parse(localStorage.getItem('studentProfile') || '{"name":"Anônimo","serie":"N/A"}');

  const loan = library.createLoan(studentId, profile.name, profile.serie, bookId);
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

  tbody.innerHTML = history.map(loan => `
    <tr>
      <td>${loan.bookTitle}</td>
      <td>${loan.dataEmp}</td>
      <td>${loan.dataDevolucao || 'Pendente'}</td>
      <td>${loan.status.replace('_returned', '')}</td>
    </tr>
  `).join('');
  updateSidebar(2);
}

// ================= PROFESSOR / DASHBOARD =================
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
  const sections = ["dashboardSection", "alunosSection", "relatoriosSection", "livrosSection", "devolucoesSection", "configSection"];
  sections.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sec.style.display = "none";
  });

  const target = document.getElementById(sectionId);
  if (target) target.style.display = "block";

  document.querySelectorAll(".sidebar-prof li").forEach(li => li.classList.remove("active"));
  if (el) el.classList.add("active");

  if(sectionId === 'dashboardSection') carregarDashboard();
  if(sectionId === 'devolucoesSection') loadReturnLoans();
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
    
    const novoLivro = new Book(
        Date.now(), 
        titulo,
        autor,
        "capa-padrao.png", 
        pdf, 
        desc,
        "000-000",
        5, 5 
    );

    library.books.push(novoLivro);
    library.saveData(); 
    alert("Livro adicionado com sucesso!");
    hideModal('modalAddBook');
    navegarProfessor('dashboardSection');
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

    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', saveStudentProfile);

    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) addBookForm.addEventListener('submit', adicionarNovoLivro);

    const pageType = getCurrentPageType();
    const isLogged = localStorage.getItem('logado') === 'true';

    if (isLogged) {
        const container = document.getElementById(pageType + 'Container');
        const loginCont = document.getElementById('loginContainer');
        if (container && loginCont) {
            loginCont.style.display = 'none';
            container.style.display = 'block';
            if (pageType === 'aluno') afterStudentLogin();
            else carregarDashboard();
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) hideModal(e.target.id);
    });
});