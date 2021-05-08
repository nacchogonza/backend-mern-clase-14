const express = require('express');
const { routerApi, productos } = require('./RouterApi.js');
const http = require('http');
const socket = require('socket.io');

const HttpServer = http.Server;
const IOServer = socket.Server;

const app = express();
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const messages = []

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use('/api', routerApi);

app.use('/', express.static('public'))

io.on('connection', socket => {
  console.log('Nuevo cliente conectado!')

  socket.emit('productos', productos.getProductos())

  socket.emit('messages', messages)

  socket.on('new-product', product => {
    productos.postProducto(product);
    io.sockets.emit('productos', productos.getProductos())
  })

  socket.on('new-message', data => {
      messages.push(data)
      io.sockets.emit('messages', messages)
  })
})

app.get('/', (req, res) => {
  const data = productos.getProductos();
  res.render("pages/products", {
    products: data
  })
})

const PORT = 8080;

const server = httpServer.listen(PORT, () => {
  console.log(`servidor inicializado en ${server.address().port}`)
})

server.on("error", error => console.log(`error en el servidor: ${error.message}`))