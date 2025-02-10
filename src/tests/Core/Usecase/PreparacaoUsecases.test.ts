import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import { StatusPedidoEnum, StatusPedidoValueObject } from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";
import { PedidoGatewayInterface } from "../../../easyorder/Core/Interfaces/Gateway/PedidoGatewayInterface";
import {
  DataNotFoundException,
  PersistenceErrorException,
  ValidationErrorException,
} from "../../../easyorder/Core/Types/ExceptionType";
import { PreparacaoUseCases } from "../../../easyorder/Core/Usecase/PreparacaoUsecases";

describe("PreparacaoUseCases", () => {
  let pedidoGateway: jest.Mocked<PedidoGatewayInterface>;

  beforeEach(() => {
    pedidoGateway = {
      buscaPedidoPorId: jest.fn(),
      salvarPedido: jest.fn(),
      listarPedidosPorStatus: jest.fn(),
    } as unknown as jest.Mocked<PedidoGatewayInterface>;
  });

  describe("iniciarPreparacaoPedidoUseCase", () => {
    it("deve iniciar a preparação do pedido com sucesso", async () => {
      const pedido = new PedidoEntity(
        "cliente-999",
        new Date("2023-05-15"),
        new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO),
        StatusPagamentoEnum.PAGO,
        "pedido-003"
      );
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PreparacaoUseCases.iniciarPreparacaoPedidoUseCase(
        pedidoGateway,
        "pedido-003"
      );

      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.EM_PREPARACAO
      );
      expect(resultado.mensagem).toBe(
        "Preparação do pedido iniciada com sucesso"
      );
    });

    it("deve lançar erro quando o pedido não for encontrado", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.iniciarPreparacaoPedidoUseCase(
          pedidoGateway,
          "pedido-nao-existe"
        )
      ).rejects.toThrow(DataNotFoundException);
    });

    it("deve lançar erro ao tentar salvar um pedido inválido", async () => {
      const pedido = new PedidoEntity(
        "cliente-1000",
        new Date("2023-05-15"),
        new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO),
        StatusPagamentoEnum.PENDENTE,
        "pedido-003"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.iniciarPreparacaoPedidoUseCase(
          pedidoGateway,
          "pedido-003"
        )
      ).rejects.toThrow(ValidationErrorException);
    });
  });

  describe("buscaProximoPedidoUseCase", () => {
    it("deve retornar o próximo pedido corretamente", async () => {
      const pedido = new PedidoEntity("cliente-789");
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue([pedido]);

      const resultado = await PreparacaoUseCases.buscaProximoPedidoUseCase(
        pedidoGateway
      );

      expect(resultado.pedido).toBe(pedido);
      expect(resultado.mensagem).toBe("Pedido encontrado");
    });

    it("deve retornar mensagem quando nenhum pedido for encontrado", async () => {
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue([]);

      const resultado = await PreparacaoUseCases.buscaProximoPedidoUseCase(
        pedidoGateway
      );

      expect(resultado.pedido).toBeUndefined();
      expect(resultado.mensagem).toBe("Nenhum pedido encontrado");
    });

    it("deve lançar erro se falhar ao listar pedidos", async () => {
      pedidoGateway.listarPedidosPorStatus.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.buscaProximoPedidoUseCase(pedidoGateway)
      ).rejects.toThrow("Erro ao listar pedidos");
    });
  });

  describe("finalizaPreparacaoUseCase", () => {
    it("deve marcar o pedido como pronto", async () => {
      const pedido = new PedidoEntity(
        "cliente-100",
        new Date("2023-08-15"),
        new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO),
        StatusPagamentoEnum.PAGO,
        "pedido-003"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PreparacaoUseCases.finalizaPreparacaoUseCase(
        pedidoGateway,
        "pedido-003"
      );

      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.PRONTO
      );
      expect(resultado.mensagem).toBe(
        "Preparação do pedido finalizada com sucesso"
      );
    });

    it("deve lançar erro ao tentar finalizar preparação de um pedido inexistente", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.finalizaPreparacaoUseCase(
          pedidoGateway,
          "pedido-404"
        )
      ).rejects.toThrow(DataNotFoundException);
    });

    it("deve lançar erro se a persistência do pedido falhar", async () => {
      const pedido = new PedidoEntity(
        "cliente-800",
        new Date("2023-05-20"),
        new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO),
        StatusPagamentoEnum.PAGO,
        "pedido-003"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.finalizaPreparacaoUseCase(
          pedidoGateway,
          "pedido-003"
        )
      ).rejects.toThrow(PersistenceErrorException);
    });
  });

  describe("entregaPedidoUseCase", () => {
    it("deve definir o pedido como FINALIZADO e retornar a mensagem de sucesso", async () => {
      const pedido = new PedidoEntity(
        "cliente-120",
        new Date("2023-01-30"),
        new StatusPedidoValueObject(StatusPedidoEnum.PRONTO),
        StatusPagamentoEnum.PAGO,
        "pedido-003"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(pedido);

      const resultado = await PreparacaoUseCases.entregaPedidoUseCase(
        pedidoGateway,
        "pedido-003"
      );

      expect(resultado.pedido.getStatusPedido().getValue()).toBe(
        StatusPedidoEnum.FINALIZADO
      );
      expect(resultado.mensagem).toBe("Pedido entregue com sucesso");
    });

    it("deve lançar erro ao tentar entregar um pedido que não existe", async () => {
      pedidoGateway.buscaPedidoPorId.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.entregaPedidoUseCase(
          pedidoGateway,
          "pedido-nao-existe"
        )
      ).rejects.toThrow(DataNotFoundException);
    });

    it("deve lançar erro se o pedido não for salvo corretamente após a entrega", async () => {
      const pedido = new PedidoEntity(
        "cliente-542",
        new Date("2024-07-21"),
        new StatusPedidoValueObject(StatusPedidoEnum.PRONTO),
        StatusPagamentoEnum.PAGO,
        "pedido-003"
      );

      pedidoGateway.buscaPedidoPorId.mockResolvedValue(pedido);
      pedidoGateway.salvarPedido.mockResolvedValue(null);

      await expect(
        PreparacaoUseCases.entregaPedidoUseCase(pedidoGateway, "pedido-008")
      ).rejects.toThrow(PersistenceErrorException);
    });
  });
});
