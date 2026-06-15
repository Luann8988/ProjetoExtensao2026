/*
  Script.js (versão simplificada)
  - Mantém: login UI, Favoritos (localStorage), Meus Empréstimos/Histórico (localStorage legado), render de catálogo
  - Integra “Outros Materiais” via PHP/DB: Back-End 08_06/api_materiais.php
  - Remove: avaliação por estrelas, avatar/seed, chat, notificações, turmas, reservas, gráficos, e lógica fora do escopo.

  Observação:
  - O sistema atual possui partes legadas em localStorage para livros/empréstimos.
  - Esta versão evita adicionar novas funcionalidades fora do escopo.
*/

const IMAGES_PATH = 'Imagens/';
const PDF_PATH = 'PDF/';
const STORAGE_VERSION = '1.3';
const OVERDUE_DAYS = 7;
const MAX_LOANS_PER_STUDENT = 3;

class Book {
  constructor(id, title, author, image, pdfFile, description, isbn, totalCopies, availableCopies = totalCopies, category = 'Geral') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = image.startsWith('http') ? image : IMAGES_PATH + image;
    this.category = category;

    this.pdfUrl = (pdfFile && pdfFile.startsWith('http')) ? pdfFile : (pdfFile ? PDF_PATH + pdfFile : null);

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
    this.favorites = [];
    this.initBooks();
  }

  initBooks() {
    // Mantém catálogo legado (não adiciona integração nova fora do escopo).
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

    const uniqueCategories = [...new Set(this.books.map(book => book.category))];
    const filterCategorySelect = document.getElementById('filterCategory');
    if (filterCategorySelect) {
      uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
      });
    }
  }

  isOverdue(loan) {
    const devDate = new Date(loan.dataDev.split('/').reverse().join('-'));
    const today = new Date();
    return (today - devDate) > (OVERDUE_DAYS * 24 * 60 * 60 * 1000);
  }

  createLoan(studentId, studentName, serie, bookId) {
    const activeLoans = this.loans.filter(l => l.studentId === studentId && l.status === 'active').length;
    // Mantém limite legado, mas não exibe mensagens/extras fora do escopo.
    if (activeLoans >= MAX_LOANS_PER_STUDENT) return null;

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

    if (book) book.returnCopy();

    this.saveData();
    return true;
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
      loans: this.loans,
      favorites: this.favorites
    }));
  }

  loadData() {
    const data = localStorage.getItem('libraryData_v' + STORAGE_VERSION);
    if (!data) {
      this.saveData();
      return;
    }

    const parsed = JSON.parse(data);
    if (parsed.books && parsed.books.length) {
      // 1. Sincroniza estoque dos livros estáticos (IDs 1 a 9)
      this.books.forEach(book => {
        const stored = parsed.books.find(b => b.id === book.id);
        if (stored) {
           book.availableCopies = stored.availableCopies;
           book.totalCopies = stored.totalCopies;
        }
      });

      // 2. Adiciona livros novos vindos do localStorage (criados pelo professor)
      const staticIds = this.books.map(b => b.id);
      parsed.books.forEach(storedBook => {
        if (!staticIds.includes(storedBook.id)) {
          const newObj = new Book(
            storedBook.id, storedBook.title, storedBook.author, 
            storedBook.image, storedBook.pdfUrl || storedBook.pdfFile, storedBook.description, 
            storedBook.isbn, storedBook.totalCopies, storedBook.availableCopies, 
            storedBook.category
          );
          // Garante que a imagem aponte para o caminho correto
          if (storedBook.image.includes(IMAGES_PATH)) newObj.image = storedBook.image;
          this.books.push(newObj);
        }
      });
    }
    this.loans = parsed.loans || [];
    this.favorites = parsed.favorites || [];
  }

  toggleFavorite(studentId, bookId) {
    const index = this.favorites.findIndex(f => f.studentId === studentId && f.bookId === bookId);
    if (index > -1) this.favorites.splice(index, 1);
    else this.favorites.push({ studentId, bookId });
    this.saveData();
  }

  isFavorite(studentId, bookId) {
    return this.favorites.some(f => f.studentId === studentId && f.bookId === bookId);
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
  localStorage.removeItem('logado');
  localStorage.removeItem('tipoUsuario');
  localStorage.removeItem('studentId');
  localStorage.removeItem('studentName');
  localStorage.removeItem('professorId');
  window.location.href = 'Index.html';
}

