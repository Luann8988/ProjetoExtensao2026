const IMAGES_PATH = 'Imagens/';
const PDF_PATH = 'PDF/'; // Pasta dos PDFs locais
const STORAGE_VERSION = '1.2';
const OVERDUE_DAYS = 7;
const MAX_LOANS_PER_STUDENT = 3;

class Book {
  constructor(id, title, author, image, pdfFile, description, isbn, totalCopies, availableCopies = totalCopies, category = 'Geral') {
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = image.startsWith('http') ? image : IMAGES_PATH + image; // Allow external images
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
    this.reservas = [];
    this.initBooks();
  }

  initBooks() {
    // O ideal agora é buscar do banco de dados
    // this.fetchBooksFromServer(); 
    
    // Mantendo estático por enquanto, mas sugerindo a mudança:
    this.books = [
      new Book(1, 'Dom Casmurro', 'Machado de Assis', 'domcasmurro.png', 'domcasmurro.pdf', 'Romance clássico sobre amor e traição.', '9788570011234', 5, 3),
      new Book(2, 'O Cortiço', 'Aluísio Azevedo', 'ocortico.png', 'ocortico.pdf', 'Romance naturalista que retrata a vida em um cortiço carioca.', '9788570011235', 4, 1, 'Clássicos'),
      new Book(3, 'Capitães da Areia', 'Jorge Amado', 'capitaesdaareia.png', 'capitaesdaareia.pdf', 'A vida de um grupo de meninos de rua em Salvador.', '9788570011236', 6, 6, 'Aventura'),
      new Book(4, 'Vidas Secas', 'Graciliano Ramos', 'VidasSecas.png', 'vidassecas.pdf', 'Drama da família de retirantes no sertão nordestino.', '9788570012347', 3, 2, 'Drama'),
      new Book(5, 'Memórias Póstumas de Brás Cubas', 'Machado de Assis', 'memorias.png', 'memoriaspostumasdebrascubas.pdf', 'Narrativa inovadora do defunto-autor, com crítica social e humor.', '9788570015678', 5, 5, 'Clássicos'),
      new Book(6, 'A Moreninha', 'Joaquim Manuel de Macedo', 'Morena.png', 'amoreninha.pdf', 'Romance romântico ambientado no Rio de Janeiro do século XIX.', '9788570018901', 4, 2, 'Romance'),
      new Book(7, 'O Primo Basílio', 'Eça de Queirós', 'primobasilio.png', 'primobasilio.pdf', 'Crítica social e adultério na sociedade burguesa de Lisboa.', '9788570013458', 5, 3, 'Drama'),
      new Book(8, 'A Escrava Isaura', 'Bernardo Guimarães', 'escravaisaura.png', 'escravaisaura.pdf', 'Romance abolicionista que narra a luta de Isaura pela liberdade.', '9788570016789', 4, 1, 'Drama'),
      new Book(9, 'Senhora', 'José de Alencar', 'senhora.png', 'senhora.pdf', 'Romance urbano sobre amor, dinheiro e convenções sociais.', '9788570019012', 6, 4, 'Romance'),
      new Book(10, 'O Guarani', 'José de Alencar', 'guarani.png', 'guarani.pdf', 'Romance indianista ambientado no Brasil colonial, com aventura e romance.', '9788570010123', 5, 5, 'Aventura'),
      new Book(11, 'Iracema', 'José de Alencar', 'iracema.png', 'iracema.pdf', 'Romance indianista sobre a origem do Ceará e o amor entre Iracema e Martim.', '9788570012345', 4, 2, 'Romance'),
      new Book(12, 'O Mulato', 'Aluísio Azevedo', 'mulato.png', 'mulato.pdf', 'Romance naturalista que aborda racismo e preconceito na sociedade maranhense.', '9788570016780', 3, 1, 'Drama'),
      new Book(13, 'A Luneta Mágica', 'Machado de Assis', 'luneta.png', 'luneta.pdf', 'Conto fantástico sobre a percepção da realidade e a ilusão.', '9788570018900', 5, 4, 'Clássicos'),
      new Book(14, 'O Seminarista', 'Bernardo Guimarães', 'seminarista.png', 'seminarista.pdf', 'Romance sobre dilemas morais e amorosos de um jovem seminarista.', '9788570015670', 4, 2, 'Drama'),
      new Book(15, 'Quincas Borba', 'Machado de Assis', 'quincasborba.jpg', 'quincasborba.pdf', 'A filosofia do Humanitismo e a loucura, com crítica à sociedade da época.', '9788570015671', 5, 5, 'Clássicos'),
      new Book(16, 'A Hora da Estrela', 'Clarice Lispector', 'horadaestrela.jpg', 'horadaestrela.pdf', 'A vida de Macabéa, uma datilógrafa nordestina no Rio de Janeiro.', '9788570015672', 4, 4, 'Drama'),
      new Book(17, 'Sagarana', 'João Guimarães Rosa', 'sagarana.jpg', 'sagarana.pdf', 'Contos regionalistas de Minas Gerais, com linguagem inovadora.', '9788570015673', 3, 3, 'Aventura'),
      new Book(18, 'Os Sertões', 'Euclides da Cunha', 'sertoes.jpg', 'sertoes.pdf', 'Relato da Guerra de Canudos, com análise histórica, geográfica e sociológica.', '9788570015674', 2, 2, 'História'),
      new Book(19, 'Auto da Compadecida', 'Ariano Suassuna', 'autocompadecida.jpg', 'autocompadecida.pdf', 'Peça teatral que mistura elementos do folclore nordestino e da religiosidade popular.', '9788570015675', 6, 6, 'Comédia'),
      new Book(20, 'Morte e Vida Severina', 'João Cabral de Melo Neto', 'severina.jpg', 'severina.pdf', 'Poema dramático sobre a vida e a morte do retirante nordestino.', '9788570015676', 5, 5, 'Drama')
    ];

    // Populate categories for the filter dropdown
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
        favorites: this.favorites,
        reservas: this.reservas
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
      this.reservas = parsed.reservas || [];
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
  // Remove apenas os dados da sessão atual para pedir login novamente
  localStorage.removeItem('logado');
  localStorage.removeItem('tipoUsuario');
  localStorage.removeItem('studentId');
  localStorage.removeItem('studentName');
  localStorage.removeItem('professorId');
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

  // Limpa mensagem de erro anterior
  const errorEl = document.getElementById('loginErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
  }

  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();

  const pageType = getCurrentPageType();

  // Aqui você deve fazer um fetch para um arquivo PHP que valide o login
  // Exemplo simplificado com credenciais hardcoded para fins educacionais:
  let isAuthenticated = false;
  let userId = '';
  let userName = '';

  if (pageType === 'aluno') {
    if (usuario === 'aluno' && senha === '123') { // Exemplo de credenciais para aluno
      isAuthenticated = true;
      userId = 'aluno123'; // ID único para o aluno
      userName = 'Aluno Teste';
    }
  } else if (pageType === 'professor') {
    if (usuario === 'prof' && senha === '123') { // Exemplo de credenciais para professor
      isAuthenticated = true;
      userId = 'prof456'; // ID único para o professor
      userName = 'Prof. Bibliotecário';
    }
  }

  if (isAuthenticated) {
    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipoUsuario', pageType);
    if (pageType === 'aluno') {
      localStorage.setItem('studentId', userId);
      localStorage.setItem('studentName', userName);
      // Inicializa o perfil do aluno se não existir
      let profile = JSON.parse(localStorage.getItem('studentProfile'));
      if (!profile) {
        profile = { name: userName, serie: 'Aluno Regular', avatarSeed: userId };
        localStorage.setItem('studentProfile', JSON.stringify(profile));
      }
    } else if (pageType === 'professor') {
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
        // Para professor, garantir que a seção correta seja exibida inicialmente
        carregarDashboard();
        navegarProfessor('dashboard', document.querySelector('.sidebar-prof li.menu-item'));
        renderGenreChart(); // Renderiza o gráfico para o dashboard do professor
      }
    }
    showToast('Login realizado com sucesso!');
  } else {
    if (errorEl) {
      errorEl.textContent = 'Usuário ou senha incorretos. Verifique seus dados e tente novamente.';
      errorEl.style.display = 'block';
    }
    showToast('Acesso negado!', 'error');
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
  let studentName = localStorage.getItem('studentName') || 'Estudante';
  let studentId = localStorage.getItem('studentId') || '000';

  // Se o studentId não estiver definido (ex: primeira vez logando com credenciais hardcoded)
  if (studentId === '000' && localStorage.getItem('logado') === 'true' && localStorage.getItem('tipoUsuario') === 'aluno') {
    studentId = 'aluno123'; // Define um ID padrão
    studentName = 'Aluno Teste'; // Define um nome padrão
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('studentName', studentName);
  }
  
  // Cria o perfil automaticamente se não existir
  // Usa o studentId como avatarSeed padrão se não houver um perfil salvo
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

    const modal = document.getElementById('modalStudentProfile');
    if (modal) hideModal('modalStudentProfile');
    loadProfileHeader(profile);

    showToast('Perfil salvo! 🎉');
  } else {
    showToast('Preencha todos os campos!', 'error');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  showToast(isDark ? 'Modo Escuro Ativado 🌙' : 'Modo Claro Ativado ☀️', 'info');
}

function exportMyData() {
  const studentId = localStorage.getItem('studentId');
  const profile = JSON.parse(localStorage.getItem('studentProfile'));
  const myLoans = library.loans.filter(l => l.studentId === studentId);
  
  const data = {
    perfil: profile,
    historico_emprestimos: myLoans,
    exportado_em: new Date().toLocaleString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meus_dados_biblioteca_${studentId}.json`;
  a.click();
  showToast('Seus dados foram exportados! 💾');
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
  if (grid) {
    grid.innerHTML = filtered.length > 0 
      ? filtered.map(book => renderBookCard(book)).join('')
      : `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
          <i class="fas fa-search" style="font-size: 30px; margin-bottom: 10px;"></i><br>Nenhum livro encontrado com esses filtros.</div>`;
  }
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
  // Chama filterBooks para garantir que os filtros ativos sejam aplicados
  filterBooks();
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

  const tbody = document.getElementById('dashboardLoansBody');

  if (tbody) {
    tbody.innerHTML = library.loans
      .slice(-5)
      .map(l => {
        const isOverdue = library.isOverdue(l);
        let statusClass = 'status-active';
        let statusText = 'Em Dia';

        if (l.status.includes('returned')) {
          statusClass = 'status-returned';
          statusText = 'Devolvido';
        } else if (isOverdue) {
          statusClass = 'status-overdue';
          statusText = 'Atrasado';
        }

        const actionBtn = (isOverdue && !l.status.includes('returned')) 
          ? `<button class="btn-email-alert" onclick="enviarLembreteEmail(${l.id})" title="Enviar lembrete por e-mail">📧</button>`
          : '-';

        return `
          <tr>
            <td style="color: var(--accent); font-weight: bold;">${l.codigo || '#'+l.id.toString().slice(-3)}</td>
            <td>${l.studentName}</td>
            <td>${l.bookTitle}</td>
            <td>${l.dataEmp}</td>
            <td>${l.dataDev}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td style="text-align:center;">${actionBtn}</td>
          </tr>
        `;
      })
      .reverse()
      .join('');
  }
}

function enviarLembreteEmail(loanId) {
  const loan = library.loans.find(l => l.id === loanId);
  if (!loan) return;
  
  const subject = encodeURIComponent(`Lembrete de Devolução: ${loan.bookTitle}`);
  const body = encodeURIComponent(`Olá ${loan.studentName},\n\nIdentificamos que o livro "${loan.bookTitle}" está com a data de devolução (${loan.dataDev}) atrasada. Por favor, pedimos que compareça à biblioteca o quanto antes.\n\nAtenciosamente,\nBiblioteca Escolar.`);
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  showToast('Abrindo gerenciador de e-mail...', 'info');
}

function renderAlunos(term = '') {
  const grid = document.getElementById('alunosGrid');
  if (!grid) return;

  // Mapeia alunos únicos a partir dos empréstimos
  const studentsMap = new Map();
  library.loans.forEach(l => {
    if (!studentsMap.has(l.studentId)) {
      studentsMap.set(l.studentId, { name: l.studentName, serie: l.serie });
    }
  });

  const filtered = Array.from(studentsMap.values()).filter(s => 
    s.name.toLowerCase().includes(term.toLowerCase()) || s.serie.toLowerCase().includes(term.toLowerCase())
  );

  grid.innerHTML = filtered.length ? filtered.map(s => `
    <div class="card" style="padding: 15px; text-align: center; background: #111827; border: 1px solid #1e293b;">
      <div style="font-size: 30px; margin-bottom: 5px;">👤</div>
      <h3 style="font-size: 16px; color: var(--accent);">${s.name}</h3>
      <p style="font-size: 13px; color: #94a3b8;">${s.serie}</p>
    </div>
  `).join('') : '<p style="padding: 20px;">Nenhum aluno encontrado.</p>';
}

function navegarProfessor(sectionId, el) {
  const sections = ['dashboard', 'alunos', 'relatorios', 'livros', 'devolucoes', 'chatSection', 'notificacoes', 'turmas', 'reservas'];

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

  if (sectionId === 'alunos') {
    renderAlunos();
  }

  if (sectionId === 'devolucoes') {
    loadReturnLoans();
  }

  if (sectionId === 'chatSection') {
    chat.renderChat();
  }

  if (sectionId === 'notificacoes') {
    // Opcional: renderizar uma prévia ou estatísticas aqui
  }

  if (sectionId === 'turmas') {
    renderTurmas();
  }

  if (sectionId === 'reservas') {
    renderReservas();
  }
}

function exportarRelatorio(formato) {
  if (library.loans.length === 0) {
    showToast('Não há dados para exportar!', 'error');
    return;
  }

  const data = library.loans.map(l => ({
    'Código': l.codigo || l.id,
    'Aluno': l.studentName,
    'Livro': l.bookTitle,
    'Empréstimo': l.dataEmp,
    'Devolução Prevista': l.dataDev,
    'Status': l.status
  }));

  if (formato === 'csv' || formato === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Emprestimos");
    
    const filename = `relatorio_biblioteca_${new Date().getTime()}`;
    if (formato === 'excel') {
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
    }
  } else if (formato === 'pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("Relatório de Empréstimos - Biblioteca", 14, 15);
    
    const headers = [Object.keys(data[0])];
    const rows = data.map(item => Object.values(item));

    doc.autoTable({
      startY: 20,
      head: headers,
      body: rows,
      theme: 'striped'
    });

    doc.save(`relatorio_biblioteca_${new Date().getTime()}.pdf`);
  }
  showToast(`Relatório ${formato.toUpperCase()} gerado com sucesso!`);
}

function renderNotificacoes() {
  const overdueLoans = library.loans.filter(l => l.status === 'active' && library.isOverdue(l));
  const container = document.getElementById('notificacoesList');
  if (!container) return;
  
  if (overdueLoans.length === 0) {
    container.innerHTML = '<p>Não há notificações pendentes.</p>';
    return;
  }

  container.innerHTML = overdueLoans.map(l => `
    <div class="loan-item" style="border-left-color: var(--error)">
      <div>
        <strong>⚠️ Atraso:</strong> ${l.studentName} está com o livro "${l.bookTitle}" em atraso.
      </div>
      <button class="btn-primary" onclick="showToast('Aviso enviado ao aluno!', 'info')">Notificar Aluno</button>
    </div>
  `).join('');
}

function renderTurmas() {
  const turmas = {};
  library.loans.forEach(l => {
    if (l.serie) {
      turmas[l.serie] = (turmas[l.serie] || 0) + 1;
    }
  });
  
  const container = document.getElementById('turmasGrid');
  if (!container) return;

  const entries = Object.entries(turmas);
  if (entries.length === 0) {
    container.innerHTML = '<p>Nenhuma turma registrada nos empréstimos.</p>';
    return;
  }

  container.innerHTML = entries.map(([nome, total]) => `
    <div class="card" style="text-align: center; padding: 20px;">
      <div class="stat-number" style="font-size: 24px; color: var(--accent);">${nome}</div>
      <p style="margin: 0; color: #cbd5e1;">${total} Empréstimos</p>
    </div>
  `).join('');
}

function renderReservas() {
  const container = document.getElementById('reservasList');
  if (!container) return;
  
  const reservas = library.reservas || [];
  
  if (reservas.length === 0) {
    container.innerHTML = '<p>Não há reservas pendentes.</p>';
    return;
  }

  container.innerHTML = reservas.map(r => `
    <div class="loan-item">
      <div>
        <strong>${r.studentName}</strong> reservou "${r.bookTitle}" em ${r.data || new Date().toLocaleDateString()}
      </div>
      <span class="badge bg-warning">${r.status || 'pendente'}</span>
    </div>
  `).join('');
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

// ================= CHAT SYSTEM =================

class ChatManager {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
  }

  sendMessage(text, type) {
    const profile = JSON.parse(localStorage.getItem('studentProfile')) || { name: 'Visitante', serie: 'N/A' };
    const newMessage = {
      id: Date.now(),
      text,
      type, // 'aluno' ou 'professor'
      nome: type === 'aluno' ? profile.name : 'Prof. Bibliotecário',
      turma: type === 'aluno' ? profile.serie : '',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(newMessage);
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
    this.renderChat();
  }

  renderChat() {
    const chatBox = document.getElementById('chatMessages');
    if (!chatBox) return;

    chatBox.innerHTML = this.messages.map(m => `
      <div class="message ${m.type}">
        <div class="message-info">
          <span class="sender-name">${m.nome} ${m.turma ? `(${m.turma})` : ''}</span>
          <span class="message-time">${m.time}</span>
        </div>
        <div class="message-text">${m.text}</div>
      </div>
    `).join('');
    
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

const chat = new ChatManager();

function handleChatSubmit(e, type) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input.value.trim()) {
    chat.sendMessage(input.value, type);
    input.value = '';
  }
}

function showChat() {
  showSection('chatSection');
  chat.renderChat();
  updateSidebar(4);
}

// ================= UTILITÁRIOS DE TELA =================

function showSection(sectionId) {
  const sections = [
    'bookCatalog',
    'favoritesSection',
    'myLoansSection',
    'historySection',
    'configSection',
    'chatSection'
  ];

  sections.forEach(id => {
    // Pequeno ajuste para garantir que o container do Aluno.php (PHP) também funcione com as mesmas IDs
    const el = document.getElementById(id);

    if (el) el.style.display = 'none';
  });

  const target = document.getElementById(sectionId);

  if (target) target.style.display = 'block';

  // Atualiza o menu lateral baseado na seção
  const menuMapping = { 'bookCatalog': 0, 'favoritesSection': 1, 'myLoansSection': 2, 'historySection': 3, 'chatSection': 4, 'configSection': 5 };
  if(menuMapping[sectionId] !== undefined) updateSidebar(menuMapping[sectionId]);

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

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = 40; // Quantidade de partículas
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 5 + 2 + 'px'; // Tamanhos variados entre 2px e 7px
    particle.style.width = size;
    particle.style.height = size;
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.setProperty('--d', Math.random() * 15 + 10 + 's'); // Duração entre 10s e 25s
    particle.style.animationDelay = Math.random() * 20 + 's';
    container.appendChild(particle);
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
    searchAluno.oninput = () => debounce(filterBooks); // Chama filterBooks para aplicar todos os filtros
  }

  // Preenche as categorias no filtro ao carregar
  const filterCategorySelect = document.getElementById('filterCategory');
  if (filterCategorySelect && filterCategorySelect.options.length <= 1) { // Evita duplicar se já houver opções
    const uniqueCategories = [...new Set(library.books.map(book => book.category))];
    uniqueCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterCategorySelect.appendChild(option);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  library.loadData();

  // Inicializa o preenchimento das categorias e o setup da busca
  // Isso precisa ser feito antes de `afterStudentLogin` ou `carregarDashboard`
  // para que os filtros estejam prontos.
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

  // Inicializa o efeito de partículas se o container existir
  initParticles();

  const pageType = getCurrentPageType();

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      hideModal(e.target.id);
    }
  });
});