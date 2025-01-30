import { DatabaseType } from "./DatabaseType";

export type DBConnectionInfo = {
  hostname: string;
  portnumb: number;
  database: string;
  username: string;
  password: string;
  databaseType: DatabaseType;
};

export type MSConnectionInfo = {
  url: string;
};
