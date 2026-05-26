const IMAGES_PATH = 'Imagens/';
const PDF_PATH = 'PDF/'; // Pasta dos PDFs locais
const STORAGE_VERSION = '1.1';
const OVERDUE_DAYS = 7;
const MAX_LOANS_PER_STUDENT = 3;

class Book {
  constructor(id, title, author, image, pdfFile, description, isbn, totalCopies, availableCopies = totalCopies, category = 'Geral') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = IMAGES_PATH + image;
    this.category = category;
    this.rating = Math.floor(Math.random() * 2) + 4; // Simula rating inicial 4-5

    // Agora os PDFs são carregados da pasta PDF/
    this.pdfUrl = pdfFile ? PDF_PATH + pdfFile : null;

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
    this.favorites = [];
    this.initBooks();
  }

  initBooks() {
    // O ideal agora é buscar do banco de dados
    // this.fetchBooksFromServer(); 
    
    // Mantendo estático por enquanto, mas sugerindo a mudança:
    this.books = [
      new Book(1, 'Dom Casmurro', 'Machado de Assis', 'domcasmurro.png', 'domcasmurro.pdf', 'Romance clássico sobre amor e traição.', '9788570011234', 5, 3),
      // ... resto dos livros
      new Book(4, 'Vidas Secas', 'Graciliano Ramos', 'VidasSecas.jpg', 'vidassecas.pdf', 'Drama da família de retirantes no sertão.', '9788570012347', 3, 2),

      new Book(5, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'memorias.jpg', 'memoriaspostumasdebrascubas.pdf', 'Narrativa inovadora do defunto-autor.', '9788570015678', 5, 5),

      new Book(6, 'A Moreninha', 'Joaquim Manuel de Macedo', 'Morena.jpg', 'amoreninha.pdf', 'Romance romântico ambientado no Rio.', '9788570018901', 4, 2),

      new Book(7, 'O Primo Basílio', 'Eça de Queirós', 'primobasilio.jpg', 'primobasilio.pdf', 'Crítica social e adultério em Lisboa.', '9788570013458', 5, 3),

      new Book(8, 'A Escrava Isaura', 'Bernardo Guimarães', 'escravaisaura.png', 'escravaisaura.pdf', 'Romance abolicionista sobre Isaura.', '9788570016789', 4, 1),

      new Book(9, 'Senhora', 'José de Alencar', 'senhora.png', 'senhora.pdf', 'Romance urbano sobre amor e dinheiro.', '9788570019012', 6, 4),

      new Book(10, 'O Guarani', 'José de Alencar', 'guarani.png', 'guarani.pdf', 'Romance indianista ambientado no Brasil colonial.', '9788570010123', 5, 5),

      new Book(11, 'Iracema', 'José de Alencar', 'iracema.png', 'iracema.pdf', 'Romance indianista sobre a origem do Ceará.', '9788570012345', 4, 2),

      new Book(12, 'O Mulato', 'Aluísio Azevedo', 'mulato.png', 'mulato.pdf', 'Naturalismo sobre racismo e sociedade.', '9788570016780', 3, 1),

      new Book(13, 'A Luneta Mágica', 'Machado de Assis', 'luneta.png', 'luneta.pdf', 'Conto fantástico sobre visão e realidade.', '9788570018900', 5, 4),
      new Book(14, 'O Seminarista', 'Bernardo Guimarães', 'seminarista.png', 'seminarista.pdf', 'Romance sobre dilemas morais e amorosos.', '9788570015670', 4, 2),
      new Book(15, 'Quincas Borba', 'Machado de Assis', 'quincasborba.jpg', 'quincasborba.pdf', 'A filosofia do Humanitismo e a loucura.', '9788570015671', 5, 5),
      new Book(16, 'A Hora da Estrela', 'Clarice Lispector', 'horadaestrela.jpg', 'horadaestrela.pdf', 'A vida de Macabéa no Rio de Janeiro.', '9788570015672', 4, 4),
      new Book(17, 'Sagarana', 'João Guimarães Rosa', 'sagarana.jpg', 'sagarana.pdf', 'Contos regionalistas de Minas Gerais.', '9788570015673', 3, 3),
      new Book(18, 'Os Sertões', 'Euclides da Cunha', 'sertoes.jpg', 'sertoes.pdf', 'Relato da Guerra de Canudos.', '9788570015674', 2, 2),
      new Book(19, 'Auto da Compadecida', 'Ariano Suassuna', 'autocompadecida.jpg', 'autocompadecida.pdf', 'As aventuras de João Grilo e Chicó.', '9788570015675', 6, 6),
      new Book(20, 'Morte e Vida Severina', 'João Cabral de Melo Neto', 'severina.jpg', 'severina.pdf', 'Poema dramático sobre o retirante.', '9788570015676', 5, 5)
    ];
  }

  isOverdue(loan) {
    const devDate = new Date(loan.dataDev.split('/').reverse().join('-'));
    const today = new Date();
    return (today - devDate) > (OVERDUE_DAYS * 24 * 60 * 60 * 1000);
  }

  createLoan(studentId, studentName, serie, bookId) {
    const activeLoans = this.loans.filter(l => l.studentId === studentId && l.status === 'active').length;
    if (activeLoans >= MAX_LOANS_PER_STUDENT) {
      showToast(`Limite atingido! Máximo ${MAX_LOANS_PER_STUDENT} livros.`, 'error');
      return null;
    }

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
      dataDev: new Date(
        Date.now() + OVERDUE_DAYS * 24 * 60 * 60 * 1000
      ).toLocaleDateString('pt-BR'),
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

    loan.status = this.isOverdue(loan)
      ? 'overdue_returned'
      : 'returned';

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

    const active = this.loans.filter(
      l => l.status === 'active'
    ).length;

    const overdue = this.loans.filter(
      l => l.status === 'active' && this.isOverdue(l)
    ).length;

    const devoluToday = this.loans.filter(
      l =>
        l.status.includes('returned') &&
        l.dataDevolucao === new Date().toLocaleDateString('pt-BR')
    ).length;

    return {
      total,
      active,
      overdue,
      devoluToday
    };
  }

  saveData() {
    localStorage.setItem(
      'libraryData_v' + STORAGE_VERSION,
      JSON.stringify({
        books: this.books,
        loans: this.loans,
        favorites: this.favorites
      })
    );
  }

  loadData() {
    const data = localStorage.getItem(
      'libraryData_v' + STORAGE_VERSION
    );

    if (data) {
      const parsed = JSON.parse(data);

      this.books.forEach((book, i) => {
        if (parsed.books[i]) {
          Object.assign(book, parsed.books[i]);
        }
      });

      this.loans = parsed.loans || [];
      this.favorites = parsed.favorites || [];
    } else {
      this.saveData();
    }
  }

  toggleFavorite(studentId, bookId) {
    const index = this.favorites.findIndex(f => f.studentId === studentId && f.bookId === bookId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      showToast('Removido dos favoritos', 'info');
    } else {
      this.favorites.push({ studentId, bookId });
      showToast('Adicionado aos favoritos', 'success');
    }
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

  // Aqui você deve fazer um fetch para um arquivo PHP que valide o login
  // Exemplo simplificado mantendo a estrutura para fins educacionais:
  if (usuario !== "" && senha !== "") {
    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipoUsuario', pageType);
    // O ideal é que o servidor retorne esses dados
    localStorage.setItem('studentName', usuario);

    library.loadData();
    const container = document.getElementById(
      pageType + 'Container'
    );

    const loginCont = document.getElementById(
      'loginContainer'
    );

    if (container && loginCont) {
      loginCont.style.display = 'none';
      container.style.display = 'block';

      if (pageType === 'aluno') {
        afterStudentLogin();
      } else {
        carregarDashboard();
      }
    }

    showToast('Login realizado com sucesso!');
  } else {
    showToast(
      'Credenciais inválidas para este portal!',
      'error'
    );
  }
}

