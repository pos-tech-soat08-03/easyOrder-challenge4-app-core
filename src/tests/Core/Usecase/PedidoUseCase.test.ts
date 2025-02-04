import { PedidoComboEntity } from "../../../easyorder/Core/Entity/PedidoComboEntity";
import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { ProdutoEntity } from "../../../easyorder/Core/Entity/ProdutoEntity";
import { TransactionEntity } from "../../../easyorder/Core/Entity/TransactionEntity";
import { CategoriaEnum } from "../../../easyorder/Core/Entity/ValueObject/CategoriaEnum";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";
import {
  PedidoGatewayInterface,
  PedidoGatewayInterfaceFilter,
} from "../../../easyorder/Core/Interfaces/Gateway/PedidoGatewayInterface";
import { ProdutoGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/ProdutoGatewayInterface";
import { TransactionGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/TransactionGatewayInterface";
import { PagamentoServiceInterface } from "../../../easyorder/Core/Interfaces/Services/PagamentoServiceInterface";
import { PedidoUsecases } from "../../../easyorder/Core/Usecase/PedidoUsecases";

describe("PedidoUsecases", () => {
  let pedidoGateway: jest.Mocked<PedidoGatewayInterface>;
  let produtoGateway: jest.Mocked<ProdutoGatewayInterface>;
  let transactionGateway: jest.Mocked<TransactionGatewayInterface>;
  let pagamentoService: jest.Mocked<PagamentoServiceInterface>;
  let pedido: PedidoEntity;
  const clienteId = "aa9b1222-0ba2-4388-9bde-e1a1d5ca1015";
  beforeEach(() => {
    pedido = new PedidoEntity(clienteId);
    pedidoGateway = {
      salvarPedido: jest.fn(),
      listarPedidosPorStatus: jest.fn(),
      buscaPedidoPorId: jest.fn(),
    } as unknown as jest.Mocked<PedidoGatewayInterface>;

    produtoGateway = {
      buscarProdutoPorId: jest.fn(),
    } as unknown as jest.Mocked<ProdutoGatewayInterface>;

    transactionGateway = {
      salvarTransaction: jest.fn(),
      atualizarTransactionsPorId: jest.fn(),
    } as unknown as jest.Mocked<TransactionGatewayInterface>;

    pagamentoService = {
      processPayment: jest.fn(),
    } as unknown as jest.Mocked<PagamentoServiceInterface>;
  });

  describe("CadastrarPedido", () => {
    it("deve cadastrar um pedido com clientId definido", async () => {
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.CadastrarPedido(
        clienteId,
        pedidoGateway
      );

      expect(resultado.pedido).toBeInstanceOf(PedidoEntity);
      expect(resultado.mensagem).toBe("Pedido cadastrado com sucesso");
    });

    it('deve cadastrar um pedido com clientId undefined (usando "NAO_IDENTIFICADO")', async () => {
      const pedido = new PedidoEntity("NAO_IDENTIFICADO");

      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.CadastrarPedido(
        undefined,
        pedidoGateway
      );

      expect(resultado.pedido).toBeInstanceOf(PedidoEntity);
      expect(resultado.mensagem).toBe("Pedido cadastrado com sucesso");
    });

    it("deve lançar erro ao salvar o pedido", async () => {
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CadastrarPedido("cliente-123", pedidoGateway)
      ).rejects.toThrow("Erro ao salvar pedido");
    });
  });

  describe("ListarPedidosPorStatus", () => {
    it("deve listar pedidos por status", async () => {
      const pedidos = [new PedidoEntity("cliente-123")];
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue(pedidos);

      const resultado = await PedidoUsecases.ListarPedidosPorStatus(
        pedidoGateway,
        StatusPedidoEnum.EM_ABERTO,
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      expect(resultado.pedidos).toHaveLength(1);
      expect(resultado.mensagem).toBe("Pedidos listados com sucesso");
    });

    it("deve lançar erro ao listar pedidos", async () => {
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue(null);

      const listarPedidos = PedidoUsecases.ListarPedidosPorStatus(
        pedidoGateway,
        StatusPedidoEnum.EM_ABERTO,
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      await expect(listarPedidos).rejects.toThrow("Erro ao listar pedidos");
    });

    it("deve lançar erro se nenhum pedido for encontrado", async () => {
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue([]);

      await expect(
        PedidoUsecases.ListarPedidosPorStatus(
          pedidoGateway,
          StatusPedidoEnum.EM_ABERTO,
          1,
          10,
          "dataCriacao",
          "ASC"
        )
      ).rejects.toThrow("Nenhum pedido encontrado");
    });
  });

  describe("BuscaPedidoPorId", () => {
    it("deve buscar um pedido por ID", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.BuscaPedidoPorId(
        pedidoGateway,
        "pedido-123"
      );

      expect(resultado.pedido).toBeInstanceOf(PedidoEntity);
      expect(resultado.mensagem).toBe("Pedido encontrado");
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.BuscaPedidoPorId(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Pedido não encontrado");
    });
  });

  describe("CancelarPedido", () => {
    it("deve cancelar um pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.CancelarPedido(
        pedidoGateway,
        "pedido-123"
      );

      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.CANCELADO
      );
      expect(resultado.mensagem).toBe("Pedido cancelado com sucesso");
    });

    it("deve lançar erro se o pedido já estiver cancelado", async () => {
      pedido.setStatusPedido(
        new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO)
      );
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);

      await expect(
        PedidoUsecases.CancelarPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Pedido já cancelado");
    });

    it("deve lançar erro se não encontrar o pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CancelarPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Pedido não encontrado");
    });
    it("deve lançar erro ao salvar o pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CancelarPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Erro ao salvar pedido");
    });
  });

  describe("ConfirmarPagamentoPedido", () => {
    const pedidoConfirmaPagamento = new PedidoEntity(
      "cliente-id1",
      new Date("23/07/1993"),
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO),
      StatusPagamentoEnum.PENDENTE,
      "pedidoId",
      []
    );
    it("deve confirmar o pagamento de um pedido", async () => {

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedidoConfirmaPagamento);
      pedidoGateway.salvarPedido.mockResolvedValue(pedidoConfirmaPagamento);

      const resultado = await PedidoUsecases.ConfirmarPagamentoPedido(
        pedidoGateway,
        "pedidoId"
      );

      expect(resultado.pedido.getStatusPagamento()).toBe(
        StatusPagamentoEnum.PAGO
      );
      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.RECEBIDO
      );
      expect(resultado.mensagem).toBe("Pedido fechado com sucesso");
    });

    it("deve lançar erro se o pedido já estiver cancelado", async () => {
      const pedido = new PedidoEntity("cliente-123");
      pedido.setStatusPedido(
        new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO)
      );
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);

      await expect(
        PedidoUsecases.ConfirmarPagamentoPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Pedido já cancelado");
    });
    it("deve lançar erro se não encontrar o pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.ConfirmarPagamentoPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Pedido não encontrado");
    });
    it("deve lançar erro ao não salvar o pedido", async () => {
      const pedidoErroAoSalvar = new PedidoEntity(
        "cliente-id1",
        new Date("23/07/1993"),
        new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO),
        StatusPagamentoEnum.PENDENTE,
        "pedidoId",
        []
      );
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedidoErroAoSalvar);
      pedidoGateway.salvarPedido.mockResolvedValue(null);


      await expect(
        PedidoUsecases.ConfirmarPagamentoPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Erro ao salvar pedido");
    });
  });

  describe("CheckoutPedido", () => {
    const lanche = new ProdutoEntity(
      "Lanche 1",
      "Delicioso lanche com queijo e hambúrguer",
      20,
      CategoriaEnum.LANCHE,
      "https://exemplo.com/lanche1.jpg"
    );

    const bebida = new ProdutoEntity(
      "Bebida 1",
      "Refrigerante gelado",
      10,
      CategoriaEnum.BEBIDA,
      "https://exemplo.com/bebida1.jpg"
    );
    const combo = new PedidoComboEntity(lanche, bebida, null, null);
    const pedidoCheckoutMock = new PedidoEntity(
      "cliente-id2",
      new Date("23/07/1993"),
      new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO),
      StatusPagamentoEnum.PENDENTE,
      "pedidoId",
      [combo]
    );
    const transacao = new TransactionEntity(
      pedidoCheckoutMock.getId(),
      pedidoCheckoutMock.getValorTotal()
    );
    it("deve realizar o checkout de um pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedidoCheckoutMock);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockResolvedValue(transacao);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        transacao
      );
      pedidoGateway.salvarPedido.mockResolvedValue(pedidoCheckoutMock);

      const resultado = await PedidoUsecases.CheckoutPedido(
        pedidoGateway,
        transactionGateway,
        pagamentoService,
        "pedidoId"
      );

      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.AGUARDANDO_PAGAMENTO
      );
      expect(resultado.mensagem).toBe("Pedido fechado com sucesso");
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedidoId"
        )
      ).rejects.toThrow("Pedido não encontrado");
    });

    it("deve lançar erro ao salvar a transação", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedidoCheckoutMock);
      transactionGateway.salvarTransaction.mockRejectedValue(
        new Error("Erro ao salvar transação")
      );

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedido-123"
        )
      ).rejects.toThrow("Erro ao salvar transação inicial");
    });

    it("deve lançar erro ao processar o pagamento", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedidoCheckoutMock);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockRejectedValue(
        new Error("Erro ao enviar transação para o pagamento")
      );

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedidoId"
        )
      ).rejects.toThrow("Erro ao enviar transação para o pagamento");
    });
  });

  describe("AdicionarComboAoPedido", () => {
    it("deve adicionar um combo ao pedido", async () => {
      const lanche = new ProdutoEntity(
        "Lanche",
        "Descrição",
        20,
        CategoriaEnum.LANCHE,
        "url"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(lanche);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.AdicionarComboAoPedido(
        pedidoGateway,
        produtoGateway,
        "pedido-123",
        "lanche-123",
        "",
        "",
        ""
      );

      expect(resultado.pedido).toBeInstanceOf(PedidoEntity);
      expect(resultado.mensagem).toBe("Combo adicionado com sucesso");
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "lanche-123",
          "",
          "",
          ""
        )
      ).rejects.toThrow("Pedido não encontrado");
    });

    it("deve lançar erro se o produto não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "lanche-123",
          "",
          "",
          ""
        )
      ).rejects.toThrow("Lanche não encontrado");
    });

    it("deve lançar erro se o produto não for do tipo esperado", async () => {
      const bebida = new ProdutoEntity(
        "Bebida",
        "Descrição",
        10,
        CategoriaEnum.BEBIDA,
        "url"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(bebida);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "lanche-123",
          "",
          "",
          ""
        )
      ).rejects.toThrow("Produto informado não é um lanche");
    });
  });

  describe("RemoverComboDoPedido", () => {
    it("deve remover um combo do pedido", async () => {
      const pedido = new PedidoEntity("cliente-123");
      const bebida = new ProdutoEntity(
        "Bebida",
        "Descrição",
        10,
        CategoriaEnum.BEBIDA,
        "url"
      );
      const combo = new PedidoComboEntity(null, bebida, null, null);
      pedido.adicionarCombos([combo]);

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.RemoverComboDoPedido(
        pedidoGateway,
        "pedido-123",
        combo.getId()
      );

      expect(resultado.pedido).toBeInstanceOf(PedidoEntity);
      expect(resultado.mensagem).toBe("Combo removido do pedido");
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.RemoverComboDoPedido(
          pedidoGateway,
          "pedido-123",
          "combo-123"
        )
      ).rejects.toThrow("Pedido não encontrado");
    });
  });
});
