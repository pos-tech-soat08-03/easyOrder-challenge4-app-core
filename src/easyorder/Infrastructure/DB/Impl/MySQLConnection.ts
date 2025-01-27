import { ClienteGateway } from "../../../Application/Gateway/ClienteGateway";
import { PedidoGateway } from "../../../Application/Gateway/PedidoGateway";
import { ProdutoGateway } from "../../../Application/Gateway/ProdutoGateway";
import { IDbConnection } from "../../../Core/Interfaces/IDbConnection";
import { Gateways } from "../../../Core/Types/Gateways";
import { ConnectionInfo } from "../../../Core/Types/ConnectionInfo";
import { TransactionGateway } from "../../../Application/Gateway/TransactionGateway";

export class MySQLConnection implements IDbConnection {
  readonly gateways: Gateways;
  readonly dbConnection: ConnectionInfo;
  constructor(dbConnection: ConnectionInfo) {
    this.dbConnection = dbConnection;
    this.gateways = {
      clienteGateway: new ClienteGateway(this.dbConnection),
      pedidoGateway: new PedidoGateway(this.dbConnection),
      produtoGateway: new ProdutoGateway(this.dbConnection),
      transactionGateway: new TransactionGateway(this.dbConnection),
    };
  }
}
