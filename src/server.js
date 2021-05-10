'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _RouterApi = require('./RouterApi.js');

var _http = require('http');

var _socket = require('socket.io');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var httpServer = new _http.Server(app);
var io = new _socket.Server(httpServer);

var messages = [];

app.use(_express2.default.json());
app.use(_express2.default.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use('/api', _RouterApi.routerApi);

app.use('/', _express2.default.static('public'));

io.on('connection', function (socket) {
  console.log('Nuevo cliente conectado!');

  socket.emit('productos', _RouterApi.productos.getProductos());

  socket.emit('messages', messages);

  socket.on('new-product', function (product) {
    _RouterApi.productos.postProducto(product);
    io.sockets.emit('productos', _RouterApi.productos.getProductos());
  });

  socket.on('new-message', function (data) {
    messages.push(data);
    io.sockets.emit('messages', messages);
  });
});

app.get('/', function (req, res) {
  var data = _RouterApi.productos.getProductos();
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
