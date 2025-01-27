import { Sequelize, Model, DataTypes, where } from "sequelize";
import { ConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { TransactionGatewayInterface } from "../../Core/Interfaces/Gateway/TransactionGatewayInterface";
import { TransactionEntity } from "../../Core/Entity/TransactionEntity";
import { StatusTransacaoEnum, StatusTransacaoValueObject } from "../../Core/Entity/ValueObject/StatusTransacaoValueObject";

class LocalModel extends Model {
  public idTransacao!: string;
  public idPedido!: string;
  public dataCriacao!: Date;
  public statusTransacao!: string;
  public valorTransacao!: number;
  public msgEnvio!: string;
  public msgRetorno!: string;
  public hash_EMVCo!: string;
}

export class TransactionGateway implements TransactionGatewayInterface {
  private sequelize: Sequelize;

  constructor(private dbconnection: ConnectionInfo) {
    this.sequelize = new Sequelize(
      this.dbconnection.database,
      this.dbconnection.username,
      this.dbconnection.password,
      {
        host: this.dbconnection.hostname,
        port: this.dbconnection.portnumb,
        dialect: this.dbconnection.databaseType
      }
    );
    LocalModel.init(
      {
        idTransacao: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        idPedido: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        dataCriacao: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        statusTransacao: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        valorTransacao: {
          type: DataTypes.DOUBLE,
        },
        msgEnvio: {
          type: DataTypes.TEXT,
        },
        msgRetorno: {
          type: DataTypes.TEXT,
        },
        hash_EMVCo: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize: this.sequelize,
        modelName: "Transacao",
        tableName: "transacoes",
        timestamps: false,
      }
    );
    this.sequelize.sync({
      alter: true,
    });
  }

  public async salvarTransaction (transaction: TransactionEntity): Promise<void> {
    const dto = {
      idTransacao: transaction.getIdTransacao(),
      idPedido: transaction.getIdPedido(),
      dataCriacao: transaction.getDataCriacaoTransacao(),
      statusTransacao: transaction.getStatusTransacao(),
      valorTransacao: transaction.getValorTransacao(),
      msgEnvio: transaction.getMsgEnvio(),
      msgRetorno: transaction.getMsgRetorno().toString(),
      hash_EMVCo: transaction.getHash_EMVCo()
    };
    await LocalModel.upsert(dto);
  }

  public async atualizarTransactionsPorId (id: string, transaction: TransactionEntity): Promise<TransactionEntity | undefined> {
    await LocalModel.update (
      { 
        idTransacao: transaction.getIdTransacao(),
        idPedido: transaction.getIdPedido(),
        dataCriacao: transaction.getDataCriacaoTransacao(),
        statusTransacao: transaction.getStatusTransacao(),
        valorTransacao: transaction.getValorTransacao(),
        msgEnvio: transaction.getMsgEnvio(),
        msgRetorno: transaction.getMsgRetorno().toString(),
        hash_EMVCo: transaction.getHash_EMVCo()
      },
      {
        where: {
          idTransacao: id,
        }
      }
    );
    return await this.buscarTransactionPorId(id);
  }

  public async buscarTransactionPorId (id: string): Promise<TransactionEntity | undefined> {
    const transaction = await LocalModel.findOne(
      {
        where: {
          idTransacao: id,
        }
      });
      if (!transaction) return undefined;
      return new TransactionEntity(       
        transaction.idPedido,
        transaction.valorTransacao,
        transaction.idTransacao,
        transaction.dataCriacao as Date,
        new StatusTransacaoValueObject(transaction.statusTransacao as StatusTransacaoEnum),
        transaction.msgEnvio,
        transaction.msgRetorno,
        transaction.hash_EMVCo);

  }

  public async listarTransactionsPorPedido(idPedido: string): Promise<TransactionEntity[]> {
    const transactions = await LocalModel.findAll(
      {
        where: {
          idPedido: idPedido,
        }
      });
      if (!transactions) {
        return [];
      }
      return transactions.map((transaction) => {
        return new TransactionEntity(       
          transaction.idPedido,
          transaction.valorTransacao,
          transaction.idTransacao,
          transaction.dataCriacao as Date,
          new StatusTransacaoValueObject(transaction.statusTransacao as StatusTransacaoEnum),
          transaction.msgEnvio,
          transaction.msgRetorno,
          transaction.hash_EMVCo);
      });

  }

}
