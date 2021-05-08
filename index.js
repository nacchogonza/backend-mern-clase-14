'use strict';

var express = require('express');

var _require = require('./RouterApi.js'),
    routerApi = _require.routerApi,
    productos = _require.productos;

var http = require('http');
var socket = require('socket.io');

var HttpServer = http.Server;
var IOServer = socket.Server;

var app = express();
var httpServer = new HttpServer(app);
var io = new IOServer(httpServer);

var messages = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use('/api', routerApi);

app.use('/', express.static('public'));

io.on('connection', function (socket) {
  console.log('Nuevo cliente conectado!');

  socket.emit('productos', productos.getProductos());

  socket.emit('messages', messages);

  socket.on('new-product', function (product) {
    productos.postProducto(product);
    io.sockets.emit('productos', productos.getProductos());
  });

  socket.on('new-message', function (data) {
    messages.push(data);
    io.sockets.emit('messages', messages);
  });
});

app.get('/', function (req, res) {
  var data = productos.getProductos();
  res.render("pages/products", {
    products: data
  });
});

var PORT = 8080;

var server = httpServer.listen(PORT, function () {
  console.log('servidor inicializado en ' + server.address().port);
});

server.on("error", function (error) {
  return console.log('error en el servidor: ' + error.message);
});
