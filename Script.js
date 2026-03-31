// ================= DATA MODELS =================

// Livros da biblioteca com imagens
const BOOKS = [
    {
        id: 1,
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        image: 'Imagens/domcasmurro.png',
        description: 'Romance clássico sobre amor e traição.',
        isbn: '9788570011234',
        totalCopies: 5,
        availableCopies: 3
    },
    {
        id: 2,
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        image: 'Imagens/ocortico.png', 
        description: 'Naturalismo brasileiro retratando cortiço.',
        isbn: '9788570014569',
        totalCopies: 4,
        availableCopies: 1
    },
    {
        id: 3,
        title: 'Capitães da Areia',
        author: 'Jorge Amado',
        image: 'Imagens/capitaesdeareia.png',
        description: 'Aventura dos meninos de rua em Salvador.',
        isbn: '9788570017898',
        totalCopies: 6,
        availableCopies: 4
    },
    {
        id: 4,
        title: 'Vidas Secas',
        author: 'Graciliano Ramos',
        image: 'Imagens/imagem1.png',
        description: 'Drama da família de retirantes no sertão.',
        isbn: '9788570012347',
        totalCopies: 3,
        availableCopies: 2
    }
];

// Empréstimos (mock para aluno 'admin' e outros)
let LOANS = [
    {id: 1, codigo: 'EMPR-1729', studentId: 'admin', studentName: 'Admin User', serie: '2º Ano', bookId: 1, bookTitle: 'Dom Casmurro', dataEmp: '10/10/2024', dataDev: '17/10/2024', status: 'active'},
    {id: 2, codigo: 'EMPR-1730', studentId: 'joao456', studentName: 'João Santos', serie: '3º Ano', bookId: 2, bookTitle: 'O Cortiço', dataEmp: '09/10/2024', dataDev: '16/10/2024', status: 'overdue'},
    {id: 3, codigo: 'EMPR-1728', studentId: 'admin', studentName: 'Admin User', serie: '2º Ano', bookId: 3, bookTitle: 'Capitães da Areia', dataEmp: '08/10/2024', dataDev: '15/10/2024', status: 'active'}
];

// ================= PERSISTENCE =================
function saveData() {
    localStorage.setItem('libraryBooks', JSON.stringify(BOOKS));
    localStorage.setItem('libraryLoans', JSON.stringify(LOANS));
}

function loadData() {
    const savedBooks = localStorage.getItem('libraryBooks');
    const savedLoans = localStorage.getItem('libraryLoans');
    if (savedBooks) BOOKS.length = 0, [...JSON.parse(savedBooks), ...BOOKS];
    if (savedLoans) LOANS.length = 0, [...JSON.parse(savedLoans), ...LOANS];
}

// ================= UTILS =================
function isLoggedIn() {
    return localStorage.getItem('logado') === 'true';
}

function getUserType() {
    return localStorage.getItem('tipoUsuario');
}

function checkPortalAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'Index.html';
        return false;
    }
    return true;
}

// ================= LOGIN =================
function login(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario')?.value?.trim();
    const senha = document.getElementById('senha')?.value?.trim();

    if (!usuario || !senha) return alert('Preencha usuário e senha');

    if (usuario === 'admin' && senha === '1234') {
        localStorage.setItem('logado', 'true');
        localStorage.setItem('tipoUsuario', 'aluno');
        localStorage.setItem('studentId', 'admin');
        showStudentDashboard();
    } else if (usuario === 'professor' && senha === '1234') {
        localStorage.setItem('logado', 'true');
        localStorage.setItem('tipoUsuario', 'professor');
        showProfessorDashboard();
    } else {
        alert('Credenciais inválidas!');
    }
}

function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('studentId');
    // Redirect to index
    window.location.href = 'Index.html';
}

// ================= STUDENT FUNCTIONS =================
function showStudentDashboard() {
    const loginContainer = document.getElementById('loginContainer');
    const alunoContainer = document.getElementById('alunoContainer');
    if (loginContainer && alunoContainer) {
        loginContainer.style.display = 'none';
        alunoContainer.style.display = 'block';
    }
    loadData();
    showBooks();
}

function showBooks() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    grid.innerHTML = BOOKS.map(book => `
        <div class="card">
            <img src="${book.image}" alt="${book.title}" class="capa">
            <div class="card-content">
                <h3>${book.title}</h3>
                <p><strong>${book.author}</strong></p>
                <p>${book.description}</p>
                <span class="categoria">${book.availableCopies}/${book.totalCopies} disponíveis</span>
                <br>
                <button class="btn-emprestar" onclick="emprestarLivro(${book.id})">Emprestar</button>
            </div>
        </div>
    `).join('');
    
    // Update sidebar
    document.querySelectorAll('.sidebar li').forEach((li, i) => {
        li.classList.toggle('active', i === 0);
    });
}

