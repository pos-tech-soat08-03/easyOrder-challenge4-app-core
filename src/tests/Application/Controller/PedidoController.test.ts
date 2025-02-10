import { PedidoController } from "../../../easyorder/Application/Controller/PedidoController";
import { PedidoAdapterStatus } from "../../../easyorder/Application/Presenter/PedidoAdapter";
import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { IDbConnection } from "../../../easyorder/Core/Interfaces/IDbConnection";
import { PagamentoServiceInterface } from "../../../easyorder/Core/Interfaces/Services/PagamentoServiceInterface";
import {
  DataNotFoundException,
  ValidationErrorException,
} from "../../../easyorder/Core/Types/ExceptionType";
import { PedidoUsecases } from "../../../easyorder/Core/Usecase/PedidoUsecases";
import { ProdutoService } from "../../../easyorder/Infrastructure/Service/ProdutoService";

describe("PedidoController", () => {
  let dbConnection: jest.Mocked<IDbConnection>;
  let pagamentoService: jest.Mocked<PagamentoServiceInterface>;
  let produtoService: jest.Mocked<ProdutoService>;

  beforeEach(() => {
    dbConnection = {
      gateways: {
        pedidoGateway: {
          buscaPedidoPorId: jest.fn(),
          listarPedidosPorStatus: jest.fn(),
          salvarPedido: jest.fn(),
        },
        transactionGateway: jest.fn(),
      },
    } as unknown as jest.Mocked<IDbConnection>;

    pagamentoService = {
      processPayment: jest.fn(),
    } as unknown as jest.Mocked<PagamentoServiceInterface>;

    produtoService = {
      gateways: {
        produtoGateway: jest.fn(),
      },
    } as unknown as jest.Mocked<ProdutoService>;
  });

  describe("CadastrarPedido", () => {
    it("deve cadastrar um pedido com sucesso", async () => {
      PedidoUsecases.CadastrarPedido = jest.fn().mockResolvedValue({
        pedido: new PedidoEntity("cliente-123"),
        mensagem: "Pedido cadastrado com sucesso",
      });

      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        true,
        "cliente-123"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
      expect(JSON.parse(resultado.dataJsonString).mensagem).toBe(
        "Pedido cadastrado com sucesso"
      );
    });

    it("deve retornar erro de validação se clienteId for inválido", async () => {
      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        true,
        123 as any
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });

    it("deve retornar erro de validação se clienteIdentificado for inválido", async () => {
      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        123 as any,
        "inputValido"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });

    it("deve retornar erro ao tratar DataNotFoundException", async () => {
      PedidoUsecases.CadastrarPedido = jest
        .fn()
        .mockRejectedValue(
          new DataNotFoundException("Erro ao cadastrar pedido.")
        );

      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        true,
        "cliente-xyz"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve retornar erro no sistema ao capturar exceções desconhecidas", async () => {
      PedidoUsecases.CadastrarPedido = jest
        .fn()
        .mockRejectedValue(new Error("Erro inesperado"));

      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        true,
        "cliente-xyz"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
    });
    it("deve lidar com exceção ao salvar o pedido no banco de dados", async () => {
      PedidoUsecases.CadastrarPedido = jest
        .fn()
        .mockRejectedValue(
          new ValidationErrorException("Erro ao cadastrar pedido")
        );

      const resultado = await PedidoController.CadastrarPedido(
        dbConnection,
        true,
        "cliente-erro"
      );
      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
  });

  describe("ListarPedidosPorStatus", () => {
    it("deve listar pedidos corretamente", async () => {
      PedidoUsecases.ListarPedidosPorStatus = jest.fn().mockResolvedValue({
        pedidos: [new PedidoEntity("cliente-123")],
        mensagem: "Listagem bem-sucedida",
      });

      const resultado = await PedidoController.ListarPedidosPorStatus(
        dbConnection,
        "EM_ABERTO",
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
      expect(JSON.parse(resultado.dataJsonString).mensagem).toBe(
        "Listagem bem-sucedida"
      );
    });

    it("deve retornar erro DataNotFoundException", async () => {
      PedidoUsecases.ListarPedidosPorStatus = jest
        .fn()
        .mockRejectedValue(
          new DataNotFoundException("Nenhum pedido encontrado")
        );

      const resultado = await PedidoController.ListarPedidosPorStatus(
        dbConnection,
        "EM_ABERTO",
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve capturar erro ao listar pedidos e retornar VALIDATE_ERROR", async () => {
      PedidoUsecases.ListarPedidosPorStatus = jest
        .fn()
        .mockRejectedValue(
          new ValidationErrorException("Falha ao listar pedidos")
        );

      const resultado = await PedidoController.ListarPedidosPorStatus(
        dbConnection,
        "EM_PREPARACAO",
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });

    it("deve capturar erro ao listar pedidos e retornar SYSTEM_ERROR", async () => {
      PedidoUsecases.ListarPedidosPorStatus = jest
        .fn()
        .mockRejectedValue(new Error("Falha ao listar pedidos"));

      const resultado = await PedidoController.ListarPedidosPorStatus(
        dbConnection,
        "EM_PREPARACAO",
        1,
        10,
        "dataCriacao",
        "ASC"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
    });
  });

  describe("BuscaPedidoPorId", () => {
    it("deve encontrar o pedido", async () => {
      PedidoUsecases.BuscaPedidoPorId = jest.fn().mockResolvedValue({
        pedido: new PedidoEntity("cliente-123"),
        mensagem: "Pedido encontrado",
      });

      const resultado = await PedidoController.BuscaPedidoPorId(
        dbConnection,
        "pedido-123"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
    });

    it("deve retornar erro quando pedido não for encontrado", async () => {
      PedidoUsecases.BuscaPedidoPorId = jest
        .fn()
        .mockResolvedValue({ pedido: undefined });

      const resultado = await PedidoController.BuscaPedidoPorId(
        dbConnection,
        "pedido-999"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve retornar erro de sistema", async () => {
      PedidoUsecases.BuscaPedidoPorId = jest
        .fn()
        .mockRejectedValue(new Error("Erro ao buscar pedido."));

      const resultado = await PedidoController.BuscaPedidoPorId(
        dbConnection,
        "pedido-999"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
    });
    it("deve retornar erro de validação", async () => {
      PedidoUsecases.BuscaPedidoPorId = jest
        .fn()
        .mockRejectedValue(
          new ValidationErrorException("Erro ao validar pedido")
        );

      const resultado = await PedidoController.BuscaPedidoPorId(
        dbConnection,
        "pedido-999"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
  });

  describe("CancelarPedido", () => {
    it("deve cancelar um pedido com sucesso", async () => {
      PedidoUsecases.CancelarPedido = jest.fn().mockResolvedValue({
        pedido: new PedidoEntity("cliente-789"),
        mensagem: "Pedido cancelado com sucesso",
      });

      const resultado = await PedidoController.CancelarPedido(
        dbConnection,
        "pedido-789"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
    });

    it("deve retornar erro quando pedido não for encontrado", async () => {
      PedidoUsecases.CancelarPedido = jest
        .fn()
        .mockResolvedValue({ pedido: undefined });

      const resultado = await PedidoController.CancelarPedido(
        dbConnection,
        "pedido-555"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve lançar validationError em caso de erro de validação", async () => {
      PedidoUsecases.CancelarPedido = jest
        .fn()
        .mockRejectedValue(new ValidationErrorException("Erro inesperado"));

      const resultado = await PedidoController.CancelarPedido(
        dbConnection,
        "pedido-erro"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
    it("deve lançar systemError em caso de erro inesperado", async () => {
      PedidoUsecases.CancelarPedido = jest
        .fn()
        .mockRejectedValue(new Error("Erro inesperado"));

      const resultado = await PedidoController.CancelarPedido(
        dbConnection,
        "pedido-erro"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao cancelar pedido."
      );
    });

    it("deve lidar corretamente com pedidos inexistentes", async () => {
      PedidoUsecases.CancelarPedido = jest
        .fn()
        .mockResolvedValue({ pedido: undefined });

      const resultado = await PedidoController.CancelarPedido(
        dbConnection,
        "pedido-nao-existe"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });
  });

  describe("CheckoutPedido", () => {
    it("deve realizar checkout com sucesso", async () => {
      PedidoUsecases.CheckoutPedido = jest.fn().mockResolvedValue({
        pedido: new PedidoEntity("cliente-777"),
        mensagem: "Checkout realizado com sucesso",
      });

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-777"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
    });

    it("deve retornar erro de validação ao falhar no checkout", async () => {
      PedidoUsecases.CheckoutPedido = jest
        .fn()
        .mockRejectedValue(new ValidationErrorException("Erro no checkout"));

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-888"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
    it("deve retornar erro se PedidoUsecases falhar", async () => {
      PedidoUsecases.CheckoutPedido = jest
        .fn()
        .mockRejectedValue(new Error("Falha crítica"));

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-problema"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao Checkout pedido."
      );
    });

    it("deve retornar erro se PedidoUsecases não retornar um pedido válido", async () => {
      PedidoUsecases.CheckoutPedido = jest.fn().mockResolvedValue(undefined);

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-inexistente"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve retornar erro de validação caso falhe por problemas de entrada", async () => {
      PedidoUsecases.CheckoutPedido = jest
        .fn()
        .mockRejectedValue(new ValidationErrorException("Erro de validação"));

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-invalido"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
    it("deve falhar se `transactionGateway` estiver indisponível", async () => {
      PedidoUsecases.CheckoutPedido = jest
        .fn()
        .mockRejectedValue(new Error("Falha no transaction gateway"));

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-problematico"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao Checkout pedido."
      );
    });

    it("deve lidar com erro no serviço de pagamento", async () => {
      pagamentoService.processPayment.mockRejectedValue(
        new Error("Erro no pagamento")
      );

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        "pedido-falha"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao Checkout pedido."
      );
    });

    it("deve retornar erro de validação caso falhe pela entrada de parâmetros", async () => {
      PedidoUsecases.CheckoutPedido = jest
        .fn()
        .mockRejectedValue(new ValidationErrorException("Erro de validação"));

      const resultado = await PedidoController.CheckoutPedido(
        dbConnection,
        pagamentoService,
        ""
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
  });
  describe("ConfirmarPagamentoPedido", () => {
    it("deve confirmar pagamento com sucesso", async () => {
      PedidoUsecases.ConfirmarPagamentoPedido = jest.fn().mockResolvedValue({
        pedido: new PedidoEntity("cliente-777"),
        mensagem: "Pagamento realizado com sucesso",
      });

      const resultado = await PedidoController.ConfirmarPagamentoPedido(
        dbConnection,
        "pedido-001"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
      expect(JSON.parse(resultado.dataJsonString).mensagem).toBe(
        "Pagamento realizado com sucesso"
      );
    });

    it("deve lidar com erro de `DataNotFoundException` quando pedido não for encontrado", async () => {
      PedidoUsecases.ConfirmarPagamentoPedido = jest
        .fn()
        .mockResolvedValue(null);

      const resultado = await PedidoController.ConfirmarPagamentoPedido(
        dbConnection,
        "pedido-invalido"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });
    it("deve capturar erro de validação no processo de confirmação de pagamento", async () => {
      PedidoUsecases.ConfirmarPagamentoPedido = jest
        .fn()
        .mockRejectedValue(new ValidationErrorException("Erro de validação"));

      const resultado = await PedidoController.ConfirmarPagamentoPedido(
        dbConnection,
        "pedido-erro1"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.VALIDATE_ERROR);
    });
    it("deve capturar erro inesperado no processo de confirmação de pagamento", async () => {
      PedidoUsecases.ConfirmarPagamentoPedido = jest
        .fn()
        .mockRejectedValue(new Error("Falha inesperada"));

      const resultado = await PedidoController.ConfirmarPagamentoPedido(
        dbConnection,
        "pedido-erro"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
    });
  });
  describe("AdicionarComboAoPedido - Testes Faltantes", () => {
    it("deve retornar erro se pedido não for encontrado", async () => {
      PedidoUsecases.AdicionarComboAoPedido = jest
        .fn()
        .mockResolvedValue({ pedido: undefined });

      const resultado = await PedidoController.AdicionarComboAoPedido(
        dbConnection,
        produtoService,
        "pedido-inexistente",
        "lanche-123",
        "bebida-456",
        "sobremesa-789",
        "acompanhamento-101"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve lidar corretamente com erro crítico", async () => {
      PedidoUsecases.AdicionarComboAoPedido = jest
        .fn()
        .mockRejectedValue(new Error("Erro desconhecido"));

      const resultado = await PedidoController.AdicionarComboAoPedido(
        dbConnection,
        produtoService,
        "pedido-erro",
        "lanche-xyz",
        "bebida-abc",
        "sobremesa-123",
        "acompanhamento-999"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao adicionar combo ao pedido."
      );
    });


    it("deve validar a resposta correta ao adicionar combo com sucesso", async () => {
      const pedidoMock = new PedidoEntity("cliente-456");

      PedidoUsecases.AdicionarComboAoPedido = jest.fn().mockResolvedValue({
        pedido: pedidoMock,
        mensagem: "Combo adicionado com sucesso",
      });

      const resultado = await PedidoController.AdicionarComboAoPedido(
        dbConnection,
        produtoService,
        "pedido-123",
        "lanche-1",
        "bebida-2",
        "sobremesa-3",
        "acompanhamento-4"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SUCCESS);
      expect(JSON.parse(resultado.dataJsonString).mensagem).toBe(
        "Combo adicionado com sucesso"
      );
    });
  });

  describe("RemoverComboDoPedido - Extendendo Testes", () => {
    it("deve retornar erro se combo não for encontrado no pedido", async () => {
      PedidoUsecases.RemoverComboDoPedido = jest
        .fn()
        .mockResolvedValue({ pedido: undefined });

      const resultado = await PedidoController.RemoverComboDoPedido(
        dbConnection,
        "pedido-123",
        "combo-nao-existe"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.DATA_NOT_FOUND);
    });

    it("deve capturar erro durante a remoção de combo", async () => {
      PedidoUsecases.RemoverComboDoPedido = jest
        .fn()
        .mockRejectedValue(new Error("Erro ao remover combo"));

      const resultado = await PedidoController.RemoverComboDoPedido(
        dbConnection,
        "pedido-123",
        "combo-erro"
      );

      expect(resultado.status).toBe(PedidoAdapterStatus.SYSTEM_ERROR);
      expect(JSON.parse(resultado.dataJsonString).message).toBe(
        "Erro ao remover combo do pedido."
      );
    });
  });
});
