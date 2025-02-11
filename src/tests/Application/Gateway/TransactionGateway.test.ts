import { DataTypes, Model, Sequelize } from "sequelize";
import { TransactionGateway } from "../../../easyorder/Application/Gateway/TransactionGateway";
import { TransactionEntity } from "../../../easyorder/Core/Entity/TransactionEntity";
import { DBConnectionInfo } from "../../../easyorder/Core/Types/ConnectionInfo";
import { StatusTransacaoEnum, StatusTransacaoValueObject } from "../../../easyorder/Core/Entity/ValueObject/StatusTransacaoValueObject";


describe("TransactionGateway - Testando com SQLite em Memória", () => {
  let gateway: TransactionGateway;
  let sequelize: Sequelize;
  let transactionMock: TransactionEntity;

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

    gateway = new TransactionGateway(dbMock);

    (gateway as any).sequelize = sequelize;

    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    transactionMock = new TransactionEntity(
      "pedido-123",
      100,
      "transacao-001",
      new Date(),
      new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO),
      "Mensagem de envio",
      "Mensagem de retorno",
      "hash-abc123"
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("deve buscar uma transação pelo ID corretamente", async () => {
    await gateway.salvarTransaction(transactionMock);

    const transactionEncontrada = await gateway.buscarTransactionPorId(
      "transacao-001"
    );

    expect(transactionEncontrada).not.toBeNull();
    expect(transactionEncontrada?.getIdTransacao()).toBe("transacao-001");
  });

  it("deve retornar undefined ao buscar uma transação inexistente", async () => {
    const transactionEncontrada = await gateway.buscarTransactionPorId(
      "transacao-inexistente"
    );

    expect(transactionEncontrada).toBeUndefined();
  });

  it("deve listar todas as transações de um pedido", async () => {
    await gateway.salvarTransaction(transactionMock);
    await gateway.salvarTransaction(
      new TransactionEntity(
        "pedido-123",
        200,
        "transacao-002",
        new Date(),
        new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO),
        "Envio",
        "Retorno",
        "hash-def456"
      )
    );

    const transactions = await gateway.listarTransactionsPorPedido(
      "pedido-123"
    );

    expect(transactions.length).toBe(2);
    expect(transactions[0]).toBeInstanceOf(TransactionEntity);
    expect(transactions[1]).toBeInstanceOf(TransactionEntity);
  });

  it("deve atualizar corretamente uma transação", async () => {
    await gateway.salvarTransaction(transactionMock);

    const transacaoAtualizada = new TransactionEntity(
      "pedido-123",
      150,
      "transacao-001",
      new Date(),
      new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO),
      "Nova mensagem",
      "Novo retorno",
      "hash-xyz789"
    );

    const resultado = await gateway.atualizarTransactionsPorId(
      "transacao-001",
      transacaoAtualizada
    );

    expect(resultado).not.toBeUndefined();
    expect(resultado?.getStatusTransacao()).toBe(
      StatusTransacaoEnum.PAGO
    );
  });

  it("deve retornar uma lista vazia se não houver transações do pedido", async () => {
    const transactions = await gateway.listarTransactionsPorPedido(
      "pedido-inexistente"
    );

    expect(transactions.length).toBe(0);
  });
});
