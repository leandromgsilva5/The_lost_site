// --- CORREÇÃO COMPLETA E FUNCIONAL DO CÓDIGO JS ---

    function renderCart() {
      const tbody = document.getElementById('cart-table-body');
      const badgeCount = document.getElementById('cart-badge-count');
      const totalValEl = document.getElementById('cart-total-val');
      if (!tbody) return;

      if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">O carrinho está vazio.</td></tr>`;
        if(badgeCount) badgeCount.classList.add('hidden');
        if(totalValEl) totalValEl.innerText = '0';
        return;
      }

      let totalItems = 0;
      let totalPrice = 0;

      tbody.innerHTML = cart.map((item, index) => {
        totalItems += item.qty;
        let subtotal = item.price * item.qty;
        totalPrice += subtotal;

        return `
          <tr class="hover:bg-neutral-950/40 transition">
            <td class="p-4 font-bold text-white">${item.name}</td>
            <td class="p-4 text-orange-400 font-bold">$${item.price.toLocaleString()}</td>
            <td class="p-4 text-center">
              <input type="number" value="${item.qty}" min="1" onchange="updateCartQty(${index}, this.value)" class="w-16 bg-neutral-950 border border-neutral-700 text-center text-xs py-1 rounded text-white font-bold">
            </td>
            <td class="p-4 font-black text-orange-400">$${subtotal.toLocaleString()}</td>
            <td class="p-4 text-center">
              <button onclick="removeFromCart(${index})" class="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-bold transition">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      if(badgeCount) {
        badgeCount.innerText = totalItems;
        badgeCount.classList.remove('hidden');
      }
      if(totalValEl) {
        totalValEl.innerText = totalPrice.toLocaleString();
      }
    }

    function updateCartQty(index, newQty) {
      const qty = parseInt(newQty);
      if (qty > 0) {
        cart[index].qty = qty;
        renderCart();
      }
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      renderCart();
    }

    function handleCheckout(e) {
      e.preventDefault();
      if (cart.length === 0) {
        alert('O carrinho está vazio!');
        return;
      }

      const client = document.getElementById('client-name').value.trim();
      const seller = document.getElementById('seller-name').value;
      const paymentStatus = document.getElementById('payment-status').value;

      let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const newOrder = {
        id: 'ENC-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString('pt-PT'),
        client,
        seller,
        isPartnership,
        items: [...cart],
        total: totalPrice,
        status: paymentStatus === 'Pago' ? 'Pago' : 'Pendente'
      };

      orders.unshift(newOrder);
      saveToLocalStorage();

      // Envia via Socket.io para os outros clientes em tempo real (se ligado)
      if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('nova_encomenda', newOrder);
      }

      // Atualizar stock localmente com base na baixa de materiais vendidos
      cart.forEach(cartItem => {
        const prod = products.find(p => p.name.toLowerCase() === cartItem.name.toLowerCase() || p.id === cartItem.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - cartItem.qty);
        }
      });
      saveToLocalStorage();

      // Abrir Modal de Recibo
      openReceiptModal(newOrder);

      // Limpar carrinho
      cart = [];
      renderCart();
      refreshAllViews();
    }

    function openReceiptModal(order) {
      document.getElementById('r-id').innerText = order.id;
      document.getElementById('r-date').innerText = order.date;
      document.getElementById('r-client').innerText = order.client;
      document.getElementById('r-seller').innerText = order.seller;
      document.getElementById('r-type').innerText = order.isPartnership ? 'Parceria ⭐' : 'Normal';
      document.getElementById('r-status').innerText = order.status;
      document.getElementById('r-status').className = order.status === 'Pago' ? 'uppercase text-emerald-600 font-bold' : 'uppercase text-orange-600 font-bold';

      const itemsListContainer = document.getElementById('r-items-list');
      itemsListContainer.innerHTML = order.items.map(i => `
        <div class="flex justify-between text-xs">
          <span>${i.qty}x ${i.name}</span>
          <span>$${(i.price * i.qty).toLocaleString()}</span>
        </div>
      `).join('');

      document.getElementById('r-total').innerText = order.total.toLocaleString();
      document.getElementById('receipt-modal').classList.remove('hidden');
    }

    function closeReceipt() {
      document.getElementById('receipt-modal').classList.add('hidden');
    }

    function renderStock() {
      const tbody = document.getElementById('stock-table-body');
      if (!tbody) return;

      tbody.innerHTML = products.map((p, index) => `
        <tr class="hover:bg-neutral-950/40 transition">
          <td class="p-3 font-mono text-gray-400">${p.id}</td>
          <td class="p-3 font-bold text-white">${p.name}</td>
          <td class="p-3 font-black ${p.stock < p.min ? 'text-orange-400' : 'text-emerald-400'}">${p.stock}</td>
          <td class="p-3 text-gray-400">${p.min}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 text-[10px] rounded font-bold ${p.stock < p.min ? 'bg-orange-950 text-orange-400 border border-orange-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
              ${p.stock < p.min ? '🔴 Baixo' : '🟢 Normal'}
            </span>
          </td>
          <td class="p-3 text-center">
            <div class="flex items-center justify-center gap-1">
              <button onclick="adjustStock(${index}, -5)" class="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-red-400 rounded text-xs font-bold">-5</button>
              <button onclick="adjustStock(${index}, 10)" class="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded text-xs font-bold">+10</button>
              <button onclick="adjustStock(${index}, 50)" class="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-orange-400 rounded text-xs font-bold">+50</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function adjustStock(index, amount) {
      products[index].stock = Math.max(0, products[index].stock + amount);
      saveToLocalStorage();
      renderStock();
      renderProducts();
      renderMemberStockView();
      updateDashboard();
    }

    function renderRanking() {
      const tbody = document.getElementById('ranking-table-body');
      if (!tbody) return;

      loadFromLocalStorage();

      let clientMap = {};
      orders.forEach(o => {
        if (!clientMap[o.client]) {
          clientMap[o.client] = { count: 0, total: 0 };
        }
        clientMap[o.client].count += 1;
        clientMap[o.client].total += o.total;
      });

      let sortedClients = Object.keys(clientMap).map(client => ({
        client,
        count: clientMap[client].count,
        total: clientMap[client].total
      })).sort((a, b) => b.total - a.total);

      if (sortedClients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500">Sem dados de clientes para o ranking.</td></tr>`;
        return;
      }

      tbody.innerHTML = sortedClients.map((item, index) => {
        let badgeStyle = "text-gray-400 font-bold";
        if (index === 0) badgeStyle = "text-amber-400 font-black text-base";
        if (index === 1) badgeStyle = "text-gray-300 font-bold";
        if (index === 2) badgeStyle = "text-amber-600 font-bold";

        return `
          <tr class="hover:bg-neutral-950/40 transition">
            <td class="p-4 text-center ${badgeStyle}">#${index + 1}</td>
            <td class="p-4 font-bold text-white">${item.client}</td>
            <td class="p-4 text-center text-gray-300 font-bold">${item.count}</td>
            <td class="p-4 font-black text-orange-400">$${item.total.toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    }

    function renderSellersRanking() {
      const tbody = document.getElementById('ranking-sellers-table-body');
      if (!tbody) return;

      loadFromLocalStorage();

      let sellerMap = {};
      orders.forEach(o => {
        // Normaliza o nome do vendedor removendo cargos secundários para unificar se necessário, ou usa completo
        let sellerName = o.seller || 'Desconhecido';
        if (!sellerMap[sellerName]) {
          sellerMap[sellerName] = { count: 0, total: 0 };
        }
        sellerMap[sellerName].count += 1;
        sellerMap[sellerName].total += o.total;
      });

      let sortedSellers = Object.keys(sellerMap).map(seller => ({
        seller,
        count: sellerMap[seller].count,
        total: sellerMap[seller].total
      })).sort((a, b) => b.total - a.total);

      if (sortedSellers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500">Sem dados de vendedores para o ranking.</td></tr>`;
        return;
      }

      tbody.innerHTML = sortedSellers.map((item, index) => {
        let badgeStyle = "text-gray-400 font-bold";
        if (index === 0) badgeStyle = "text-amber-400 font-black text-base";
        if (index === 1) badgeStyle = "text-gray-300 font-bold";
        if (index === 2) badgeStyle = "text-amber-600 font-bold";

        return `
          <tr class="hover:bg-neutral-950/40 transition">
            <td class="p-4 text-center ${badgeStyle}">#${index + 1}</td>
            <td class="p-4 font-bold text-white">${item.seller}</td>
            <td class="p-4 text-center text-gray-300 font-bold">${item.count}</td>
            <td class="p-4 font-black text-orange-400">$${item.total.toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    }

    function renderTeam() {
      const tbody = document.getElementById('team-table-body');
      if (!tbody) return;

      loadFromLocalStorage();

      let sellerSales = {};
      orders.forEach(o => {
        let s = o.seller;
        if (!sellerSales[s]) sellerSales[s] = 0;
        sellerSales[s] += o.total;
      });

      tbody.innerHTML = teamMembers.map(m => {
        let sales = sellerSales[m.name] || 0;
        let commission = sales * 0.15;
        return `
          <tr class="hover:bg-neutral-950/40 transition">
            <td class="p-3 font-bold text-white">${m.name}</td>
            <td class="p-3 text-gray-400">${m.role}</td>
            <td class="p-3 font-black text-orange-400">$${sales.toLocaleString()}</td>
            <td class="p-3 font-black text-emerald-400">$${commission.toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    }

    function renderMemberOrders() {
      const tbody = document.getElementById('member-orders-tbody');
      const searchInput = document.getElementById('member-order-search');
      if (!tbody) return;

      loadFromLocalStorage();

      let query = searchInput ? searchInput.value.toLowerCase() : '';
      let filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(query) || 
        o.client.toLowerCase().includes(query) || 
        o.seller.toLowerCase().includes(query)
      );

      if (filteredOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">Nenhuma encomenda encontrada.</td></tr>`;
        return;
      }

      tbody.innerHTML = filteredOrders.map(o => {
        let badgeClass = "bg-orange-950 text-orange-400 border border-orange-800";
        if (o.status === 'Pago' || o.status === 'Concluído') badgeClass = "bg-emerald-950 text-emerald-400 border border-emerald-800";
        if (o.status === 'Em Confecção') badgeClass = "bg-amber-950 text-amber-400 border border-amber-800";
        if (o.status === 'Anulado') badgeClass = "bg-red-950 text-red-400 border border-red-800";

        let itemsSummary = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');

        return `
          <tr class="hover:bg-neutral-950/40 transition">
            <td class="p-3 font-mono font-bold text-white">${o.id}</td>
            <td class="p-3 font-bold text-white">${o.client}</td>
            <td class="p-3 text-gray-300">${o.seller}</td>
            <td class="p-3 text-gray-400 truncate max-w-xs" title="${itemsSummary}">${itemsSummary}</td>
            <td class="p-3 font-black text-orange-400">$${o.total.toLocaleString()}</td>
            <td class="p-3"><span class="px-2 py-0.5 text-[10px] rounded font-bold ${badgeClass}">${o.status}</span></td>
          </tr>
        `;
      }).join('');
    }

    function updateDashboard() {
      let totalFat = 0;
      let totalPago = 0;
      let totalPendente = 0;
      let stockAlerts = 0;

      orders.forEach(o => {
        totalFat += o.total;
        if (o.status === 'Pago' || o.status === 'Concluído') {
          totalPago += o.total;
        } else if (o.status === 'Pendente') {
          totalPendente += o.total;
        }
      });

      products.forEach(p => {
        if (p.stock < p.min) stockAlerts++;
      });

      const elFat = document.getElementById('dash-total-fat');
      const elPago = document.getElementById('dash-total-pago');
      const elPendente = document.getElementById('dash-total-pendente');
      const elAlert = document.getElementById('dash-stock-alert');

      if(elFat) elFat.innerText = '$' + totalFat.toLocaleString();
      if(elPago) elPago.innerText = '$' + totalPago.toLocaleString();
      if(elPendente) elPendente.innerText = '$' + totalPendente.toLocaleString();
      if(elAlert) elAlert.innerText = stockAlerts + ' Itens';
    }