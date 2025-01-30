import { ProdutoGateway } from "../../Application/Gateway/ProdutoGateway";
import { MSConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { MSGateways } from "../../Core/Types/Gateways";

export class ProdutoService {
  readonly gateways: MSGateways;
  readonly connection: MSConnectionInfo;
  constructor(connection: MSConnectionInfo) {
    this.connection = connection;
    this.gateways = {
      produtoGateway: new ProdutoGateway(this.connection.url),
    };
  }
}
