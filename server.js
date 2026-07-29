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

// Servir ficheiros estáticos (opcional, caso queiras colocar o HTML/JS na mesma pasta)
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log(`Novo cliente conectado: ${socket.id}`);

  // Recebe uma nova encomenda enviada por um cliente/vendedor
  socket.on('nova_encomenda', (order) => {
    console.log(`Nova encomenda gerada: ${order.id}`);
    
    // Transmite a nova encomenda instantaneamente para todos os outros clientes (ex: painel do gerente)
    socket.broadcast.emit('atualizar_encomendas', order);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de tempo real a correr na porta ${PORT}`);
});