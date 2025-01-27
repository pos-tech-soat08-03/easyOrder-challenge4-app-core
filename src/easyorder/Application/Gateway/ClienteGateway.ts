import { Sequelize, Model, DataTypes } from "sequelize";
import { ClienteEntity } from "../../Core/Entity/ClienteEntity";
import { CpfValueObject } from "../../Core/Entity/ValueObject/CpfValueObject";
import { EmailValueObject } from "../../Core/Entity/ValueObject/EmailValueObject";
import { ConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { ClienteGatewayInterface } from "../../Core/Interfaces/Gateway/ClienteGatewayInterface";

class LocalModel extends Model {
  public id!: string;
  public nome!: string;
  public cpf!: string;
  public email!: string;
}

export class ClienteGateway implements ClienteGatewayInterface {
  private sequelize: Sequelize;

  constructor(private dbconnection: ConnectionInfo) {
    this.sequelize = new Sequelize(
      this.dbconnection.database,
      this.dbconnection.username,
      this.dbconnection.password,
      {
        host: this.dbconnection.hostname,
        port: this.dbconnection.portnumb,
        dialect: this.dbconnection.databaseType,
      }
    );

    LocalModel.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        nome: {
          type: DataTypes.STRING,
        },
        cpf: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize: this.sequelize,
        modelName: "Cliente",
        tableName: "clientes",
        timestamps: false,
      }
    );

    this.sequelize.sync({ alter: true });
  }

  public async listarClientes(): Promise<ClienteEntity[] | undefined> {
    const clientes = await LocalModel.findAll();

    if (!clientes) {
      return undefined;
    }

    return clientes.map((cliente) => {
      return new ClienteEntity(
        new CpfValueObject(cliente.cpf),
        cliente.nome,
        new EmailValueObject(cliente.email),
        cliente.id
      );
    });
  }

  public async buscarClientePorCpf(
    cpf: CpfValueObject
  ): Promise<ClienteEntity | undefined> {
    const cliente = await LocalModel.findOne({
      where: {
        cpf: cpf.getValue(),
      },
    });

    if (!cliente) {
      return undefined;
    }

    return new ClienteEntity(
      new CpfValueObject(cliente.cpf),
      cliente.nome,
      new EmailValueObject(cliente.email),
      cliente.id
    );
  }

  public async adicionarCliente(cliente: ClienteEntity): Promise<boolean> {
    const clienteData = {
      id: cliente.getId(),
      nome: cliente.getNome(),
      cpf: cliente.getCpf().getValue(),
      email: cliente.getEmail().getValue(),
    };

    await LocalModel.upsert(clienteData);

    return true;
  }

  public async removerCliente(cliente: ClienteEntity): Promise<boolean> {
    await LocalModel.destroy({
      where: {
        cpf: cliente.getCpf().getValue(),
      },
    });
    return true;
  }

  public async atualizarCliente(
    cliente: ClienteEntity,
    novoCliente: ClienteEntity
  ): Promise<boolean> {
    await LocalModel.update(
      {
        id: novoCliente.getId(),
        nome: novoCliente.getNome(),
        cpf: novoCliente.getCpf().getValue(),
        email: novoCliente.getEmail().getValue(),
      },
      {
        where: {
          cpf: cliente.getCpf().getValue(),
        },
      }
    );
    return true;
  }
}
