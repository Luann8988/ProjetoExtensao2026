function login(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

if (usuario == "admin" && senha === "1234") {
        window.location.href = "index.html";
    } else {
        alert("Usuario ou senha incorretos !");
    }
}
/// Livros 
const livros = [
  { titulo: "Dom Casmurro", autor: "Machado de Assis" },
  { titulo: "O Cortiço", autor: "Aluísio Azevedo" },
  { titulo: "Capitães da Areia", autor: "Jorge Amado" },
  { titulo: "Memórias Póstumas", autor: "Machado de Assis" }
];

// CARREGAR
function carregarLivros(lista) {
  const container = document.getElementById("livros");
  if (!container) return;

  container.innerHTML = "";

  lista.forEach(livro => {
    container.innerHTML += `
      <div class="card">
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
        <button onclick="emprestar('${livro.titulo}')">Emprestar</button>
      </div>
    `;
  });
}

// BUSCA
const search = document.getElementById("search");
if (search) {
  search.addEventListener("input", () => {
    const termo = search.value.toLowerCase();

    const filtrados = livros.filter(l =>
      l.titulo.toLowerCase().includes(termo)
    );

    carregarLivros(filtrados);
  });
}

// EMPRÉSTIMO
function emprestar(titulo) {
  alert(`Livro "${titulo}" emprestado com sucesso!`);
}

// INICIAR
carregarLivros(livros);


 

