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

// Servir ficheiros estáticos na mesma pasta (index.html, etc.)
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log(`Novo cliente conectado: ${socket.id}`);

  // Recebe uma nova encomenda ou alteração de estado enviada por um utilizador
  socket.on('nova_encomenda', (orders) => {
    console.log(`Encomendas atualizadas sincronizadas.`);
    // Transmite instantaneamente para todos os outros clientes ligados (ex: gerência, membros)
    socket.broadcast.emit('atualizar_encomendas', orders);
  });

  // Sincronização direta de alterações de stock no baú em tempo real
  socket.on('atualizar_stock', (products) => {
    console.log(`Stock atualizado no armazém.`);
    socket.broadcast.emit('atualizar_stock', products);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de tempo real a correr na porta ${PORT}`);
});