function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ================= LOGIN (UI) =================
function login(e) {
  e.preventDefault();

  const errorEl = document.getElementById('loginErrorMessage');
  if (errorEl) errorEl.style.display = 'none';

  const usuario = document.getElementById('usuario')?.value?.trim() || '';
  const senha = document.getElementById('senha')?.value?.trim() || '';

  const pageType = getCurrentPageType();

  // Permanece legado do front (sem integrar backend de autenticação aqui)
  let isAuthenticated = false;
  let userId = '';
  let userName = '';

  if (pageType === 'aluno') {
    if (usuario === 'aluno' && senha === '123') {
      isAuthenticated = true;
      userId = 'aluno123';
      userName = 'Aluno Teste';
    }
  } else if (pageType === 'professor') {
    if (usuario === 'prof' && senha === '123') {
      isAuthenticated = true;
      userId = 'prof456';
      userName = 'Prof. Bibliotecário';
    }
  }

  if (!isAuthenticated) {
    if (errorEl) {
      errorEl.textContent = 'Usuário ou senha incorretos.';
      errorEl.style.display = 'block';
    }
    showToast('Acesso negado!', 'error');
    return;
  }

  localStorage.setItem('logado', 'true');
  localStorage.setItem('tipoUsuario', pageType);

  if (pageType === 'aluno') {
    localStorage.setItem('studentId', userId);
    localStorage.setItem('studentName', userName);
  } else {
    localStorage.setItem('professorId', userId);
    localStorage.setItem('professorName', userName);
  }

  library.loadData();

  const container = document.getElementById(pageType + 'Container');
  const loginCont = document.getElementById('loginContainer');
  if (container && loginCont) {
    loginCont.style.display = 'none';
    container.style.display = 'block';

    if (pageType === 'aluno') {
      afterStudentLogin();
    } else {
      carregarDashboard();
      // navegação inicial será feita pela página
      navegarProfessor('dashboard', document.querySelector('.sidebar-prof li.menu-item'));
    }
  }

  showToast('Login realizado com sucesso!');
}

function afterStudentLogin() {
  showBooks();
}

