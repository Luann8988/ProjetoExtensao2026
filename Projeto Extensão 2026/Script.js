const loginForm = document.getElementById("loginForm");
const loginContainer = document.getElementById("loginContainer");
const bibliotecaContainer = document.getElementById("bibliotecaContainer");

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if(usuario === "admin" && senha === "1234") {
        loginContainer.style.display = "none";
        bibliotecaContainer.style.display = "block";
        iniciarBiblioteca();
    } else {
        alert("Usuário ou senha incorretos!");
    }
});

// ================= BIBLIOTECA =================
function iniciarBiblioteca() {
    // JS completo da biblioteca (carregar livros, busca, filtros, modal, empréstimos)
}
// ================= PROTEÇÃO DE ACESSO =================
if (window.location.pathname.includes("index.html")) {
    if (!localStorage.getItem("logado")) {
        window.location.href = "login.html";
    }
}

// ================= LIVROS =================
const livros = [
    { titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance", img: "img/domcasmurro.jpg", pdf: "pdf/domcasmurro.pdf" },
    { titulo: "O Cortiço", autor: "Aluísio Azevedo", categoria: "Realismo", img: "img/cortico.jpg", pdf: "pdf/cortico.pdf" },
    { titulo: "Capitães da Areia", autor: "Jorge Amado", categoria: "Drama", img: "img/capitaes.jpg", pdf: "pdf/capitaes.pdf" },
    { titulo: "Memórias Póstumas", autor: "Machado de Assis", categoria: "Romance", img: "img/memorias.jpg", pdf: "pdf/memorias.pdf" }
];

// ================= HISTÓRICO DE EMPRÉSTIMOS =================
function getHistorico() {
    return JSON.parse(localStorage.getItem("emprestimos") || "[]");
}

function salvarHistorico(historico) {
    localStorage.setItem("emprestimos", JSON.stringify(historico));
}

// ================= VERIFICAR BLOQUEIO =================
function estaBloqueado() {
    const bloqueadoAte = localStorage.getItem("bloqueadoAte");
    if (!bloqueadoAte) return false;
    return new Date(bloqueadoAte) > new Date();
}

// ================= CARREGAR LIVROS =================
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

// ================= BUSCA =================
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

// ================= FILTRAR POR CATEGORIA =================
function filtrarCategoria(categoria) {
    if (categoria === "Todos") {
        carregarLivros(livros);
    } else {
        carregarLivros(livros.filter(l => l.categoria === categoria));
    }
}

// ================= BOTÕES =================
function verPDF(pdf) {
    window.open(pdf, "_blank");
}

function retirarBiblioteca(titulo) {
    alert(`Você pode retirar "${titulo}" na biblioteca.`);
}

// ================= MODAL DE EMPRÉSTIMO =================
const modal = document.getElementById("modal");
const formEmprestimo = document.getElementById("emprestimoForm");

function abrirModal(titulo) {
    document.getElementById("livroSelecionado").value = titulo;
    modal.style.display = "flex";
}

function fecharModal() {
    modal.style.display = "none";
}

// ================= CONFIRMAR EMPRÉSTIMO =================
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
});

// ================= VERIFICAR ATRASOS =================
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

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
}

// ================= INICIAR =================
verificarAtrasos();
carregarLivros(livros);