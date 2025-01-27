import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { PedidoComboEntity } from "../../Core/Entity/PedidoComboEntity";
import { PedidoEntity } from "../../Core/Entity/PedidoEntity";
import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";
import { StatusPagamentoEnum } from "../../Core/Entity/ValueObject/StatusPagamentoEnum";
import {
  StatusPedidoValueObject,
  StatusPedidoEnum,
} from "../../Core/Entity/ValueObject/StatusPedidoValueObject";
import { ConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { PedidoGatewayInterface, PedidoGatewayInterfaceFilter, PedidoGatewayInterfaceFilterOrderField } from "../../Core/Interfaces/Gateway/PedidoGatewayInterface";

class LocalModel extends Model {
  public id!: string;
  public dataPedido!: Date;
  public clienteId!: string;
  public statusPedido!: string;
  public statusPagamento!: string;
  public combos!: object[];
}

export class PedidoGateway implements PedidoGatewayInterface {
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
        dataPedido: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        clienteId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        statusPedido: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        statusPagamento: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        combos: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        sequelize: this.sequelize,
        modelName: "Pedido",
        tableName: "pedidos",
        timestamps: false,
      }
    );

    this.sequelize.sync({ alter: true });
  }

  async salvarPedido(pedido: PedidoEntity): Promise<PedidoEntity | null> {
    const pedidoData = {
      id: pedido.getId(),
      dataPedido: pedido.getDataPedido(),
      clienteId: pedido.getClienteId(),
      statusPedido: pedido.getStatusPedido().getValue(),
      statusPagamento: pedido.getStatusPagamento(),
      combos: pedido.getCombos(),
    };

    await LocalModel.upsert(pedidoData);
    return pedido;
  }

  async listarPedidosPorStatus(
    status: StatusPedidoValueObject,
    filter: PedidoGatewayInterfaceFilter
  ): Promise<PedidoEntity[]> {
    let pedidosArray: PedidoEntity[] = [];

    const orderColumnReference = {
      [PedidoGatewayInterfaceFilterOrderField.DATA_CADASTRO]: "dataPedido",
    };

    await LocalModel.findAll({
      where: { statusPedido: status.getValue() },
      order: [[orderColumnReference[filter.orderField], filter.orderDirection]],
      limit: filter.limit,
      offset: (filter.page - 1) * filter.limit,
    }).then((pedidos) => {
      if (!pedidos) {
        return [];
      }

      pedidosArray = pedidos.map((p) => {
        const pedido = this.pedidoDBToEntity(p);
        return pedido;
      });
    });

    return pedidosArray;
  }

  async buscaPedidoPorId(id: string): Promise<PedidoEntity | null> {
    let pedidoEntity: PedidoEntity | null = null;
    await LocalModel.findByPk(id).then((pedido) => {
      if (pedido) {
        pedidoEntity = this.pedidoDBToEntity(pedido);
      }
    });
    return pedidoEntity;
  }

  private pedidoDBToEntity(pedido: any): PedidoEntity {
    return new PedidoEntity(
      pedido.clienteId,
      pedido.dataPedido,
      new StatusPedidoValueObject(pedido.statusPedido as StatusPedidoEnum),
      pedido.statusPagamento as StatusPagamentoEnum,
      pedido.id,
      pedido.combos.map((combo: any) => {
        return new PedidoComboEntity(
          combo.lanche
            ? new ProdutoEntity(
                combo.lanche.nome,
                combo.lanche.descricao,
                combo.lanche.preco,
                combo.lanche.categoria,
                combo.lanche.imagemURL,
                combo.lanche.id
              )
            : null,
          combo.bebida
            ? new ProdutoEntity(
                combo.bebida.nome,
                combo.bebida.descricao,
                combo.bebida.preco,
                combo.bebida.categoria,
                combo.bebida.imagemURL,
                combo.bebida.id
              )
            : null,
          combo.sobremesa
            ? new ProdutoEntity(
                combo.sobremesa.nome,
                combo.sobremesa.descricao,
                combo.sobremesa.preco,
                combo.sobremesa.categoria,
                combo.sobremesa.imagemURL,
                combo.sobremesa.id
              )
            : null,
          combo.acompanhamento
            ? new ProdutoEntity(
                combo.acompanhamento.nome,
                combo.acompanhamento.descricao,
                combo.acompanhamento.preco,
                combo.acompanhamento.categoria,
                combo.acompanhamento.imagemURL,
                combo.acompanhamento.id
              )
            : null,
          combo.id
        );
      })
    );
  }
}

