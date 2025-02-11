import { PreparacaoController } from "../../../easyorder/Application/Controller/PreparacaoController";
import { PedidoAdapter } from "../../../easyorder/Application/Presenter/PedidoAdapter";
import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";
import { IDbConnection } from "../../../easyorder/Core/Interfaces/IDbConnection";
import {
  DataNotFoundException,
  ValidationErrorException,
} from "../../../easyorder/Core/Types/ExceptionType";
import { PreparacaoUseCases } from "../../../easyorder/Core/Usecase/PreparacaoUsecases";

describe("PreparacaoController", () => {
  let dbConnection: jest.Mocked<IDbConnection>;
  let pedidoGatewayMock: any;
  let pedidoMock: PedidoEntity;

  beforeEach(() => {
    pedidoMock = new PedidoEntity(
      "cliente-123",
      new Date("2024-01-01T10:00:00Z"),
      new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO),
      StatusPagamentoEnum.PENDENTE,
      "pedido-123",
      []
    );

    pedidoGatewayMock = {
      buscaProximoPedido: jest.fn(),
      entregaPedidoUseCase: jest.fn(),
      iniciarPreparacaoPedidoUseCase: jest.fn(),
      finalizaPreparacaoUseCase: jest.fn(),
    };

    dbConnection = {
      gateways: {
        pedidoGateway: pedidoGatewayMock,
      },
    } as unknown as jest.Mocked<IDbConnection>;
    jest.clearAllMocks();
  });

  describe("buscarProximoPedido", () => {
    it("deve retornar um pedido com sucesso", async () => {
      jest
        .spyOn(PreparacaoUseCases, "buscaProximoPedidoUseCase")
        .mockResolvedValue({
          pedido: pedidoMock,
          mensagem: "Pedido encontrado",
        });

      const resultado = await PreparacaoController.buscarProximoPedido(
        dbConnection
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.successPedido(pedidoMock, "Pedido encontrado")
      );
    });

    it("deve retornar erro quando nenhum pedido for encontrado", async () => {
      jest
        .spyOn(PreparacaoUseCases, "buscaProximoPedidoUseCase")
        .mockResolvedValue({
          pedido: undefined,
          mensagem: "Nenhum pedido disponível",
        });

      const resultado = await PreparacaoController.buscarProximoPedido(
        dbConnection
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.dataNotFound("Nenhum pedido disponível")
      );
    });

    it("deve capturar DataNotFoundException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "buscaProximoPedidoUseCase")
        .mockRejectedValue(new DataNotFoundException("Pedido não encontrado"));

      const resultado = await PreparacaoController.buscarProximoPedido(
        dbConnection
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.dataNotFound("Pedido não encontrado")
      );
    });
    it("deve capturar ValidationErrorException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "buscaProximoPedidoUseCase")
        .mockRejectedValue(
          new ValidationErrorException("Erro ao buscar próximo pedido.")
        );

      const resultado = await PreparacaoController.buscarProximoPedido(
        dbConnection
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.validateError("Erro ao buscar próximo pedido.")
      );
    });
    it("deve capturar systemError corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "buscaProximoPedidoUseCase")
        .mockRejectedValue(new Error("Erro ao buscar próximo pedido."));

      const resultado = await PreparacaoController.buscarProximoPedido(
        dbConnection
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.systemError("Erro ao buscar próximo pedido.")
      );
    });
  });

  describe("entregarPedido", () => {
    it("deve retornar erro para ID inválido", async () => {
      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        null as any
      );
      expect(resultado).toEqual(
        PedidoAdapter.validateError("Id do pedido inválido")
      );
    });

    it("deve entregar um pedido com sucesso", async () => {
      jest.spyOn(PreparacaoUseCases, "entregaPedidoUseCase").mockResolvedValue({
        pedido: pedidoMock,
        mensagem: "Pedido entregue",
      });

      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.successPedido(pedidoMock, "Pedido entregue")
      );
    });
    it("deve entregar resposta de sucesso mas sem pedido", async () => {
      jest.spyOn(PreparacaoUseCases, "entregaPedidoUseCase").mockResolvedValue({
        pedido: undefined as any,
        mensagem: "Pedido não encontrado",
      });

      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.dataNotFound("Pedido não encontrado")
      );
    });
    it("deve capturar DataNotFoundException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "entregaPedidoUseCase")
        .mockRejectedValue(new DataNotFoundException("Pedido não encontrado"));

      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.dataNotFound("Pedido não encontrado")
      );
    });
    it("deve capturar ValidationErrorException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "entregaPedidoUseCase")
        .mockRejectedValue(
          new ValidationErrorException("Erro ao validar entregaPedido.")
        );

      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.validateError("Erro ao validar entregaPedido.")
      );
    });
    it("deve capturar systemError corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "entregaPedidoUseCase")
        .mockRejectedValue(new Error("Erro ao entregar pedido."));

      const resultado = await PreparacaoController.entregarPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toMatchObject(
        PedidoAdapter.systemError("Erro ao entregar pedido.")
      );
    });
  });

  describe("iniciarPreparacaoPedido", () => {
    it("deve retornar erro para ID inválido", async () => {
      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        null as any
      );
      expect(resultado).toEqual(
        PedidoAdapter.validateError("Id do pedido inválido")
      );
    });

    it("deve iniciar a preparação do pedido corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "iniciarPreparacaoPedidoUseCase")
        .mockResolvedValue({
          pedido: pedidoMock,
          mensagem: "Pedido em preparação",
        });

      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.successPedido(pedidoMock, "Pedido em preparação")
      );
    });
    it("deve receber chamda sem pedido e informar erro", async () => {
      jest
        .spyOn(PreparacaoUseCases, "iniciarPreparacaoPedidoUseCase")
        .mockResolvedValue({
          pedido: undefined as any,
          mensagem: "Pedido não encontrado",
        });

      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        "pedido-123"
      );
      expect(resultado).toStrictEqual(
        PedidoAdapter.dataNotFound("Pedido não encontrado")
      );
    });
    it("deve capturar DataNotFoundException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "iniciarPreparacaoPedidoUseCase")
        .mockRejectedValue(new DataNotFoundException("Erro na preparação"));

      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.dataNotFound("Erro na preparação")
      );
    });
    it("deve capturar ValidationErrorException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "iniciarPreparacaoPedidoUseCase")
        .mockRejectedValue(new ValidationErrorException("Erro na preparação"));

      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.validateError("Erro na preparação")
      );
    });
    it("deve capturar systemError corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "iniciarPreparacaoPedidoUseCase")
        .mockRejectedValue(new Error("Erro ao iniciar preparação do pedido."));

      const resultado = await PreparacaoController.iniciarPreparacaoPedido(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.systemError("Erro ao iniciar preparação do pedido.")
      );
    });
  });

  describe("finalizaPreparacao", () => {
    it("deve retornar erro para ID inválido", async () => {
      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        null as any
      );
      expect(resultado).toEqual(
        PedidoAdapter.validateError("Id do pedido inválido")
      );
    });

    it("deve finalizar a preparação do pedido corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "finalizaPreparacaoUseCase")
        .mockResolvedValue({
          pedido: pedidoMock,
          mensagem: "Preparação finalizada",
        });

      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.successPedido(pedidoMock, "Preparação finalizada")
      );
    });
    it("deve capturar erro de pedido não encontrado", async () => {
      jest
        .spyOn(PreparacaoUseCases, "finalizaPreparacaoUseCase")
        .mockResolvedValue({
          pedido: undefined as any,
          mensagem: "Pedido não encontrado para finalizar preparação",
        });

      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.dataNotFound(
          "Pedido não encontrado para finalizar preparação"
        )
      );
    });
    it("deve capturar DataNotFoundException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "finalizaPreparacaoUseCase")
        .mockRejectedValue(
          new DataNotFoundException("Erro ao finalizar preparação")
        );

      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.dataNotFound("Erro ao finalizar preparação")
      );
    });
    it("deve capturar ValidationErrorException corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "finalizaPreparacaoUseCase")
        .mockRejectedValue(
          new ValidationErrorException("Erro ao finalizar preparação")
        );

      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.validateError("Erro ao finalizar preparação")
      );
    });
    it("deve capturar erros inesperados corretamente", async () => {
      jest
        .spyOn(PreparacaoUseCases, "finalizaPreparacaoUseCase")
        .mockRejectedValue(new Error("Erro ao finalizar preparação"));

      const resultado = await PreparacaoController.finalizaPreparacao(
        dbConnection,
        "pedido-123"
      );

      expect(resultado).toStrictEqual(
        PedidoAdapter.systemError("Erro ao finalizar preparação do pedido.")
      );
    });
  });
});
