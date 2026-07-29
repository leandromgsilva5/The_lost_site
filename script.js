// --- 1. LIGAR AO SERVIDOR SOCKET.IO ---
// Se estiveres a testar localmente, usa 'http://localhost:3000' ou deixa vazio se o servidor servir os ficheiros estáticos.
const socket = io('http://localhost:3000'); 

// --- 2. OUVIR NOVAS ENCOMENDAS EM TEMPO REAL ---
socket.on('atualizar_encomendas', (newOrder) => {
  console.holog ? console.log('Nova encomenda recebida em tempo real:', newOrder) : null;
  
  // Adiciona a encomenda à tua lista existente de encomendas global
  if (typeof orders !== 'undefined') {
    orders.unshift(newOrder);
    
    // Funções nativas da tua aplicação para guardar e atualizar a interface
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof refreshAllViews === 'function') refreshAllViews();
  }

  // Alerta sonoro subtil para avisar o gerente
  playAlertSound();
  
  // Mostrar badge/aviso visual no painel se existir
  const badge = document.getElementById('pending-validation-badge');
  if (badge) {
    badge.classList.remove('hidden');
  }
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

// --- 3. INTEGRAR NO TEU CHECKOUT ---
// Na tua função onde processas o checkout e crias a encomenda (ex: handleCheckout), 
// deves adicionar a linha do socket.emit logo após salvar localmente:

/* 
  EXEMPLO DE USO DENTRO DO TEU CHECKOUT:
  
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
  
  // ENVIA PARA O SERVIDOR EM TEMPO REAL
  socket.emit('nova_encomenda', order);

  saveToLocalStorage();
  refreshAllViews();
*/