function getReaderLevel(count) {
  if (count >= 15) return { name: 'Mestre da Sabedoria 🧙‍♂️', color: '#8b5cf6', next: null };
  if (count >= 10) return { name: 'Devorador de Livros 📚', color: '#ec4899', next: 15 };
  if (count >= 5) return { name: 'Leitor Frequente 📖', color: '#3b82f6', next: 10 };
  return { name: 'Leitor Iniciante 🌱', color: '#10b981', next: 5 };
}

function afterStudentLogin() {
  // Tenta pegar do window (vindo do PHP) ou do localStorage (estático)
  const studentName = window.studentName || localStorage.getItem('studentName') || 'Estudante';
  const studentId = localStorage.getItem('studentId') || '000';
  
  // Cria o perfil automaticamente se não existir
  let profile = JSON.parse(localStorage.getItem('studentProfile')) || 
                { name: studentName, serie: 'Aluno Regular', avatarSeed: studentId };
  
  localStorage.setItem('studentProfile', JSON.stringify(profile));
  
  loadProfileHeader(profile);
  showBooks();
}

function loadProfileHeader(profileData) {
  const profile = profileData || JSON.parse(localStorage.getItem('studentProfile'));
  const studentId = localStorage.getItem('studentId');

  if (profile) {
    const { name, serie, avatarSeed } = profile;

    const nameEl = document.getElementById('headerUserName');
    const serieEl = document.getElementById('headerUserSerie');
    const avatarEl = document.getElementById('headerAvatar');
    const levelEl = document.getElementById('readerLevelBadge');

    if (nameEl) {
      nameEl.textContent = `Olá, ${name}!`;
    }

    if (serieEl) {
      serieEl.textContent = serie;
    }

    if (avatarEl) {
      avatarEl.src =
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

      avatarEl.style.display = 'block';
    }

    if (studentId && levelEl) {
      const returnedCount = library.loans.filter(l => l.studentId === studentId && l.status.includes('returned')).length;
      const level = getReaderLevel(returnedCount);
      levelEl.textContent = level.name;
      levelEl.style.backgroundColor = level.color;
      levelEl.style.display = 'inline-block';
    }

    // Atualiza o contador de livros e a barra de progresso
    const statCount = document.getElementById('statCount');
    const progressBar = document.getElementById('loanProgressBar');
    if (studentId) {
      const activeLoans = library.loans.filter(l => l.studentId === studentId && l.status === 'active').length;
      if (statCount) statCount.textContent = activeLoans;
      if (progressBar) {
        progressBar.style.width = (activeLoans / MAX_LOANS_PER_STUDENT * 100) + '%';
      }
    }
  }
}

