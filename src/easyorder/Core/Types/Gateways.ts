import { ClienteGatewayInterface } from "../Interfaces/Gateway/ClienteGatewayInterface";
import { PedidoGatewayInterface } from "../Interfaces/Gateway/PedidoGatewayInterface";
import { ProdutoGatewayInterface } from "../Interfaces/Gateway/ProdutoGatewayInterface";
import { TransactionGatewayInterface } from "../Interfaces/Gateway/TransactionGatewayInterface";

export type Gateways = {
  clienteGateway: ClienteGatewayInterface;
  produtoGateway: ProdutoGatewayInterface;
  pedidoGateway: PedidoGatewayInterface;
  transactionGateway: TransactionGatewayInterface;
};
