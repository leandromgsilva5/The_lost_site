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
  // Evita duplicados caso o ID já exista
  if (!orders.some(o => o.id === newOrder.id)) {
    orders.unshift(newOrder);
    
    // Guarda localmente e atualiza a interface
    saveToLocalStorage();
    if (typeof refreshAllViews === 'function') {
      refreshAllViews();
    }
  }

  // Alerta sonoro subtil para avisar o gerente
  playAlertSound();
  
  // Mostrar badge/aviso visual no painel se existir
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

// --- 4. INICIALIZAÇÃO AO CARREGAR A PÁGINA ---
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  if (typeof refreshAllViews === 'function') {
    refreshAllViews();
  }
});

// --- 5. EXEMPLO DE USO NO SEU CHECKOUT ---
/* 
  Quando o cliente finalizar a compra na sua função de checkout (ex: handleCheckout), 
  certifique-se de incluir o 'socket.emit' desta forma:

  const order = {
    id: orderId,
    date: new Date().toLocaleString('pt-PT'),
    client: client,
    seller: seller,
    items: cartItems,
    total: total,
    status: 'Pendente'
  };

  orders.unshift(order);
  
  // ENVIA PARA O SERVIDOR EM TEMPO REAL PARA OS OUTROS DISPOSITIVOS
  socket.emit('nova_encomenda', order);

  saveToLocalStorage();
  refreshAllViews();
*/