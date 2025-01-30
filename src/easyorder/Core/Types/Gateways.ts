import { PedidoGatewayInterface } from "../Interfaces/Gateway/PedidoGatewayInterface";
import { ProdutoGatewayInterface } from "../Interfaces/Gateway/ProdutoGatewayInterface";
import { TransactionGatewayInterface } from "../Interfaces/Gateway/TransactionGatewayInterface";

export type DBGateways = {
  pedidoGateway: PedidoGatewayInterface;
  transactionGateway: TransactionGatewayInterface;
};

export type MSGateways = {
  produtoGateway: ProdutoGatewayInterface
}