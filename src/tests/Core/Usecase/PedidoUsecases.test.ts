import { rejects } from "assert";
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
import { PedidoGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/PedidoGatewayInterface";
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
  let lanche: ProdutoEntity;
  let bebida: ProdutoEntity;
  let sobremesa: ProdutoEntity;
  let acompanhamento: ProdutoEntity;
  const clienteId = "aa9b1222-0ba2-4388-9bde-e1a1d5ca1015";
  const pedidoId = "pedido-123";

  const criarProduto = (
    nome: string,
    preco: number,
    categoria: any,
    id: string
  ) => new ProdutoEntity(nome, "Descrição", preco, categoria, "url", id);

  const criarPedido = (
    statusPedido: StatusPedidoEnum,
    statusPagamento: StatusPagamentoEnum,
    id = pedidoId,
    combo: PedidoComboEntity[] = []
  ) =>
    new PedidoEntity(
      clienteId,
      new Date(),
      new StatusPedidoValueObject(statusPedido),
      statusPagamento,
      id,
      combo
    );
  beforeEach(() => {
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
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE
      );
    });
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
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE
      );
    });
    it("deve listar pedidos por status", async () => {
      const pedidos = [pedido];
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
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE
      );
    });
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
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE
      );
    });
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
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.AGUARDANDO_PAGAMENTO,
        StatusPagamentoEnum.PENDENTE,
        "pedidoId"
      );
    });
    it("deve confirmar o pagamento de um pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

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
      pedido = criarPedido(
        StatusPedidoEnum.AGUARDANDO_PAGAMENTO,
        StatusPagamentoEnum.PENDENTE,
        "pedidoId"
      );
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.ConfirmarPagamentoPedido(pedidoGateway, "pedido-123")
      ).rejects.toThrow("Erro ao salvar pedido");
    });
  });

  describe("CheckoutPedido", () => {
    let transacao: TransactionEntity;
    beforeEach(() => {
      const lanche = criarProduto("Lanche 1", 20, CategoriaEnum.LANCHE, "1");
      const bebida = criarProduto("Bebida 1", 10, CategoriaEnum.BEBIDA, "2");
      const combo = new PedidoComboEntity(lanche, bebida, null, null);
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE,
        "pedidoId",
        [combo]
      );
      transacao = new TransactionEntity(pedido.getId(), pedido.getValorTotal());
    });

    it("deve realizar o checkout de um pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockResolvedValue(transacao);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        transacao
      );
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

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
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
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
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedidoId"
        )
      ).rejects.toThrow("Erro ao enviar transação para o pagamento");
    });

    it("deve lançar erro ao atualizar lançar transaction por id", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockResolvedValue(transacao);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        undefined
      );

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedidoId"
        )
      ).rejects.toThrow("Erro ao salvar transacao atualizada.");
    });
    it("deve lançar erro ao salvar pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      transactionGateway.salvarTransaction.mockResolvedValue();
      pagamentoService.processPayment.mockResolvedValue(transacao);
      transactionGateway.atualizarTransactionsPorId.mockResolvedValue(
        transacao
      );
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.CheckoutPedido(
          pedidoGateway,
          transactionGateway,
          pagamentoService,
          "pedidoId"
        )
      ).rejects.toThrow("Erro ao salvar o pedido atualizado.");
    });
  });

  describe("AdicionarComboAoPedido", () => {
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE,
        "pedidoId"
      );
      lanche = criarProduto("Lanche", 20, CategoriaEnum.LANCHE, "lanche-123");
      bebida = criarProduto("Bebida", 5, CategoriaEnum.BEBIDA, "bebida-123");
      sobremesa = criarProduto(
        "Sobremesa",
        15,
        CategoriaEnum.SOBREMESA,
        "sobremesa-123"
      );
      acompanhamento = criarProduto(
        "Acompanhamento",
        40,
        CategoriaEnum.ACOMPANHAMENTO,
        "acompanhamento-123"
      );
    });

    it("deve adicionar um combo ao pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId
        .mockResolvedValueOnce(lanche)
        .mockResolvedValueOnce(bebida)
        .mockResolvedValueOnce(sobremesa)
        .mockResolvedValueOnce(acompanhamento);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.AdicionarComboAoPedido(
        pedidoGateway,
        produtoGateway,
        "pedido-123",
        "lanche-123",
        "bebida-123",
        "sobremesa-123",
        "acompanhamento-123"
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

    it("deve lançar erro se o lanche não for encontrado", async () => {
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
    it("deve lançar erro se a bebida não for encontrada", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "",
          "bebida-123",
          "",
          ""
        )
      ).rejects.toThrow("Bebida não encontrada");
    });
    it("deve lançar erro se a sobremesa não for encontrada", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "",
          "",
          "sobremesa-123",
          ""
        )
      ).rejects.toThrow("Sobremesa não encontrada");
    });
    it("deve lançar erro se o acompanhemento não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "",
          "",
          "",
          "acompanhemento-123"
        )
      ).rejects.toThrow("Acompanhamento não encontrado");
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
          "",
          "",
          "sobremesa-123",
          ""
        )
      ).rejects.toThrow("Produto informado não é uma sobremesa");
    });
    it("deve lançar erro se o produto não for do tipo esperado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(bebida);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "",
          "",
          "",
          "acompanhamento"
        )
      ).rejects.toThrow("Produto informado não é um acompanhamento");
    });
    it("deve lançar erro se o produto não for do tipo esperado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId.mockResolvedValue(lanche);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "",
          "bebida-123",
          "",
          ""
        )
      ).rejects.toThrow("Produto informado não é uma bebida");
    });
    it("deve lançar erro se o produto não for do tipo esperado", async () => {
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
    it("deve dar um erro de sistema", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      produtoGateway.buscarProdutoPorId
        .mockResolvedValueOnce(lanche)
        .mockResolvedValueOnce(bebida)
        .mockResolvedValueOnce(sobremesa)
        .mockResolvedValueOnce(acompanhamento);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.AdicionarComboAoPedido(
          pedidoGateway,
          produtoGateway,
          "pedido-123",
          "lanche-123",
          "bebida-123",
          "sobremesa-123",
          "acompanhamento-123"
        )
      ).rejects.toThrow("Erro ao adicionar combo ao pedido");
    });
  });

  describe("RemoverComboDoPedido", () => {
    beforeEach(() => {
      pedido = criarPedido(
        StatusPedidoEnum.EM_ABERTO,
        StatusPagamentoEnum.PENDENTE,
        "pedidoId"
      );
      bebida = criarProduto("Bebida", 5, CategoriaEnum.BEBIDA, "bebida-123");
      const combo = new PedidoComboEntity(null, bebida, null, null, "comboId");
      pedido.adicionarCombos([combo]);
    });
    it("deve remover um combo do pedido", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PedidoUsecases.RemoverComboDoPedido(
        pedidoGateway,
        "pedido-123",
        "comboId"
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
    it("deve lançar erro se o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PedidoUsecases.RemoverComboDoPedido(
          pedidoGateway,
          "pedido-123",
          "comboId"
        )
      ).rejects.toThrow("Erro ao remover combo do pedido");
    });
  });
});
