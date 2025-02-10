import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { TransactionEntity } from "../../../easyorder/Core/Entity/TransactionEntity";
import { RetornoPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/RetornoPagamentoEnum";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";
import {
  StatusTransacaoEnum,
  StatusTransacaoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusTransacaoValueObject";
import { PedidoGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/PedidoGatewayInterface";
import { TransactionGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/TransactionGatewayInterface";
import { PagamentoServiceInterface } from "../../../easyorder/Core/Interfaces/Services/PagamentoServiceInterface";
import { PagamentoDTO } from "../../../easyorder/Core/Types/dto/PagamentoDTO";
import { PagamentoUsecases } from "../../../easyorder/Core/Usecase/PagamentoUsecases";

describe("PagamentoUsecases", () => {
  let transactionGateway: jest.Mocked<TransactionGatewayInterface>;
  let pedidoGateway: jest.Mocked<PedidoGatewayInterface>;
  let pagamentoService: jest.Mocked<PagamentoServiceInterface>;

  beforeEach(() => {
    transactionGateway = {
      buscarTransactionPorId: jest.fn(),
      atualizarTransactionsPorId: jest.fn(),
      listarTransactionsPorPedido: jest.fn()
    } as unknown as jest.Mocked<TransactionGatewayInterface>;

    pedidoGateway = {
      buscaPedidoPorId: jest.fn(),
      salvarPedido: jest.fn(),
    } as unknown as jest.Mocked<PedidoGatewayInterface>;

    pagamentoService = {
      handlePaymentResponse: jest.fn(),
    } as unknown as jest.Mocked<PagamentoServiceInterface>;
  });

  describe("ConfirmarPagamentoUsecase", () => {
    it("deve confirmar pagamento com sucesso e atualizar o pedido", async () => {
      const payload = "mockedPayload";
      const transactionDTO: PagamentoDTO = {
        id: "transacao-123",
        status: RetornoPagamentoEnum.APROVADO,
        payload,
      };

      const transaction = new TransactionEntity(
        "pedido-123",
        100,
        "transacao-001",
        new Date("2023-01-01"),
        new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO),
        "Mensagem de envio",
        "Mensagem de retorno",
        "hash-abc123"
      );
      const pedido = new PedidoEntity(
        "cliente-123",
        new Date("2023-07-23"),
        new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO),
        StatusPagamentoEnum.PENDENTE,
        "pedido-001"
      );

      pagamentoService.handlePaymentResponse.mockResolvedValue(transactionDTO);
      transactionGateway.buscarTransactionPorId.mockResolvedValue(transaction);
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        transaction
      );
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PagamentoUsecases.ConfirmarPagamentoUsecase(
        transactionGateway,
        pedidoGateway,
        pagamentoService,
        payload
      );

      expect(resultado.transacao).toBe(transaction);
      expect(resultado.mensagem).toBe(
        "Transação confirmada e pedido atualizado"
      );
      expect(transaction.getStatusTransacao()).toBe(StatusTransacaoEnum.PAGO);
      expect(pedido.getStatusPagamento()).toBe(StatusPagamentoEnum.PAGO);
      expect(pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.RECEBIDO
      );
    });

    it("deve retornar mensagem de transação não encontrada", async () => {
      const payload = "mockedPayload";
      const transactionDTO: PagamentoDTO = {
        id: "transacao-123",
        status: RetornoPagamentoEnum.APROVADO,
        payload,
      };

      pagamentoService.handlePaymentResponse.mockResolvedValue(transactionDTO);
      transactionGateway.buscarTransactionPorId.mockResolvedValue(undefined);

      const resultado = await PagamentoUsecases.ConfirmarPagamentoUsecase(
        transactionGateway,
        pedidoGateway,
        pagamentoService,
        payload
      );

      expect(resultado.transacao).toBeUndefined();
      expect(resultado.mensagem).toBe("Transação não encontrada.");
    });

    it("deve retornar mensagem de pedido associado não encontrado", async () => {
      const payload = "mockedPayload";
      const transactionDTO: PagamentoDTO = {
        id: "transacao-123",
        status: RetornoPagamentoEnum.APROVADO,
        payload,
      };

      const transaction = new TransactionEntity("pedido-id", 100);
      pagamentoService.handlePaymentResponse.mockResolvedValue(transactionDTO);
      transactionGateway.buscarTransactionPorId.mockResolvedValue(transaction);
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null); // Simular que não encontrou o pedido

      const resultado = await PagamentoUsecases.ConfirmarPagamentoUsecase(
        transactionGateway,
        pedidoGateway,
        pagamentoService,
        payload
      );

      expect(resultado.transacao).toBeUndefined();
      expect(resultado.mensagem).toBe(
        "Pedido associado à transação não foi encontrado."
      );
    });

    it("deve retornar mensagem de transação já finalizada", async () => {
      const payload = "mockedPayload";
      const transactionDTO: PagamentoDTO = {
        id: "transacao-123",
        status: RetornoPagamentoEnum.APROVADO,
        payload,
      };

      const transaction = new TransactionEntity(
        "pedido-123",
        100,
        "transacao-001",
        new Date("2023-01-01"),
        new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO),
        "Mensagem de envio",
        "Mensagem de retorno",
        "hash-abc123"
      );

      transaction.setStatusTransacao(
        new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO)
      );

      pagamentoService.handlePaymentResponse.mockResolvedValue(transactionDTO);
      transactionGateway.buscarTransactionPorId.mockResolvedValue(transaction);
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(
        new PedidoEntity("cliente-id")
      );

      const resultado = await PagamentoUsecases.ConfirmarPagamentoUsecase(
        transactionGateway,
        pedidoGateway,
        pagamentoService,
        payload
      );

      expect(resultado.transacao).toBeUndefined();
      expect(resultado.mensagem).toBe("Transação já finalizada.");
    });

    it("deve marcar transação como negada e atualizar pedido", async () => {
      const payload = "mockedPayload";
      const transactionDTO: PagamentoDTO = {
        id: "transacao-123",
        status: RetornoPagamentoEnum.NEGADO,
        payload,
      };

      const transaction = new TransactionEntity(
        "pedido-123",
        100,
        "transacao-001",
        new Date("2023-01-01"),
        new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO),
        "Mensagem de envio",
        "Mensagem de retorno",
        "hash-abc123"
      );
      const pedido = new PedidoEntity("cliente-id");

      pagamentoService.handlePaymentResponse.mockResolvedValue(transactionDTO);
      transactionGateway.buscarTransactionPorId.mockResolvedValue(transaction);
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        transaction
      );
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PagamentoUsecases.ConfirmarPagamentoUsecase(
        transactionGateway,
        pedidoGateway,
        pagamentoService,
        payload
      );

      expect(resultado.transacao).toBe(transaction);
      expect(resultado.mensagem).toBe(
        "Transação com status diferente de approved - NEGADA e pedido CANCELADO"
      );
      expect(transaction.getStatusTransacao()).toBe(StatusTransacaoEnum.NEGADO);
      expect(pedido.getStatusPagamento()).toBe(StatusPagamentoEnum.NEGADO);
      expect(pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.CANCELADO
      );
    });
  });

  describe("ListarTransacoesUsecase", () => {
    it("deve listar transações com sucesso", async () => {
      const pedidoId = "pedido-123";
      const transaction1 = new TransactionEntity(
        'pedido-123',
        100, 
        'transacao-001',
        new Date('2023-01-01'),
        new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO), 
        'Mensagem de envio', 
        'Mensagem de retorno',
        'hash-abc123'
      );
      const transaction2 = new TransactionEntity(
        'pedido-1234',
        200, 
        'transacao-002',
        new Date('2023-01-02'),
        new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO), 
        'Mensagem de envio', 
        'Mensagem de retorno',
        'hash-abc1234'
      );
      const transacoes = [transaction1, transaction2];

      transactionGateway.listarTransactionsPorPedido.mockResolvedValue(
        transacoes
      );

      const resultado = await PagamentoUsecases.ListarTransacoesUsecase(
        transactionGateway,
        pedidoGateway,
        pedidoId
      );

      expect(resultado.transacoes).toEqual(transacoes);
      expect(resultado.mensagem).toBe(
        `Sucesso. ${transacoes.length} Transações encontrada(s).`
      );
    });

    it("deve retornar mensagem de nenhuma transação encontrada", async () => {
      const pedidoId = "pedido-123";

      transactionGateway.listarTransactionsPorPedido.mockResolvedValue(
        undefined
      );

      const resultado = await PagamentoUsecases.ListarTransacoesUsecase(
        transactionGateway,
        pedidoGateway,
        pedidoId
      );

      expect(resultado.transacoes).toBeUndefined();
      expect(resultado.mensagem).toBe(
        "Não foram encontradas transações para o pedido."
      );
    });
  });
});
