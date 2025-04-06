// Configuração do Firebase 
const firebaseConfig = {
  apiKey: "AIzaSyC2GhMxCB01W6gxrr_YvR6pMV9vsc6cykg",
  authDomain: "projetoasas-77bf1.firebaseapp.com",
  databaseURL: "https://projetoasas-77bf1-default-rtdb.firebaseio.com",
  projectId: "projetoasas-77bf1",
  storageBucket: "projetoasas-77bf1.firebasestorage.app",
  messagingSenderId: "524231405875",
  appId: "1:524231405875:web:4492692e765242cf3b8e46"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form = document.getElementById("cadastroForm");
const tabela = document.getElementById("tabelaAlunos");
const filtroTurma = document.getElementById("filtroTurma");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const turmaOrigem = form.turmaOrigem.value;
  const turmaAsas = form.turmaAsas.value;
  const whatsapp = form.whatsapp.value;

  const ref = db.ref("alunos/" + turmaAsas);
  ref.once("value", (snapshot) => {
    const total = snapshot.numChildren();
    const novoAluno = {
      nome: total >= 10 ? nome + " (Reserva)" : nome,
      turmaOrigem,
      turmaAsas,
      whatsapp
    };
    const novoRef = ref.push();
    novoRef.set(novoAluno).then(() => {
      alert("✅ Aluno cadastrado com sucesso!");
      form.reset();
    });
  });
});

function exibirAlunos(turmaFiltro) {
  tabela.innerHTML = "";
  db.ref("alunos").once("value", (snapshot) => {
    snapshot.forEach((turmaSnap) => {
      const turma = turmaSnap.key;
      turmaSnap.forEach((alunoSnap) => {
        const aluno = alunoSnap.val();
        if (turmaFiltro === "todos" || aluno.turmaAsas === turmaFiltro) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${aluno.turmaOrigem}</td>
            <td>${aluno.turmaAsas}</td>
            <td><a href="https://wa.me/55${aluno.whatsapp}" target="_blank">📱</a></td>
            <td><button onclick="excluirAluno('${turma}', '${alunoSnap.key}')">❌</button></td>
          `;
          tabela.appendChild(row);
        }
      });
    });
  });
}

function excluirAluno(turma, id) {
  db.ref(`alunos/${turma}/${id}`).remove().then(() => {
    exibirAlunos(filtroTurma.value);
  });
}

filtroTurma.addEventListener("change", () => {
  exibirAlunos(filtroTurma.value);
});

document.getElementById("exportarExcel").addEventListener("click", () => {
  import('https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs').then(XLSX => {
    db.ref("alunos").once("value", (snapshot) => {
      const data = [];
      snapshot.forEach((turmaSnap) => {
        turmaSnap.forEach((alunoSnap) => {
          const aluno = alunoSnap.val();
          if (filtroTurma.value === "todos" || aluno.turmaAsas === filtroTurma.value) {
            data.push({
              Nome: aluno.nome,
              Turma_Origem: aluno.turmaOrigem,
              Turma_ASAS: aluno.turmaAsas,
              WhatsApp: aluno.whatsapp
            });
          }
        });
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Alunos");
      XLSX.writeFile(wb, "alunos_asas.xlsx");
    });
  });
});

// Mostrar alunos ao carregar
window.onload = () => {
  exibirAlunos("todos");
};
