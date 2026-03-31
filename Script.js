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

// Empréstimos (melhorado com bookId e studentId)
let LOANS = [
    {id: 1, codigo: 'EMPR-1729', studentId: 'maria123', studentName: 'Maria Silva', serie: '2º Ano', bookId: 1, bookTitle: 'Dom Casmurro', dataEmp: '10/10/2024', dataDev: '17/10/2024', status: 'active'},
    {id: 2, codigo: 'EMPR-1730', studentId: 'joao456', studentName: 'João Santos', serie: '3º Ano', bookId: 2, bookTitle: 'O Cortiço', dataEmp: '09/10/2024', dataDev: '16/10/2024', status: 'overdue'},
    {id: 3, codigo: 'EMPR-1728', studentId: 'ana789', studentName: 'Ana Oliveira', serie: '1º Ano', bookId: 3, bookTitle: 'Capitães da Areia', dataEmp: '08/10/2024', dataDev: '15/10/2024', status: 'active'}
];

// ================= PERSISTENCE =================
function saveData() {
    localStorage.setItem('libraryBooks', JSON.stringify(BOOKS));
    localStorage.setItem('libraryLoans', JSON.stringify(LOANS));
}

function loadData() {
    const savedBooks = localStorage.getItem('libraryBooks');
    const savedLoans = localStorage.getItem('libraryLoans');
    if (savedBooks) BOOKS = JSON.parse(savedBooks);
    if (savedLoans) LOANS = JSON.parse(savedLoans);
}

// ================= LOGIN =================
function login(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (usuario === "admin" && senha === "1234") {
        // Login aluno (já existente)
        localStorage.setItem("logado", true);
        localStorage.setItem("tipoUsuario", "aluno");
        window.location.href = "aluno.html";
    } 
    else if (usuario === "professor" && senha === "1234") {
        // Login professor
        localStorage.setItem("logado", true);
        localStorage.setItem("tipoUsuario", "professor");
        window.location.href = "professor.html";
    } 
    else {
        alert("Usuário ou senha incorretos!");
    }
}

// ================= PROTEÇÃO DE ACESSO =================
if (window.location.pathname.includes("professor.html")) {
    if (!localStorage.getItem("logado") || localStorage.getItem("tipoUsuario") !== "professor") {
        window.location.href = "login.html"; // Redireciona para login se não for professor
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipoUsuario");
    window.location.href = "login.html";
}

// ================= TEACHER DASHBOARD =================
const emprestimosMock = [
    {codigo: 'EMPR-1729', aluno: 'Maria Silva', serie: '2º Ano', livro: 'Dom Casmurro', dataEmp: '10/10/2024', dataDev: '17/10/2024', status: 'active'},
    {codigo: 'EMPR-1729', aluno: 'João Santos', serie: '3º Ano', livro: 'O Cortiço', dataEmp: '09/10/2024', dataDev: '16/10/2024', status: 'overdue'},
    {codigo: 'EMPR-1728', aluno: 'Ana Oliveira', serie: '1º Ano', livro: 'Capitães da Areia', dataEmp: '08/10/2024', dataDev: '15/10/2024', status: 'active'},
    {codigo: 'EMPR-1728', aluno: 'Pedro Costa', serie: '2º Ano', livro: 'Dom Casmurro', dataEmp: '07/10/2024', dataDev: '14/10/2024', status: 'active'},
    {codigo: 'EMPR-1727', aluno: 'Lucas Pereira', serie: '3º Ano', livro: 'O Cortiço', dataEmp: '05/10/2024', dataDev: '12/10/2024', status: 'overdue'}
];

function carregarDashboard() {
    const totalEmprestimos = emprestimosMock.length;
    const ativos = emprestimosMock.filter(e => e.status === 'active').length;
    const atrasados = emprestimosMock.filter(e => e.status === 'overdue').length;
    const devolucoesHoje = emprestimosMock.filter(e => e.dataDev === new Date().toLocaleDateString()).length;

    document.getElementById('total-emp').textContent = totalEmprestimos;
    document.getElementById('ativos').textContent = ativos;
    document.getElementById('atrasados').textContent = atrasados;
    document.getElementById('devolucoes').textContent = devolucoesHoje;

    const tbody = document.querySelector('#emprestimos-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    emprestimosMock.slice(0, 8).forEach(emp => {
        const statusClass = emp.status === 'overdue' ? 'status-overdue' : 'status-active';
        tbody.innerHTML += `
            <tr>
                <td>${emp.codigo}</td>
                <td>${emp.aluno}</td>
                <td>${emp.serie}</td>
                <td>${emp.livro}</td>
                <td>${emp.dataEmp}</td>
                <td>${emp.dataDev}</td>
                <td><span class="${statusClass}">${emp.status.toUpperCase()}</span></td>
            </tr>
        `;
    });
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('professor.html')) {
        carregarDashboard();
        const sidebarItems = document.querySelectorAll('.sidebar li');
        if (sidebarItems.length) sidebarItems[0].classList.add('active');
    }
});