function setupStudentProfile() {
  // Perfil removido do fluxo: não abrir modal.
}

function saveStudentProfile(e) {

  e.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const serie = document.getElementById('profileSerie').value.trim();
  const avatarSeed = document.getElementById('avatarSeedInput').value.trim() || 'student1';

  if (name && serie) {
    const profile = {
      name,
      serie,
      avatarSeed
    };

    localStorage.setItem(
      'studentProfile',
      JSON.stringify(profile)
    );

    hideModal('modalStudentProfile');
    loadProfileHeader(profile);

    showToast('Perfil salvo! 🎉');
  } else {
    showToast('Preencha todos os campos!', 'error');
  }
}

function resetLibraryData() {
  if (confirm('Tem certeza que deseja limpar todos os seus dados e histórico? Isso não pode ser desfeito.')) {
    const studentId = localStorage.getItem('studentId');
    library.loans = library.loans.filter(l => l.studentId !== studentId);
    library.favorites = library.favorites.filter(f => f.studentId !== studentId);
    library.saveData();
    location.reload();
  }
}

function selectAvatar(img) {
  document
    .querySelectorAll('.avatar-option')
    .forEach(opt => opt.classList.remove('selected'));

  img.classList.add('selected');

  const seed = img.dataset.seed;

  document.getElementById(
    'avatarPreview'
  ).src =
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  document.getElementById(
    'avatarPreview'
  ).style.display = 'block';

  localStorage.setItem('selectedAvatarSeed', seed);
}

