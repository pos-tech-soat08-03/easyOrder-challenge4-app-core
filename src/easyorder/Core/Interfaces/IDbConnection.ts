import { ConnectionInfo } from '../Types/ConnectionInfo';
import { Gateways } from '../Types/Gateways';

export interface IDbConnection {
  readonly gateways: Gateways;
  readonly dbConnection: ConnectionInfo;
}
