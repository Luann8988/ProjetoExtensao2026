// ================= LOGIN =================
function login(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "admin" && senha === "1234") {
        localStorage.setItem("logado", true);
        window.location.href = "index.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

// ================= PROTEÇÃO DE ACESSO =================
if (window.location.pathname.includes("index.html") || window.location.pathname.includes("professor.html")) {
    if (!localStorage.getItem("logado")) {
        window.location.href = "aluno.html";
    }
}

// ================= TEACHER DASHBOARD =================
const emprestimosMock = [
    {codigo: 'EMPR-1729...', aluno: 'Maria Silva', serie: '2º Ano', livro: 'Dom Casmurro', dataEmp: '10/10/2024', dataDev: '17/10/2024', status: 'active'},
    {codigo: 'EMPR-1729...', aluno: 'João Santos', serie: '3º Ano', livro: 'O Cortiço', dataEmp: '09/10/2024', dataDev: '16/10/2024', status: 'overdue'},
    {codigo: 'EMPR-1728...', aluno: 'Ana Oliveira', serie: '1º Ano', livro: 'Capitães da Areia', dataEmp: '08/10/2024', dataDev: '15/10/2024', status: 'active'},
    {codigo: 'EMPR-1728...', aluno: 'Pedro Costa', serie: '2º Ano', livro: 'Dom Casmurro', dataEmp: '07/10/2024', dataDev: '14/10/2024', status: 'active'},
    {codigo: 'EMPR-1727...', aluno: 'Lucas Pereira', serie: '3º Ano', livro: 'O Cortiço', dataEmp: '05/10/2024', dataDev: '12/10/2024', status: 'overdue'}
];

function carregarDashboard() {
    // Stats
    const totalEmprestimos = emprestimosMock.length;
    const ativos = emprestimosMock.filter(e => e.status === 'active').length;
    const atrasados = emprestimosMock.filter(e => e.status === 'overdue').length;
    const devolucoesHoje = emprestimosMock.filter(e => e.dataDev === '11/10/2024').length; // Mock today

    document.getElementById('total-emp').textContent = totalEmprestimos;
    document.getElementById('ativos').textContent = ativos;
    document.getElementById('atrasados').textContent = atrasados;
    document.getElementById('devolucoes').textContent = devolucoesHoje;

    // Table
    const tbody = document.querySelector('#emprestimos-table tbody');
    tbody.innerHTML = '';
    emprestimosMock.slice(0,8).forEach(emp => {
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

// ================= LIVROS (student pages) =================
const livros = [
    { titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance", img: "imagens/domcasmurro.png", pdf: "pdf/domcasmurro.pdf" },
    { titulo: "O Cortiço", autor: "Aluísio Azevedo", categoria: "Realismo", img: "imagens/ocortico.png", pdf: "pdf/cortico.pdf" },
    { titulo: "Capitães da Areia", autor: "Jorge Amado", categoria: "Drama", img: "imagens/capitaesdeareia.png", pdf: "pdf/capitaes.pdf" },
    { titulo: "Memórias Póstumas", autor: "Machado de Assis", categoria: "Romance", img: "imagens/memorias.jpg", pdf: "pdf/memorias.pdf" }
];

// Rest of student functions unchanged...
function getHistorico() {
    return JSON.parse(localStorage.getItem("emprestimos") || "[]");
}

function salvarHistorico(historico) {
    localStorage.setItem("emprestimos", JSON.stringify(historico));
}

function estaBloqueado() {
    const bloqueadoAte = localStorage.getItem("bloqueadoAte");
    if (!bloqueadoAte) return false;
    return new Date(bloqueadoAte) > new Date();
}

function carregarLivros(lista) {
    const container = document.getElementById("livros");
    if (!container) return;

    container.innerHTML = "";

    lista.forEach(livro => {
        container.innerHTML += `
            <div class="card">
                <img src="${livro.img}" class="capa">
                <div class="card-content">
                    <h3>${livro.titulo}</h3>
                    <p>${livro.autor}</p>
                    <span class="categoria">${livro.categoria}</span>
                    <button class="btn-pdf" onclick="verPDF('${livro.pdf}')">📖 Ver PDF</button>
                    <button class="btn-biblioteca" onclick="retirarBiblioteca('${livro.titulo}')">🏫 Biblioteca</button>
                    <button class="btn-emprestar" onclick="abrirModal('${livro.titulo}')">📚 Emprestar</button>
                </div>
            </div>
        `;
    });
}

const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        const termo = e.target.value.toLowerCase();
        const filtrados = livros.filter(l =>
            l.titulo.toLowerCase().includes(termo) ||
            l.autor.toLowerCase().includes(termo) ||
            l.categoria.toLowerCase().includes(termo)
        );
        carregarLivros(filtrados);
    });
}

function filtrarCategoria(categoria) {
    if (categoria === "Todos") {
        carregarLivros(livros);
    } else {
        carregarLivros(livros.filter(l => l.categoria === categoria));
    }
}

function verPDF(pdf) {
    window.open(pdf, "_blank");
}

function retirarBiblioteca(titulo) {
    alert(`Você pode retirar "${titulo}" na biblioteca.`);
}

const modal = document.getElementById("modal");
const formEmprestimo = document.getElementById("emprestimoForm");

function abrirModal(titulo) {
    document.getElementById("livroSelecionado").value = titulo;
    modal.style.display = "flex";
}

function fecharModal() {
    modal.style.display = "none";
}

formEmprestimo.addEventListener("submit", e => {
    e.preventDefault();

    if (estaBloqueado()) {
        alert("Você está bloqueado por atraso! Aguarde 7 dias.");
        fecharModal();
        return;
    }

    const nome = document.getElementById("nomeAluno").value;
    const serie = document.getElementById("serieAluno").value;
    const livro = document.getElementById("livroSelecionado").value;

    const codigo = "EMPR-" + Date.now();

    const historico = getHistorico();
    const dataHoje = new Date();
    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataHoje.getDate() + 7);

    historico.push({
        codigo,
        nome,
        serie,
        livro,
        dataEmprestimo: dataHoje.toLocaleDateString(),
        dataDevolucao: dataDevolucao.toLocaleDateString()
    });

    salvarHistorico(historico);

    alert(`Livro "${livro}" emprestado com sucesso!\nAluno: ${nome} (Série: ${serie})\nCódigo: ${codigo}\nDevolução até: ${dataDevolucao.toLocaleDateString()}`);
    fecharModal();
    carregarLivros(livros); // Refresh
});

function verificarAtrasos() {
    const historico = getHistorico();
    const hoje = new Date();

    let bloqueio = false;

    historico.forEach(emp => {
        const dataDev = new Date(emp.dataDevolucao.split("/").reverse().join("-"));
        if (hoje > dataDev) {
            bloqueio = true;
        }
    });

    if (bloqueio) {
        const bloqueioAte = new Date();
        bloqueioAte.setDate(hoje.getDate() + 7);
        localStorage.setItem("bloqueadoAte", bloqueioAte);
        alert("Algum empréstimo está atrasado! Bloqueado por 7 dias.");
    }
}

function logout() {
    localStorage.removeItem("logado");
    localStorage.removeItem("bloqueadoAte");
    window.location.href = "aluno.html";
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {
    verificarAtrasos();
    
    if (window.location.pathname.includes('professor.html')) {
        carregarDashboard();
        document.querySelector('.sidebar li').classList.add('active'); // Highlight dashboard
    } else {
        carregarLivros(livros);
    }
});
