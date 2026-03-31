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
