import { DBConnectionInfo } from "../Types/ConnectionInfo";
import { DBGateways } from "../Types/Gateways";

export interface IDbConnection {
  readonly gateways: DBGateways;
  readonly dbConnection: DBConnectionInfo;
}