function showMyLoans() {
    const studentId = localStorage.getItem('studentId') || 'admin';
    const myLoans = LOANS.filter(loan => loan.studentId === studentId && loan.status === 'active');
    const tbody = document.getElementById('myLoansTable').querySelector('tbody');
    tbody.innerHTML = myLoans.map(loan => {
        const book = BOOKS.find(b => b.id === loan.bookId);
        const statusClass = loan.status === 'overdue' ? 'status-overdue' : 'status-active';
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
    
    document.querySelectorAll('.sidebar li')[1].classList.add('active');
    document.querySelectorAll('.sidebar li')[0].classList.remove('active');
}

function showHistory() {
    alert('Histórico de empréstimos - Em desenvolvimento');
}

// Mock actions
function emprestarLivro(bookId) {
    alert(`Livro ${BOOKS.find(b => b.id === bookId).title} emprestado com sucesso!`);
}

function devolverLivro(loanId) {
    alert(`Empréstimo ${loanId} devolvido!`);
}

// ================= PROFESSOR FUNCTIONS =================
function showProfessorDashboard() {
    const loginContainer = document.getElementById('loginContainer');
    const profContainer = document.getElementById('professorContainer');
    if (loginContainer && profContainer) {
        loginContainer.style.display = 'none';
        profContainer.style.display = 'block';
    }
    carregarDashboard();
}

// Existing professor functions (enhanced)
const emprestimosMock = [
    {codigo: 'EMPR-1729', aluno: 'Admin User', serie: '2º Ano', livro: 'Dom Casmurro', dataEmp: '10/10/2024', dataDev: '17/10/2024', status: 'active'},
    {codigo: 'EMPR-1730', aluno: 'João Santos', serie: '3º Ano', livro: 'O Cortiço', dataEmp: '09/10/2024', dataDev: '16/10/2024', status: 'overdue'},
    {codigo: 'EMPR-1728', aluno: 'Admin User', serie: '2º Ano', livro: 'Capitães da Areia', dataEmp: '08/10/2024', dataDev: '15/10/2024', status: 'active'}
];

function carregarDashboard() {
    const totalEmprestimos = LOANS.length;
    const ativos = LOANS.filter(e => e.status === 'active').length;
    const atrasados = LOANS.filter(e => e.status === 'overdue').length;
    const devolucoesHoje = 0; // Simplified

    document.getElementById('total-emp').textContent = totalEmprestimos;
    document.getElementById('ativos').textContent = ativos;
    document.getElementById('atrasados').textContent = atrasados;
    document.getElementById('devolucoes').textContent = devolucoesHoje;

    const tbody = document.querySelector('#emprestimos-table tbody');
    tbody.innerHTML = LOANS.slice(0, 8).map(emp => {
        const statusClass = emp.status === 'overdue' ? 'status-overdue' : 'status-active';
        return `
            <tr>
                <td>${emp.codigo}</td>
                <td>${emp.studentName}</td>
                <td>${emp.serie}</td>
                <td>${emp.bookTitle}</td>
                <td>${emp.dataEmp}</td>
                <td>${emp.dataDev}</td>
                <td><span class="${statusClass}">${emp.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // Portal protection
    if (window.location.pathname.includes('Aluno.html')) {
        if (checkPortalAccess() && getUserType() === 'aluno') {
            showStudentDashboard();
        } else if (!isLoggedIn()) {
            // Show login
        }
    } else if (window.location.pathname.includes('Professor.html')) {
        if (checkPortalAccess() && getUserType() === 'professor') {
            showProfessorDashboard();
        } else if (!isLoggedIn()) {
            // Show login
        }
    }

    // Search handlers (basic)
    const searchAluno = document.getElementById('searchAluno');
    const searchProf = document.getElementById('searchProf');
    if (searchAluno) searchAluno.oninput = filterBooks;
    if (searchProf) searchProf.oninput = filterLoans;
});

function filterBooks(e) {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('#booksGrid .card');
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(term) ? 'block' : 'none';
    });
}

function filterLoans(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#emprestimos-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// Professor action stubs
function verTodosEmprestimos() { alert('Todos os empréstimos'); }
function gerarRelatorio() { alert('Relatório gerado'); }
function adicionarLivro() { alert('Adicionar livro'); }
function registrarDevolucao() { alert('Registrar devolução'); }

