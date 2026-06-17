

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
    this.trash = []; // Lixeira para livros excluídos
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
      favorites: this.favorites,
      trash: this.trash || []
    }));
    this.updateTrashCounter();
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
    this.trash = parsed.trash || [];

    this.cleanupTrash();
    this.updateTrashCounter();
  }

  cleanupTrash() {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const initialCount = this.trash.length;

    this.trash = this.trash.filter(book => {
      // Mantém se não tiver data (legado) ou se for mais recente que 30 dias
      return !book.deletedAt || (now - book.deletedAt) < THIRTY_DAYS_MS;
    });

    if (this.trash.length !== initialCount) {
      this.saveData();
    }
  }

  getExpiringTrashItems() {
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return this.trash.filter(book => {
      if (!book.deletedAt) return false; // Itens legados sem data de exclusão não expiram

      const timeInTrash = now - book.deletedAt;
      const timeRemaining = THIRTY_DAYS_MS - timeInTrash;

      return timeRemaining > 0 && timeRemaining <= TWO_DAYS_MS;
    });
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

  updateTrashCounter() {
    const counter = document.getElementById('trashCounter');
    if (counter) {
      counter.textContent = this.trash.length;
      counter.style.display = this.trash.length > 0 ? 'inline-block' : 'none';
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
          <td><strong>${escapeHtml(m.nome)}</strong></td>
          <td>${parseInt(m.quantidade, 10) || 0}</td>
          <td><span class="badge bg-secondary">Anexo</span></td>
        </tr>
      `).join('')
      : '<tr><td colspan="3" style="text-align:center; padding: 20px;">Ainda não há materiais enviados.</td></tr>';
  } catch (e) {
    body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">Ainda não há materiais enviados.</td></tr>';
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

  // Alerta para itens na lixeira prestes a expirar
  const expiringTrash = library.getExpiringTrashItems();
  if (expiringTrash.length > 0) {
    const message = expiringTrash.length === 1
      ? `ATENÇÃO: Um livro na lixeira expira em menos de 2 dias: "${expiringTrash[0].title}".`
      : `ATENÇÃO: ${expiringTrash.length} livros na lixeira expiram em menos de 2 dias.`;
    showToast(message, 'warning');
  }


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
// --- PROFESSOR BOOKS ENHANCEMENTS ---

function renderProfessorBooks() {
  const grid = document.getElementById('profBooksGrid');
  if (!grid) return;

  const searchTerm = document.getElementById('searchBooksProf')?.value.toLowerCase() || '';
  const sortType = document.getElementById('sortProfBooks')?.value || 'recent';
  
  // Filtra os livros antes de renderizar para não perder a pesquisa ao apagar ou editar
  let filteredBooks = library.books.filter(book => 
    book.title.toLowerCase().includes(searchTerm) || 
    book.author.toLowerCase().includes(searchTerm) ||
    (book.isbn && book.isbn.includes(searchTerm))
  );

  if (sortType === 'az') {
    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filteredBooks.reverse();
  }

  if (filteredBooks.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color: #cbd5e1;">Nenhum livro encontrado com este termo.</div>';
    return;
  }

  grid.innerHTML = filteredBooks.map(book => `
    <div class="prof-book-card">
      <img src="${book.image}" class="prof-book-cover" alt="${book.title}" onerror="this.src='Imagens/domcasmurro.png'">
      <div class="prof-book-info">
        <div class="prof-book-title">${escapeHtml(book.title)}</div>
        <div class="prof-book-meta">
          <span class="text-truncate d-block"><i class="fas fa-user-edit me-1"></i> ${escapeHtml(book.author)}</span>
          <div class="mt-2"><span class="badge" style="background: rgba(255,194,14,0.15); color: #FFC20E; font-size: 10px;">${escapeHtml(book.category)}</span></div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span style="font-size: 11px; color: ${book.canLoan() ? '#22c55e' : '#f43f5e'}">
             Estoque: <b>${book.availableCopies}/${book.totalCopies}</b>
          </span>
        </div>
      </div>
      <div class="prof-card-footer">
        <button class="btn-action-sm" style="background: #334155; color: white;" onclick="visualizarLivro(${book.id})"><i class="fas fa-eye"></i></button>
        <button class="btn-action-sm" style="background: #2E3192; color: white;" onclick="editarLivro(${book.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-action-sm" style="background: #ef4444; color: white;" onclick="confirmarExcluirLivro(${book.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function filterProfessorBooks() {
  renderProfessorBooks(); // Agora a renderização já trata o filtro internamente
}

async function buscarIsbnInterface() {
  const isbn = document.getElementById('isbnInputSearch').value.trim();
  if (!isbn) return showToast('Digite um ISBN', 'error');

  const preview = document.getElementById('isbnResultPreview');
  preview.style.display = 'none';

  try {
    const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await resp.json();

    if (data.totalItems > 0) {
      const b = data.items[0].volumeInfo;
      document.getElementById('isbnPreviewTitle').innerText = b.title;
      document.getElementById('isbnPreviewAuthor').innerText = b.authors?.join(', ') || 'Autor desconhecido';
      document.getElementById('isbnPreviewCat').innerText = b.categories ? b.categories[0] : 'Geral';
      document.getElementById('isbnPreviewImg').src = b.imageLinks?.thumbnail || 'Imagens/domcasmurro.png';
      preview.style.display = 'block';
    } else {
      showToast('Nenhum livro encontrado', 'error');
    }
  } catch (e) {
    showToast('Erro ao buscar dados', 'error');
  }
}

function handlePdfPreview(input) {
  if (input.files && input.files[0]) {
    document.getElementById('pdfFileName').innerText = input.files[0].name;
    document.getElementById('pdfPreviewArea').style.display = 'block';
    document.getElementById('pdfStatusText').innerText = "Arquivo selecionado!";
    showToast('PDF pronto para upload');
  }
}

function resetPdfUpload() {
  document.getElementById('filePdfInput').value = '';
  document.getElementById('pdfPreviewArea').style.display = 'none';
  document.getElementById('pdfStatusText').innerText = "Arraste seu PDF aqui ou clique para selecionar";
}

let livroEmEdicaoId = null;

function visualizarLivro(id) {
    const book = library.books.find(b => b.id === id);
    if (book) {
        alert(`Detalhes do Livro:\n\nTítulo: ${book.title}\nAutor: ${book.author}\nISBN: ${book.isbn || 'N/A'}\nEstoque: ${book.availableCopies}/${book.totalCopies}`);
    }
}

function editarLivro(id) {
    const book = library.books.find(b => b.id === id);
    if (!book) return;
    livroEmEdicaoId = id;
    document.getElementById('newTitle').value = book.title;
    document.getElementById('newAuthor').value = book.author;
    document.getElementById('newDesc').value = book.description || '';
    document.getElementById('newCategory').value = book.category || '';
    document.getElementById('newCoverUrl').value = book.image;
    document.getElementById('newBookUrl').value = book.pdfUrl || '';
    showModal('modalAddBook');
    atualizarPreview();
}

function salvarLivro(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const bookData = {
        title: fd.get('Titulo'),
        author: fd.get('Autor'),
        description: fd.get('Descricao'),
        category: fd.get('Categoria'),
        image: fd.get('CapaURL'),
        pdfFile: fd.get('PdfURL'),
        isbn: fd.get('ISBN'),
        totalCopies: parseInt(fd.get('Quantidade')) || 1
    };

    if (livroEmEdicaoId) {
        const book = library.books.find(b => b.id === livroEmEdicaoId);
        if (book) {
            Object.assign(book, bookData);
            book.availableCopies = bookData.totalCopies; // Reset estoque para simplificar
        }
        livroEmEdicaoId = null;
        showToast('Livro atualizado!');
    } else {
        const newBook = new Book(Date.now(), bookData.title, bookData.author, bookData.image, bookData.pdfFile, bookData.description, bookData.isbn, bookData.totalCopies);
        newBook.category = bookData.category;
        library.books.push(newBook);
        showToast('Livro adicionado!');
    }
    library.saveData();
    renderProfessorBooks();
    hideModal('modalAddBook');
    form.reset();
    document.getElementById('coverPreview').style.display = 'none';
}

function salvarPdfManual(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('Titulo');
    const pdfFile = fd.get('pdfFile'); // Em localstorage guardamos apenas o nome
    const capa = fd.get('CapaURL') || 'Imagens/domcasmurro.png';

    const newBook = new Book(Date.now(), title, 'Autor Digital', capa, pdfFile.name, 'Livro digital enviado via PDF.', 'DIGITAL', 999);
    library.books.push(newBook);
    library.saveData();
    renderProfessorBooks();
    hideModal('modalUploadPdf');
    showToast('PDF Registado com sucesso!');
}

function confirmarExcluirLivro(id) {
    const book = library.books.find(b => b.id === id);
    if (!book) return;

    if (confirm(`Mover "${book.title}" para a lixeira?`)) {
        const index = library.books.indexOf(book);
        if (index > -1) {
            const bookToDelete = library.books[index];
            bookToDelete.deletedAt = Date.now(); // Define a data para o cálculo de expiração
            library.trash.push(bookToDelete);
            library.books.splice(index, 1);
            library.saveData();
            renderProfessorBooks();
            showToast('Livro movido para a lixeira.');
        }
    }
}

function renderLixeira() {
    const body = document.getElementById('lixeiraBody');
    if (!body) return;

    if (!library.trash || library.trash.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="text-center">A lixeira está vazia.</td></tr>';
        return;
    }

    body.innerHTML = library.trash.map((book, index) => {
        const diffMs = Date.now() - (book.deletedAt || Date.now());
        const diasRestantes = Math.max(0, 30 - Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        return `
        <tr>
            <td>${escapeHtml(book.title)}</td>
            <td>${escapeHtml(book.author)}</td>
            <td>
                <span class="badge ${diasRestantes <= 5 ? 'bg-danger' : 'bg-info'}">
                    ${diasRestantes} dias
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-success" onclick="restaurarLivro(${index})"><i class="fas fa-undo"></i> Restaurar</button>
            </td>
        </tr>
    `;}).join('');
}

function esvaziarLixeira() {
    if (!library.trash || library.trash.length === 0) return showToast('A lixeira já está vazia!', 'error');
    
    if (confirm('Deseja realmente excluir permanentemente todos os itens da lixeira? Esta ação não pode ser desfeita.')) {
        library.trash = [];
        library.saveData();
        renderLixeira();
        showToast('Lixeira esvaziada com sucesso!', 'success');
    }
}

function restaurarLivro(index) {
    const book = library.trash[index];
    if (book) {
        library.books.push(book);
        library.trash.splice(index, 1);
        library.saveData();
        renderProfessorBooks();
        renderLixeira();
        showToast(`"${book.title}" restaurado com sucesso!`);
    }
}

// Sobrescreve a função original para usar a nova interface
function renderProfessorBooksQuantidade() { renderProfessorBooks(); }
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

    const API_KEY = "AIzaSyAXkFHczitsFeFVQpboxTgdms532i0q_A4";

    const isbnInput = document.getElementById('newIsbn');

    if (!isbnInput) {
        console.error('Campo ISBN não encontrado.');
        return;
    }

    const isbn = isbnInput.value
        .trim()
        .replace(/[-\s]/g, '');

    if (!isbn) {
        showToast('Digite um ISBN.', 'error');
        return;
    }

    const btn = document.querySelector('.btn-search-isbn');
    let originalContent = '';

    if (btn) {
        originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
    }

    try {

        // Busca principal por ISBN
        let response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        let data = await response.json();

        // Segunda tentativa
        if (!data.items || data.totalItems === 0) {

            response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${isbn}&key=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            data = await response.json();
        }

        if (!data.items || data.items.length === 0) {
            showToast('Livro não encontrado.', 'error');
            return;
        }

        const livro = data.items[0].volumeInfo;

        // Título
        const titulo = document.getElementById('newTitle');
        if (titulo) {
            titulo.value = livro.title || '';
        }

        // Autor
        const autor = document.getElementById('newAuthor');
        if (autor) {
            autor.value = livro.authors
                ? livro.authors.join(', ')
                : '';
        }

        // Descrição
        const descricao = document.getElementById('newDescription');
        if (descricao) {
            descricao.value = livro.description || '';
        }

        // Categoria
        const categoria = document.getElementById('newCategory');
        if (categoria) {
            categoria.value = livro.categories
                ? livro.categories.join(', ')
                : '';
        }

        // URL da capa
        const capaUrl =
            livro.imageLinks?.extraLarge ||
            livro.imageLinks?.large ||
            livro.imageLinks?.medium ||
            livro.imageLinks?.thumbnail ||
            livro.imageLinks?.smallThumbnail ||
            '';

        const campoCapa = document.getElementById('newCover');

        if (campoCapa) {
            campoCapa.value = capaUrl;
        }

        // Mostrar imagem da capa
        const preview = document.getElementById('bookCoverPreview');

        if (preview) {

            if (capaUrl) {

                preview.src = capaUrl.replace(
                    'http://',
                    'https://'
                );

                preview.style.display = 'block';

            } else {

                preview.src = '';
                preview.style.display = 'none';

            }
        }

        showToast('Livro encontrado com sucesso!', 'success');

        console.log({
            isbn,
            titulo: livro.title,
            autor: livro.authors,
            descricao: livro.description,
            categoria: livro.categories,
            capa: capaUrl
        });

    } catch (error) {

        console.error(error);

        showToast(
            'Erro ao consultar o Google Books.',
            'error'
        );

    } finally {

        if (btn) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }

    }
}
function atualizarPreview() {

    const url = document.getElementById('newCoverUrl').value;
    const img = document.getElementById('coverPreview');

    if (!img) return;

    if (url) {
        img.src = url;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
}

document.getElementById('newIsbn').addEventListener('blur', function () {
    if (this.value.trim() !== '') {
        buscarDadosGoogleBooks();
    }
});


