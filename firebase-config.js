// Importar as funções necessárias dos SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// A tua configuração oficial do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDe6mrtwqDWcwTdE7ozRdGak5fw2EdZ6yg",
  authDomain: "thelostmc-86c1c.firebaseapp.com",
  projectId: "thelostmc-86c1c",
  storageBucket: "thelostmc-86c1c.firebasestorage.app",
  messagingSenderId: "859659995435",
  appId: "1:859659995435:web:6472fb947ca2ed6bbedd6e",
  measurementId: "G-FYT9PGG2NL"
};

// Inicializar o Firebase e a Base de Dados
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Exemplo: Como guardar uma nova encomenda quando o cliente clica em "Novo Pedido"
window.gravarEncomendaNoFirebase = function(idEncomenda, dadosEncomenda) {
  set(ref(db, 'encomendas/' + idEncomenda), dadosEncomenda)
    .then(() => {
      console.log("Encomenda guardada com sucesso na nuvem!");
    })
    .catch((error) => {
      console.error("Erro ao guardar encomenda:", error);
    });
};

// Exemplo: Como escutar as encomendas em tempo real para aparecerem aos membros
const encomendasRef = ref(db, 'encomendas/');
onValue(encomendasRef, (snapshot) => {
  const dados = snapshot.val();
  if (dados) {
    console.log("Dados de encomendas atualizados:", dados);
    // Podes chamar aqui a função do teu site que desenha a tabela de encomendas no HTML
  } else {
    console.log("Ainda não existem encomendas registadas.");
  }
});