// ================= LIVROS E EMPRÉSTIMOS =================

function renderBookCard(book) {
  const studentId = localStorage.getItem('studentId');
  const isFav = library.isFavorite(studentId, book.id);
  const stars = '⭐'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=isbn:${book.isbn}`;
  
  return `
    <div class="card">
      <div class="favorite-badge ${isFav ? 'active' : ''}" onclick="toggleFav(${book.id}, event)">
        ${isFav ? '❤️' : '🤍'}
      </div>
      <img src="${book.image}" alt="${book.title}" class="capa">
      <div class="card-content">
        <h3>${book.title}</h3>
        <div class="stars">${stars}</div>
        <p><strong>${book.author}</strong></p>
        <p>${book.description}</p>
        <span class="badge ${book.canLoan() ? 'bg-success' : 'bg-danger'} mb-2">
          ${book.canLoan() ? 'Disponível' : 'Esgotado'} (${book.availableCopies}/${book.totalCopies})
        </span>
        <div class="actions">
          ${book.canLoan() 
            ? `<button class="btn-emprestar" onclick="emprestarLivro(${book.id})">Emprestar</button>` 
            : `<button class="btn-secondary" onclick="reservarLivro(${book.id})">Reservar (Fila: ${book.reservations || 0})</button>`
          }
          ${book.pdfUrl ? `<button class="btn-pdf" onclick="openPdf('${book.pdfUrl}')">Ler PDF</button>` : ''}
          <button class="btn-pdf" style="background:#444" onclick="window.open('${qrCodeUrl}')">QR Code</button>
        </div>
      </div>
    </div>
  `;
}

function filterBooks() {
  const term = document.getElementById('searchAluno').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const onlyAvailable = document.getElementById('filterAvailable').checked;

  const filtered = library.books.filter(book => {
    const matchTerm = book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term);
    const matchCat = category === "" || book.category === category;
    const matchAvail = !onlyAvailable || book.canLoan();
    return matchTerm && matchCat && matchAvail;
  });

  const grid = document.getElementById('booksGrid');
  if (grid) grid.innerHTML = filtered.map(book => renderBookCard(book)).join('');
}

let genreChartInstance = null;
function renderGenreChart() {
  const ctx = document.getElementById('genreChart');
  if (!ctx) return;

  const categories = {};
  library.books.forEach(b => categories[b.category] = (categories[b.category] || 0) + 1);

  if (genreChartInstance) genreChartInstance.destroy();
  genreChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#2E3192', '#FFC20E', '#10b981', '#ef4444', '#8b5cf6']
      }]
    }
  });
}
function showBooks() {
  showSection('bookCatalog');
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  grid.innerHTML = library.books.map(book => renderBookCard(book)).join('');
  updateSidebar(0);
}

function toggleFav(bookId, event) {
  const studentId = localStorage.getItem('studentId');
  const wasFav = library.isFavorite(studentId, bookId);

  library.toggleFavorite(studentId, bookId);
  
  // Dispara a animação apenas se estiver adicionando aos favoritos
  if (!wasFav && event) {
    createFloatingHeart(event.clientX, event.clientY);
  }

  // Atualiza a view atual
  if (document.getElementById('bookCatalog').style.display !== 'none') showBooks();
  else if (document.getElementById('favoritesSection').style.display !== 'none') showFavorites();
}

function createFloatingHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.innerHTML = '❤️';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);

  // Remove o elemento após a animação (1s)
  setTimeout(() => heart.remove(), 1000);
}

function showFavorites() {
  showSection('favoritesSection');
  const studentId = localStorage.getItem('studentId');
  const favGrid = document.getElementById('favoritesGrid');
  
  const favoriteBooks = library.books.filter(book => 
    library.favorites.some(f => f.studentId === studentId && f.bookId === book.id)
  );

  if (favoriteBooks.length === 0) {
    favGrid.innerHTML = '<p class="text-center w-100">Você ainda não tem livros favoritos.</p>';
  } else {
    favGrid.innerHTML = favoriteBooks.map(book => renderBookCard(book)).join('');
  }
  updateSidebar(1);
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

  const profile = JSON.parse(
    localStorage.getItem('studentProfile') ||
    '{"name":"Anônimo","serie":"N/A"}'
  );

  const loan = library.createLoan(
    studentId,
    profile.name,
    profile.serie,
    bookId
  );

  if (loan) {
    showToast(`Emprestado: ${loan.bookTitle}`);
    showBooks();
    loadProfileHeader(); // Atualiza o banner imediatamente
  } else {
    showToast('Livro indisponível!', 'error');
  }
}

function showMyLoans() {
  showSection('myLoansSection');

  const studentId = localStorage.getItem('studentId');

  const myLoans = library.loans.filter(
    l =>
      l.studentId === studentId &&
      l.status === 'active'
  );

  const tbody = document.querySelector(
    '#myLoansTable tbody'
  );

  if (!tbody) return;

  tbody.innerHTML = myLoans.map(loan => `
    <tr>
      <td>${loan.bookTitle}</td>
      <td>${loan.dataEmp}</td>
      <td>${loan.dataDev}</td>

      <td>
        <button
          class="btn-secondary"
          onclick="devolverLivro(${loan.id})"
        >
          Devolver
        </button>
      </td>
    </tr>
  `).join('');

  updateSidebar(2);
}

function devolverLivro(loanId) {
  if (library.returnLoan(loanId)) {
    showToast('Livro devolvido!');
    showMyLoans();
    loadProfileHeader(); // Atualiza o banner imediatamente
  }
}

function showHistory() {
  showSection('historySection');

  const studentId = localStorage.getItem('studentId');

  const history = library.loans.filter(
    l =>
      l.studentId === studentId &&
      l.status.includes('returned')
  );

  const tbody = document.querySelector(
    '#historyTable tbody'
  );

  if (!tbody) return;

  tbody.innerHTML = history.map(loan => `
    <tr>
      <td>${loan.bookTitle}</td>
      <td>${loan.dataEmp}</td>
      <td>${loan.dataDevolucao || 'Pendente'}</td>
      <td>${loan.status.replace('_returned', '')}</td>
    </tr>
  `).join('');

  updateSidebar(3);
}

// ================= PROFESSOR / DASHBOARD =================

function carregarDashboard() {
  const stats = library.getStats();

  const tEmp = document.getElementById('totalEmprestimos');
  const aEmp = document.getElementById('emprestimosAtivos');
  const atEmp = document.getElementById('emprestimosAtrasados');
  const dToday = document.getElementById('devolvidosHoje');

  if (tEmp) tEmp.textContent = stats.total;
  if (aEmp) aEmp.textContent = stats.active;
  if (atEmp) atEmp.textContent = stats.overdue;
  if (dToday) dToday.textContent = stats.devoluToday;

  const tbody = document.getElementById('dashboardTable');

  if (tbody) {
    tbody.innerHTML = library.loans
      .slice(-5)
      .map(l => `
        <tr>
          <td>${l.studentName}</td>
          <td>${l.bookTitle}</td>
          <td>${l.dataEmp}</td>
          <td>${l.status}</td>
        </tr>
      `)
      .reverse()
      .join('');
  }
}

function navegarProfessor(sectionId, el) {
  const sections = ['dashboard', 'alunos', 'relatorios', 'livros', 'devolucoes'];

  sections.forEach(id => {
    const sec = document.getElementById(id);

    if (sec) sec.style.display = 'none';
  });

  const target = document.getElementById(sectionId);

  if (target) target.style.display = 'block';

  document
    .querySelectorAll('.sidebar-prof li')
    .forEach(li => li.classList.remove('active'));

  if (el) el.classList.add('active');

  if (sectionId === 'dashboard') {
    carregarDashboard();
  }

  if (sectionId === 'devolucoes') {
    loadReturnLoans();
  }
}

function loadReturnLoans() {
  const activeLoans = library.loans.filter(
    l => l.status === 'active'
  );

  const list = document.getElementById('returnLoansList');

  if (!list) return;

  list.innerHTML =
    activeLoans.map(loan => `
      <div
        class="loan-item"
        style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;"
      >
        <div>
          <strong>${loan.studentName}</strong>
          - ${loan.bookTitle}
        </div>

        <button
          onclick="returnLoanProf(${loan.id})"
          class="btn-secondary"
        >
          Registrar Devolução
        </button>
      </div>
    `).join('') ||

    '<p>Nenhum empréstimo ativo.</p>';
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

  // Agora digita apenas o nome do arquivo PDF
  const pdf = document.getElementById('newPdf').value.trim();

  const novoLivro = new Book(
    Date.now(),
    titulo,
    autor,
    'capa-padrao.png',
    pdf,
    desc,
    '000-000',
    5,
    5
  );

  library.books.push(novoLivro);

  library.saveData();

  alert('Livro adicionado com sucesso!');

  hideModal('modalAddBook');

  navegarProfessor('dashboardSection');
}

// ================= UTILITÁRIOS DE TELA =================

function showSection(sectionId) {
  const sections = [
    'bookCatalog',
    'favoritesSection',
    'myLoansSection',
    'historySection',
    'configSection'
  ];

  sections.forEach(id => {
    const el = document.getElementById(id);

    if (el) el.style.display = 'none';
  });

  const target = document.getElementById(sectionId);

  if (target) target.style.display = 'block';

  if (sectionId === 'configSection') {
    syncSettingsUI();
  }
}

function syncSettingsUI() {
  const studentId = localStorage.getItem('studentId');
  const returnedCount = library.loans.filter(l => l.studentId === studentId && l.status.includes('returned')).length;
  const level = getReaderLevel(returnedCount);
  const statsInfo = document.getElementById('levelStatsInfo');
  
  if (statsInfo) {
    statsInfo.innerHTML = `Você já devolveu <strong>${returnedCount}</strong> livros.<br>` + 
      (level.next ? `Faltam <strong>${level.next - returnedCount}</strong> livros para o nível "${getReaderLevel(level.next).name}"!` : "Você atingiu o nível máximo de leitura! Parabéns! 🎉");
  }

  // Sincroniza campos do formulário
  const profile = JSON.parse(localStorage.getItem('studentProfile'));
  if (profile) {
    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileSerie').value = profile.serie;
    document.getElementById('avatarSeedInput').value = profile.avatarSeed || '';
  }
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
    searchAluno.oninput = (e) =>
      debounce(() => {
        const term = e.target.value.toLowerCase();

        document
          .querySelectorAll('#booksGrid .card')
          .forEach(card => {
            card.style.display =
              card.textContent
                .toLowerCase()
                .includes(term)
                ? 'block'
                : 'none';
          });
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  library.loadData();

  setupSearch();

  const profileForm = document.getElementById('profileForm');

  if (profileForm) {
    profileForm.addEventListener(
      'submit',
      saveStudentProfile
    );
  }

  const addBookForm = document.getElementById('addBookForm');

  if (addBookForm) {
    addBookForm.addEventListener(
      'submit',
      adicionarNovoLivro
    );
  }

  const pageType = getCurrentPageType();

  const isLogged =
    localStorage.getItem('logado') === 'true';

  if (isLogged) {
    const container = document.getElementById(
      pageType + 'Container'
    );

    const loginCont = document.getElementById(
      'loginContainer'
    );

    if (container && loginCont) {
      loginCont.style.display = 'none';
      container.style.display = 'block';

      if (pageType === 'aluno') {
        afterStudentLogin();
      } else {
        carregarDashboard();
      }
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      hideModal(e.target.id);
    }
  });
});