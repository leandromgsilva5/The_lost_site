// --- VARIÁVEL GLOBAL DE ENCOMENDAS ---
let orders = [];

// --- 1. CARREGAR E GUARDAR NO LOCALSTORAGE ---
function loadFromLocalStorage() {
  const savedOrders = localStorage.getItem('sistema_encomendas');
  if (savedOrders) {
    try {
      orders = JSON.parse(savedOrders);
    } catch (e) {
      console.error('Erro ao carregar o localStorage:', e);
      orders = [];
    }
  }
}

function saveToLocalStorage() {
  localStorage.setItem('sistema_encomendas', JSON.stringify(orders));
}

// --- 2. LIGAR AO SERVIDOR SOCKET.IO ---
const socket = io();

// --- 3. OUVIR NOVAS ENCOMENDAS EM TEMPO REAL ---
socket.on('atualizar_encomendas', (newOrder) => {
  if (!orders.some(o => o.id === newOrder.id)) {
    orders.unshift(newOrder);
    saveToLocalStorage();
    
    if (typeof refreshAllViews === 'function') {
      refreshAllViews();
    }
  }

  playAlertSound();
  
  const badge = document.getElementById('pending-validation-badge');
  badge?.classList.remove('hidden');
});

// Função auxiliar de som de notificação
function playAlertSound() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    // Ignora se o navegador bloquear autoplay sem interação prévia
  }
}

// --- 4. INICIALIZAÇÃO ÚNICA AO CARREGAR A PÁGINA ---
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  // Nota: Não chamamos load dentro de refreshAllViews para evitar loops
});