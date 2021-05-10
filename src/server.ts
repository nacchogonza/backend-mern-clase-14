import express, { Request, Response, Application } from 'express';
import { routerApi, productos } from './RouterApi';
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'

const app: Application = express();
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const messages: Array<string> = []

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use('/api', routerApi);

app.use('/', express.static('public'))

io.on('connection', (socket: any) => {
  console.log('Nuevo cliente conectado!')

  socket.emit('productos', productos.getProductos())

  socket.emit('messages', messages)

  socket.on('new-product', (product: object) => {
    productos.postProducto(product);
    io.sockets.emit('productos', productos.getProductos())
  })

  socket.on('new-message', (data: string) => {
      messages.push(data)
      io.sockets.emit('messages', messages)
  })
})

app.get('/', (req: Request, res: Response) => {
  const data = productos.getProductos();
  res.render("pages/products", {
    products: data
  })
})

const PORT: number = 8080;

const server = httpServer.listen(PORT, () => {
  console.log(`servidor inicializado en ${PORT}`)
})

server.on("error", (error: Error) => console.log(`error en el servidor: ${error.message}`))