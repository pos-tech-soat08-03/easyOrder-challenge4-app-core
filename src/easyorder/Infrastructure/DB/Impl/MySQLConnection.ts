import { PedidoGateway } from "../../../Application/Gateway/PedidoGateway";
import { IDbConnection } from "../../../Core/Interfaces/IDbConnection";
import { DBGateways } from "../../../Core/Types/Gateways";
import { DBConnectionInfo } from "../../../Core/Types/ConnectionInfo";
import { TransactionGateway } from "../../../Application/Gateway/TransactionGateway";

export class MySQLConnection implements IDbConnection {
  readonly gateways: DBGateways;
  readonly dbConnection: DBConnectionInfo;
  constructor(dbConnection: DBConnectionInfo) {
    this.dbConnection = dbConnection;
    this.gateways = {
      pedidoGateway: new PedidoGateway(this.dbConnection),
      transactionGateway: new TransactionGateway(this.dbConnection),
    };
  }
}
