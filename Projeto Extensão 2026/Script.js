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
// ================= LIVROS =================
const livros = [
  {
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    categoria: "Romance",
    img: "img/domcasmurro.jpg",
    pdf: "pdf/domcasmurro.pdf"
  },
  {
    titulo: "O Cortiço",
    autor: "Aluísio Azevedo",
    categoria: "Realismo",
    img: "img/cortico.jpg",
    pdf: "pdf/cortico.pdf"
  },
  {
    titulo: "Capitães da Areia",
    autor: "Jorge Amado",
    categoria: "Drama",
    img: "img/capitaes.jpg",
    pdf: "pdf/capitaes.pdf"
  },
  {
    titulo: "Memórias Póstumas",
    autor: "Machado de Assis",
    categoria: "Romance",
    img: "img/memorias.jpg",
    pdf: "pdf/memorias.pdf"
  }
];

// ================= SISTEMA DE BLOQUEIO =================
let bloqueadoAte = localStorage.getItem("bloqueadoAte");

function estaBloqueado() {
  if (!bloqueadoAte) return false;

  const hoje = new Date();
  return new Date(bloqueadoAte) > hoje;
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
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
        <span class="categoria">${livro.categoria}</span>

        <button onclick="verPDF('${livro.pdf}')">📖 Ver PDF</button>
        <button onclick="retirarBiblioteca('${livro.titulo}')">🏫 Retirar na Biblioteca</button>
        <button onclick="emprestar('${livro.titulo}')">📚 Emprestar</button>
      </div>
    `;
  });
}

// ================= BUSCA =================
const search = document.getElementById("search");
if (search) {
  search.addEventListener("input", () => {
    const termo = search.value.toLowerCase();

    const filtrados = livros.filter(l =>
      l.titulo.toLowerCase().includes(termo) ||
      l.categoria.toLowerCase().includes(termo)
    );

    carregarLivros(filtrados);
  });
}

// ================= PDF =================
function verPDF(pdf) {
  window.open(pdf, "_blank");
}

// ================= RETIRAR =================
function retirarBiblioteca(titulo) {
  alert(`Você pode retirar "${titulo}" na biblioteca da escola.`);
}

// ================= EMPRÉSTIMO =================
function emprestar(titulo) {
  if (estaBloqueado()) {
    alert("Você está bloqueado por atraso! Aguarde 7 dias.");
    return;
  }

  const hoje = new Date();
  const devolucao = new Date();

  devolucao.setDate(hoje.getDate() + 7); // 7 dias

  localStorage.setItem("livroEmprestado", titulo);
  localStorage.setItem("dataDevolucao", devolucao);

  alert(`Livro "${titulo}" emprestado!\nDevolução até: ${devolucao.toLocaleDateString()}`);
}

// ================= VERIFICAR ATRASO =================
function verificarAtraso() {
  const data = localStorage.getItem("dataDevolucao");
  if (!data) return;

  const hoje = new Date();
  const devolucao = new Date(data);

  if (hoje > devolucao) {
    const bloqueio = new Date();
    bloqueio.setDate(hoje.getDate() + 7);

    localStorage.setItem("bloqueadoAte", bloqueio);
    alert("Você atrasou a devolução! Bloqueado por 7 dias.");
  }
}

// ================= INICIAR =================
verificarAtraso();
carregarLivros(livros);