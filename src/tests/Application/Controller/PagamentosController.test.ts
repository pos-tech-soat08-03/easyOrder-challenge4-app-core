import { PagamentosController } from "../../../easyorder/Application/Controller/PagamentosController";
import { PagamentoAdapter } from "../../../easyorder/Application/Presenter/PagamentoAdapter";
import { TransactionEntity } from "../../../easyorder/Core/Entity/TransactionEntity";
import {
  StatusTransacaoEnum,
  StatusTransacaoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusTransacaoValueObject";
import { IDbConnection } from "../../../easyorder/Core/Interfaces/IDbConnection";
import { PagamentoServiceInterface } from "../../../easyorder/Core/Interfaces/Services/PagamentoServiceInterface";
import { PagamentoUsecases } from "../../../easyorder/Core/Usecase/PagamentoUsecases";

describe("PagamentosController", () => {
  let dbConnection: jest.Mocked<IDbConnection>;
  let servicoPagamento: jest.Mocked<PagamentoServiceInterface>;
  let transacaoMock: TransactionEntity;

  beforeEach(() => {
    // Mock da transação que será manipulada nos testes
    transacaoMock = new TransactionEntity(
      "pedido-123",
      100,
      "transacao-001",
      new Date("2024-01-01T10:00:00Z"),
      new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO),
      "msg_envio",
      "msg_recebido",
      "hash-abc123"
    );

    // Mock das dependências
    dbConnection = {
      gateways: {
        transactionGateway: {},
        pedidoGateway: {},
      },
    } as unknown as jest.Mocked<IDbConnection>;

    servicoPagamento = {
      handlePaymentResponse: jest.fn(),
    } as unknown as jest.Mocked<PagamentoServiceInterface>;
  });

  describe("ConfirmarPagamento", () => {
    const payload = "mock_payload";

    it("deve confirmar pagamento e retornar JSON formatado corretamente", async () => {
      jest
        .spyOn(PagamentoUsecases, "ConfirmarPagamentoUsecase")
        .mockResolvedValue({
          transacao: transacaoMock,
          mensagem: "Pagamento confirmado",
        });

      const resultado = await PagamentosController.ConfirmarPagamento(
        dbConnection,
        servicoPagamento,
        payload
      );

      expect(JSON.parse(resultado)).toEqual({
        mensagem: "Pagamento confirmado",
        transaction: {
          id: "transacao-001",
          idPedido: "pedido-123",
          dataCriacaoTransacao: "2024-01-01T10:00:00.000Z",
          statusTransacao: "EM_PROCESSAMENTO",
          valorTransacao: 100,
          hash_EMVCo: "hash-abc123",
        },
      });
    });

    it("deve retornar erro formatado se a transação for indefinida", async () => {
      jest
        .spyOn(PagamentoUsecases, "ConfirmarPagamentoUsecase")
        .mockResolvedValue({
          transacao: undefined,
          mensagem: "Erro no pagamento",
        });

      const resultado = await PagamentosController.ConfirmarPagamento(
        dbConnection,
        servicoPagamento,
        payload
      );

      expect(JSON.parse(resultado)).toEqual({
        message: "Erro no pagamento",
      });
    });
  });
  describe("ListarTransacoes", () => {
    const idPedido = "pedido-123";

    it("deve listar transações e retornar JSON formatado corretamente", async () => {
      jest
        .spyOn(PagamentoUsecases, "ListarTransacoesUsecase")
        .mockResolvedValue({
          transacoes: [transacaoMock],
          mensagem: "Transações encontradas",
        });

      const resultado = await PagamentosController.ListarTransacoes(
        dbConnection,
        idPedido
      );

      expect(JSON.parse(resultado)).toEqual({
        mensagem: "Transações encontradas",
        transactions: [
          {
            id: "transacao-001",
            idPedido: "pedido-123",
            dataCriacaoTransacao: "2024-01-01T10:00:00.000Z",
            statusTransacao: "EM_PROCESSAMENTO",
            valorTransacao: 100,
            hash_EMVCo: "hash-abc123",
          },
        ],
      });

      expect(PagamentoUsecases.ListarTransacoesUsecase).toHaveBeenCalledWith(
        dbConnection.gateways.transactionGateway,
        dbConnection.gateways.pedidoGateway,
        idPedido
      );
    });

    it("deve retornar erro formatado se nenhuma transação for encontrada", async () => {
      jest
        .spyOn(PagamentoUsecases, "ListarTransacoesUsecase")
        .mockResolvedValue({
          transacoes: undefined,
          mensagem: "Nenhuma transação encontrada",
        });

      const resultado = await PagamentosController.ListarTransacoes(
        dbConnection,
        idPedido
      );

      expect(JSON.parse(resultado)).toEqual({
        message: "Nenhuma transação encontrada",
      });

      expect(PagamentoUsecases.ListarTransacoesUsecase).toHaveBeenCalledWith(
        dbConnection.gateways.transactionGateway,
        dbConnection.gateways.pedidoGateway,
        idPedido
      );
    });
  });
});
