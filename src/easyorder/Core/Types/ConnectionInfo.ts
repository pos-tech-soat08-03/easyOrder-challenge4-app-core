import { DatabaseType } from "./DatabaseType";

export type ConnectionInfo = {
  hostname: string;
  portnumb: number;
  database: string;
  username: string;
  password: string;
  databaseType: DatabaseType;
};
