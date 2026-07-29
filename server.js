const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir ficheiros estáticos da pasta atual (onde tens o teu index.html)
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Novo cliente ligado:', socket.id);

  // Ouve quando uma nova encomenda é criada no checkout
  socket.on('nova_encomenda', (newOrder) => {
    console.log('Nova encomenda recebida no servidor:', newOrder.id);
    
    // Reencaminha imediatamente a encomenda para todos os outros clientes ligados (painéis abertos)
    socket.broadcast.emit('atualizar_encomendas', newOrder);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});