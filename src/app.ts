import express from "express";
import { MySQLConnection } from "./easyorder/Infrastructure/DB/Impl/MySQLConnection";
import { CategoriaGatewayMock } from "./easyorder/Infrastructure/DB/Mock/CategoriaGatewayMock";
import { DefaultApiEndpoints } from "./easyorder/Infrastructure/Api/ApisDefaultEndpoints";
import { ApiPedidos } from "./easyorder/Infrastructure/Api/ApiPedidos";
import { ApiPreparacao } from "./easyorder/Infrastructure/Api/ApiPreparacao";
// import { PagamentoServiceMock } from "./easyorder/Infrastructure/Service/PagamentoServiceMock";
import { ApiPagamentos } from "./easyorder/Infrastructure/Api/ApiPagamentos";
import { PagamentoServiceML } from "./easyorder/Infrastructure/Service/PagamentoServiceML";
import { PagamentoServiceMock } from "./easyorder/Infrastructure/Service/PagamentoServiceMock";
import { ProdutoService } from "./easyorder/Infrastructure/Service/ProdutoService";
import { MSConnectionInfo } from "./easyorder/Core/Types/ConnectionInfo";
// import { ProdutoGatewayMock } from './easyorder/Infrastructure/Output/Gateway/Mock/ProdutoGatewayMock';
// import { ClienteGatewayMock } from './easyorder/Infrastructure/Output/Gateway/Mock/ClienteGatewayMock';
// import { PedidoGatewayMock } from './easyorder/Infrastructure/Output/Gateway/Mock/PedidoGatewayMock';

// Inicialização de banco de dados
const categoriaGatewayMock = new CategoriaGatewayMock();
const mysqlConnection = new MySQLConnection({
  hostname: process.env.DATABASE_HOST || "ERROR",
  portnumb: Number(process.env.DATABASE_PORT || "0"),
  database: process.env.DATABASE_NAME || "ERROR",
  username: process.env.DATABASE_USER || "ERROR",
  password: process.env.DATABASE_PASS || "ERROR",
  databaseType: "mysql",
});

const msProductConnection: MSConnectionInfo = {
  url: process.env.PRODUCT_URL || "ERROR",
};

// Inicialização serviços
const servicoPagamento = new PagamentoServiceMock();
const servicoProduto = new ProdutoService(msProductConnection);
// const servicoPagamento = new PagamentoServiceML();

// Inicialização de framework Express + endpoints default
const port = Number(process.env.SERVER_PORT || "3000");
const app = express();
DefaultApiEndpoints.start(app);

// Inicialização de endpoints da aplicação
ApiPedidos.start(mysqlConnection, servicoProduto, servicoPagamento, app);
ApiPreparacao.start(mysqlConnection, app);
ApiPagamentos.start(mysqlConnection, servicoPagamento, app);

// Inicialização do Express server
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