// ================= Outros Materiais (DB) =================
async function renderMateriaisOutros() {
  const body = document.getElementById('materiaisOutrosBody');
  if (!body) return;

  body.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

  try {
    const resp = await fetch('Back-End 08_06/api_materiais.php?action=listar');
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || 'Erro ao listar materiais');

    const materiais = data.materiais || [];
    body.innerHTML = materiais.length
      ? materiais.map(m => `
        <tr>
          <td>${escapeHtml(m.nome)}</td>
          <td><span class="categoria">${escapeHtml(m.tipo || 'Geral')}</span></td>
          <td>${escapeHtml(m.descricao ?? '')}</td>
          <td>${parseInt(m.quantidade, 10) || 0}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="text-align:center;">Nenhum material cadastrado.</td></tr>';
  } catch (e) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--error);">Erro ao carregar materiais</td></tr>';
  }
}

async function cadastrarMaterialOutros(e) {
  e.preventDefault();

  const form = document.getElementById('addMaterialForm');
  if (!form) return false;

  const fd = new FormData(form);

  try {
    const resp = await fetch('Back-End 08_06/api_materiais.php?action=cadastrar', {
      method: 'POST',
      body: fd
    });

    const data = await resp.json();
    if (!data.ok) {
      showToast(data.error || 'Erro ao cadastrar material', 'error');
      return false;
    }

    showToast('Material cadastrado!', 'success');
    form.reset();
    await renderMateriaisOutros();
    return false;
  } catch (err) {
    showToast('Erro de rede ao cadastrar material', 'error');
    return false;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

// ================= Livros (sem estrelas/avaliação) =================
function renderBookCard(book) {
  const studentId = localStorage.getItem('studentId');
  const isFav = library.isFavorite(studentId, book.id);

  return `
    <div class="card" style="position: relative;">
        <div class="favorite-badge ${isFav ? 'active' : ''}" onclick="toggleFav(${book.id}, event)" style="position: absolute; top: 12px; right: 12px; background: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; transition: 0.2s;">
            <i class="${isFav ? 'fas fa-heart' : 'far fa-heart'}" style="color: ${isFav ? '#f43f5e' : '#cbd5e1'}"></i>
        </div>
        <img src="${book.image}" alt="${book.title}" class="capa" style="width: 100%; height: 260px; object-fit: cover; border-bottom: 1px solid rgba(0,0,0,0.05);">
        <div class="card-content" style="padding: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--accent); font-weight: 800; letter-spacing: 0.5px; margin-bottom: 4px;">${escapeHtml(book.category)}</div>
            <h3 style="font-size: 16px; margin: 0 0 4px; color: var(--primary); font-weight: 700;">${escapeHtml(book.title)}</h3>
            <p style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 500;">${escapeHtml(book.author)}</p>
            
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 16px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${book.canLoan() ? '#22c55e' : '#f43f5e'};"></div>
                <span style="font-size: 12px; font-weight: 600; color: ${book.canLoan() ? '#166534' : '#991b1b'};">
                    ${book.canLoan() ? 'Disponível' : 'Esgotado'} (${book.availableCopies}/${book.totalCopies})
                </span>
            </div>

            <div class="actions" style="display: flex; gap: 8px;">
                ${book.canLoan() ? `<button class="btn-emprestar" onclick="emprestarLivro(${book.id})" style="flex: 2; font-size: 13px; padding: 10px; border-radius: 10px;">Pegar Livro</button>` : ''}
                ${book.pdfUrl ? `<button class="btn-pdf" onclick="openPdf('${book.pdfUrl}')" style="flex: 1; font-size: 13px; padding: 10px; border-radius: 10px;"><i class="fas fa-file-pdf"></i></button>` : ''}
            </div>
        </div>
    </div>
  `;
}

function filterBooks() {
  const term = document.getElementById('searchAluno')?.value?.toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || '';
  const onlyAvailableEl = document.getElementById('filterAvailable');
  const onlyAvailable = !!onlyAvailableEl?.checked;

  const filtered = library.books.filter(book => {
    const matchTerm = book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term);
    const matchCat = category === '' || book.category === category;
    const matchAvail = !onlyAvailable || book.canLoan();
    return matchTerm && matchCat && matchAvail;
  });

  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  grid.innerHTML = filtered.length
    ? filtered.map(renderBookCard).join('')
    : '<div style="grid-column: 1/-1; text-align:center; padding:40px; color: var(--text-light);">Nenhum livro encontrado.</div>';
}

function showBooks() {
  showSection('bookCatalog');
  filterBooks();
  updateSidebar(0);
}

function toggleFav(bookId, event) {
  const studentId = localStorage.getItem('studentId');
  library.toggleFavorite(studentId, bookId);
  if (document.getElementById('bookCatalog')?.style.display !== 'none') showBooks();
  else if (document.getElementById('favoritesSection')?.style.display !== 'none') showFavorites();
}

function openPdf(url) {
  if (url) window.open(url, '_blank');
}

function emprestarLivro(bookId) {
  const studentId = localStorage.getItem('studentId');
  const studentName = localStorage.getItem('studentName') || 'Aluno';

  const loan = library.createLoan(studentId, studentName, '', bookId);
  if (!loan) {
    showToast('Livro indisponível!', 'error');
    return;
  }

  showToast(`Emprestado: ${loan.bookTitle}`);
  showBooks();
  showMyLoans();
}

function showFavorites() {
  showSection('favoritesSection');
  const studentId = localStorage.getItem('studentId');
  const favGrid = document.getElementById('favoritesGrid');
  if (!favGrid) return;

  const favoriteBooks = library.books.filter(book =>
    library.favorites.some(f => f.studentId === studentId && f.bookId === book.id)
  );

  favGrid.innerHTML = favoriteBooks.length
    ? favoriteBooks.map(renderBookCard).join('')
    : '<p class="text-center w-100">Você ainda não tem livros favoritos.</p>';

  updateSidebar(1);
}

function showMyLoans() {
  showSection('myLoansSection');

  const studentId = localStorage.getItem('studentId');
  const myLoans = library.loans.filter(l => l.studentId === studentId && l.status === 'active');

  const tbody = document.querySelector('#myLoansTable tbody');
  if (!tbody) return;

  tbody.innerHTML = myLoans.map(loan => `
    <tr>
      <td>${escapeHtml(loan.bookTitle)}</td>
      <td>${escapeHtml(loan.dataEmp)}</td>
      <td>${escapeHtml(loan.dataDev)}</td>
      <td>
        <button class="btn-secondary" onclick="devolverLivro(${loan.id})">Devolver</button>
      </td>
    </tr>
  `).join('');

  updateSidebar(2);
}

function devolverLivro(loanId) {
  if (!library.returnLoan(loanId)) return;
  showToast('Livro devolvido!');
  showMyLoans();
  showHistory();
}

function showHistory() {
  showSection('historySection');

  const studentId = localStorage.getItem('studentId');
  const history = library.loans.filter(l => l.studentId === studentId && l.status.includes('returned'));

  const tbody = document.querySelector('#historyTable tbody');
  if (!tbody) return;

  // Histórico mínimo (sem Avaliação/Comentário/Recomendações)
  tbody.innerHTML = history.map(loan => `
    <tr>
      <td>${escapeHtml(loan.bookTitle)}</td>
      <td>${escapeHtml(loan.dataEmp)}</td>
      <td>${escapeHtml(loan.dataDevolucao || 'Pendente')}</td>
      <td>${escapeHtml(loan.status.replace('_returned', ''))}</td>
    </tr>
  `).join('');

  updateSidebar(3);
}

// ================= Professor (apenas navegação + dashboard legado) =================

// -------- DASHBOARD --------
function carregarDashboard() {
  const stats = library.getStats();

  const tEmp = document.getElementById('totalEmprestimos');
  const aEmp = document.getElementById('emprestimosAtivos');
  const atEmp = document.getElementById('emprestimosAtrasados');
  const dToday = document.getElementById('devoluToday');

  if (tEmp) tEmp.textContent = stats.total;
  if (aEmp) aEmp.textContent = stats.active;
  if (atEmp) atEmp.textContent = stats.overdue;
  if (dToday) dToday.textContent = stats.devoluToday;

  const tbody = document.getElementById('dashboardLoansBody');
  if (!tbody) return;

  tbody.innerHTML = library.loans
    .slice(-5)
    .map(l => {
      const isOverdue = library.isOverdue(l);
      let statusText = 'Em Dia';

      if (l.status.includes('returned')) statusText = 'Devolvido';
      else if (isOverdue) statusText = 'Atrasado';

      return `
        <tr>
          <td>${escapeHtml(l.codigo || ('#' + l.id.toString().slice(-3)))}</td>
          <td>${escapeHtml(l.studentName)}</td>
          <td>${escapeHtml(l.bookTitle)}</td>
          <td>${escapeHtml(l.dataEmp)}</td>
          <td>${escapeHtml(l.dataDev)}</td>
          <td>${escapeHtml(statusText)}</td>
          <td>-</td>
        </tr>
      `;
    })
    .reverse()
    .join('');
}


// -------- NAVEGAÇÃO --------
function navegarProfessor(sectionId, el) {
  const ids = ['dashboard', 'alunos', 'livros', 'devolucoes', 'materiaisOutros'];

  ids.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) sec.style.display = 'none';
  });

  const target = document.getElementById(sectionId);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.sidebar-prof li')
    .forEach(li => li.classList.remove('active'));

  if (el) el.classList.add('active');

  if (sectionId === 'dashboard') carregarDashboard();
  if (sectionId === 'materiaisOutros') renderMateriaisOutros();
  if (sectionId === 'livros') renderProfessorBooksQuantidade();
  if (sectionId === 'alunos') renderAlunos();
}


// -------- LIVROS (Quantidade numérica) --------
function renderProfessorBooksQuantidade() {
  const grid = document.getElementById('profBooksGrid');
  if (!grid) return;
  
  // Renderiza os cartões reais no grid do professor para consistência
  grid.innerHTML = library.books.map(book => `
    <div class="card">
        <img src="${book.image}" alt="${book.title}" class="capa" style="height: 120px; object-fit: cover;">
        <div class="card-content" style="padding: 10px;">
            <h3 style="font-size: 14px;">${book.title}</h3>
            <p style="font-size: 12px;">Qtd: ${book.availableCopies}/${book.totalCopies}</p>
        </div>
    </div>
  `).join('');
}
// ================= Helpers de UI =================
function showSection(sectionId) {
  const sections = [
    'bookCatalog',
    'favoritesSection',
    'myLoansSection',
    'historySection',
    'materiaisOutros',
    'configSection'
  ];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const target = document.getElementById(sectionId);
  if (target) target.style.display = 'block';

  if (sectionId === 'materiaisOutros') renderMateriaisOutros();
}

function updateSidebar(activeIndex) {
  const navItems = document.querySelectorAll('.sidebar li');
  navItems.forEach((li, i) => {
    li.classList.toggle('active', i === activeIndex);
  });
}

// ================= Inicialização =================
function setupSearch() {
  const searchAluno = document.getElementById('searchAluno');
  if (searchAluno) searchAluno.oninput = () => debounce(filterBooks);
}

document.addEventListener('DOMContentLoaded', () => {
  library.loadData();

  setupSearch();

  // Renderiza materiais quando a seção existir
  if (document.getElementById('materiaisOutrosBody')) {
    renderMateriaisOutros();
  }

  const addMaterialForm = document.getElementById('addMaterialForm');
  if (addMaterialForm) {
    addMaterialForm.addEventListener('submit', cadastrarMaterialOutros);
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => e.preventDefault());
  }

  const addBookForm = document.getElementById('addBookForm');
  if (addBookForm) {
    // Página professor tem modal legacy: não implementamos novos endpoints aqui.
    // Deixamos o comportamento padrão da página/HTML.
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList?.contains('modal')) {
      hideModal(e.target.id);
    }
  });
});
/* Funções de Limpeza para o Aluno */
function limparPesquisas() {
    const input = document.getElementById('inputBusca') || document.getElementById('searchAluno');
    if (input) input.value = '';
    if (typeof filtrarLivros === 'function') filtrarLivros();
    if (typeof filterBooks === 'function') filterBooks();
    showToast('Filtros de pesquisa limpos!');
}

function limparLivros() {
    if (confirm('Deseja resetar toda a biblioteca para o estado inicial? Isso apagará livros adicionados e históricos.')) {
        localStorage.removeItem('libraryData_v' + STORAGE_VERSION);
        window.location.reload();
    }
}

function limparFavoritos() {
    if (confirm('Deseja realmente remover todos os seus livros favoritos?')) {
        library.favorites = [];
        library.saveData();
        if (document.getElementById('favoritesSection')?.style.display !== 'none') showFavorites();
        showToast('Favoritos removidos.');
    }
}

/* Gestão de Alunos (Exemplos para o Professor) */
function renderAlunos(filter = '') {
    const grid = document.getElementById('alunosGrid');
    if (!grid) return;

    // Dados de Exemplo (Mock)
    const exemplos = [
        { id: 1, nome: 'Ana Souza', serie: '1º Ano A', email: 'ana.souza@escola.mg.gov.br' },
        { id: 2, nome: 'Bruno Lima', serie: '2º Ano B', email: 'bruno.lima@escola.mg.gov.br' },
        { id: 3, nome: 'Carla Dias', serie: '3º Ano C', email: 'carla.dias@escola.mg.gov.br' }
    ];

    grid.innerHTML = exemplos.map(aluno => `
        <div class="card">
            <div class="card-content">
                <h3 style="margin-bottom: 5px;">${escapeHtml(aluno.nome)}</h3>
                <p><strong>Série:</strong> ${aluno.serie}</p>
                <p style="font-size: 11px;">${aluno.email}</p>
                <div class="actions">
                    <button class="btn-secondary" style="font-size: 12px; padding: 5px;">Ver Histórico</button>
                </div>
            </div>
        </div>
    `).join('');
}

/* Busca por ISBN (Todos os meios de adicionar livros) */
async function buscarDadosGoogleBooks() {
    const isbn = document.getElementById('newIsbn').value.trim();
    if (!isbn) return showToast('Digite um ISBN válido', 'error');

    const btn = document.querySelector('.btn-search-isbn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

  try {
    // Tenta busca específica por ISBN
    let response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    let data = await response.json();

    // Se não achar com prefixo isbn:, tenta busca geral pelo número
    if (data.totalItems === 0) {
      response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${isbn}`);
      data = await response.json();
    }

        if (data.totalItems > 0) {
            const info = data.items[0].volumeInfo;
            document.getElementById('newTitle').value = info.title || '';
            document.getElementById('newAuthor').value = info.authors ? info.authors.join(', ') : '';
            document.getElementById('newDesc').value = info.description || '';
            document.getElementById('newCategory').value = info.categories ? info.categories[0] : '';
            if (info.imageLinks && info.imageLinks.thumbnail) {
                document.getElementById('newCoverUrl').value = info.imageLinks.thumbnail;
                atualizarPreview();
            }
            showToast('Dados importados com sucesso!');
        } else {
            showToast('ISBN não encontrado na base do Google.', 'error');
        }
    } catch (error) {
        showToast('Erro ao conectar com API do Google.', 'error');
    } finally {
        btn.innerHTML = '🔍 Buscar';
    }
}

function atualizarPreview() {
    const url = document.getElementById('newCoverUrl').value;
    const img = document.getElementById('coverPreview');
    if (url) {
        img.src = url;
        img.style.display = 'block';
    }
}
