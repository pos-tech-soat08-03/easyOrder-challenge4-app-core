import { DataTypes, Model, Sequelize } from "sequelize";
import { PedidoGateway } from "../../../easyorder/Application/Gateway/PedidoGateway";
import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { DBConnectionInfo } from "../../../easyorder/Core/Types/ConnectionInfo";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import { PedidoComboEntity } from "../../../easyorder/Core/Entity/PedidoComboEntity";
import { ProdutoEntity } from "../../../easyorder/Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../../easyorder/Core/Entity/ValueObject/CategoriaEnum";
import {
  PedidoGatewayInterfaceFilterOrderDirection,
  PedidoGatewayInterfaceFilterOrderField,
} from "../../../easyorder/Core/Interfaces/Gateway/PedidoGatewayInterface";

describe("PedidoGateway - Testando com SQLite em Memória", () => {
  let gateway: PedidoGateway;
  let sequelize: Sequelize;
  let pedidoMock: PedidoEntity;

  class PedidoModel extends Model {}

  beforeAll(async () => {
    sequelize = new Sequelize("sqlite::memory:", { logging: false });

    const dbMock: DBConnectionInfo = {
      hostname: "localhost",
      portnumb: 5432,
      username: "user",
      password: "password",
      database: "testDB",
      databaseType: "sqlite",
    };

    gateway = new PedidoGateway(dbMock);
    (gateway as any).sequelize = sequelize;

    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    pedidoMock = new PedidoEntity(
      "cliente-123",
      new Date(),
      new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO),
      StatusPagamentoEnum.PENDENTE,
      "pedido-001",
      [
        new PedidoComboEntity(
          new ProdutoEntity(
            "Lanche",
            "Hambúrguer",
            20,
            CategoriaEnum.LANCHE,
            "url",
            "produto-001"
          ),
          new ProdutoEntity(
            "Bebida",
            "Refrigerante",
            5,
            CategoriaEnum.BEBIDA,
            "url",
            "produto-002"
          ),
          null,
          null,
          "combo-001"
        ),
      ]
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });
  it("deve listar pedidos corretamente", async () => {
    await gateway.salvarPedido(pedidoMock);

    const pedidos = (await gateway.listarPedidosPorStatus(
      new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO),
      {
        orderField: PedidoGatewayInterfaceFilterOrderField.DATA_CADASTRO,
        orderDirection: PedidoGatewayInterfaceFilterOrderDirection.ASC,
        limit: 10,
        page: 1,
      }
    )) as PedidoEntity[];

    expect(pedidos.length).toBe(1);
    expect(pedidos[0]).toBeInstanceOf(PedidoEntity);
  });

  it("deve buscar um pedido pelo ID corretamente", async () => {
    await gateway.salvarPedido(pedidoMock);

    const pedidoBuscado = await gateway.buscaPedidoPorId("pedido-001");

    expect(pedidoBuscado).not.toBeNull();
    expect(pedidoBuscado?.getId()).toBe("pedido-001");
  });

  it("deve retornar null ao buscar um pedido inexistente", async () => {
    const pedidoBuscado = await gateway.buscaPedidoPorId("pedido-inexistente");

    expect(pedidoBuscado).toBeNull();
  });
});
