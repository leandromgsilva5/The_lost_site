// --- 1. LIGAR AO SERVIDOR SOCKET.IO ---
const socket = io('http://localhost:3000'); 

// --- 2. OUVIR NOVAS ENCOMENDAS EM TEMPO REAL ---
socket.on('atualizar_encomendas', (newOrder) => {
  console.log('Nova encomenda recebida em tempo real:', newOrder);
  
  if (typeof orders !== 'undefined') {
    orders.unshift(newOrder);
    
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof refreshAllViews === 'function') refreshAllViews();
  }

  playAlertSound();
  
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

// --- 3. FUNÇÃO PARA APAGAR ENCOMENDA INDIVIDUAL ---
function deleteSingleOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (confirm(`Tem certeza que deseja apagar permanentemente a encomenda ${orderId} (${order.client})?`)) {
    orders = orders.filter(o => o.id !== orderId);
    
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof refreshAllViews === 'function') refreshAllViews();
    
    alert(`Encomenda ${orderId} apagada com sucesso!`);
  }
}

// --- 4. EXEMPLO DE INTEGRAÇÃO NO CHECKOUT ---
/* 
  Na tua função onde processas o checkout e crias a encomenda (ex: handleCheckout):
  
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