import { PedidoEntity } from "../Entity/PedidoEntity";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../Entity/ValueObject/StatusPedidoValueObject";
import {
  PedidoGatewayInterface,
  PedidoGatewayInterfaceFilterOrderDirection,
  PedidoGatewayInterfaceFilterOrderField,
} from "../Interfaces/Gateway/PedidoGatewayInterface";
import {
  DataNotFoundException,
  PersistenceErrorException,
  ValidationErrorException,
} from "../Types/ExceptionType";
import { PedidoResponseUseCase } from "../Types/Responses";

export class PreparacaoUseCases {
  public static async iniciarPreparacaoPedidoUseCase(
    pedidoGateway: PedidoGatewayInterface,
    pedidoId: string
  ): Promise<{ pedido: PedidoEntity; mensagem: string }> {
    const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

    if (!pedido) {
      throw new DataNotFoundException("Pedido não encontrado: " + pedidoId);
    }

    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO)
    );

    const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

    if (!pedidoSalvo) {
      throw new ValidationErrorException("Erro ao salvar pedido");
    }

    return {
      pedido: pedidoSalvo,
      mensagem: "Preparação do pedido iniciada com sucesso",
    };
  }

  public static async buscaProximoPedidoUseCase(
    pedidoGateway: PedidoGatewayInterface
  ): Promise<{ pedido: PedidoEntity | undefined; mensagem: string }> {
    const pedidos = await pedidoGateway.listarPedidosPorStatus(
      new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO),
      {
        page: 1,
        limit: 1,
        orderField: PedidoGatewayInterfaceFilterOrderField.DATA_CADASTRO,
        orderDirection: PedidoGatewayInterfaceFilterOrderDirection.ASC,
      }
    );

    if (!pedidos) {
      throw new Error("Erro ao listar pedidos");
    }

    if (!pedidos.length) {
      return { pedido: undefined, mensagem: "Nenhum pedido encontrado" };
    }

    return { pedido: pedidos[0], mensagem: "Pedido encontrado" };
  }

  public static async finalizaPreparacaoUseCase(
    pedidoGateway: PedidoGatewayInterface,
    pedidoId: string
  ): Promise<{ pedido: PedidoEntity | undefined; mensagem: string }> {
    const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

    if (!pedido) {
      throw new DataNotFoundException("Pedido não encontrado");
    }

    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.PRONTO)
    );

    const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

    if (!pedidoSalvo) {
      throw new PersistenceErrorException("Erro ao salvar pedido");
    }

    return {
      pedido: pedidoSalvo,
      mensagem: "Preparação do pedido finalizada com sucesso",
    };
  }

  public static async entregaPedidoUseCase(
    pedidoGateway: PedidoGatewayInterface,
    pedidoId: string
  ): Promise<{ pedido: PedidoEntity | undefined; mensagem: string }> {
    const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

    if (!pedido) {
      throw new DataNotFoundException("Pedido não encontrado");
    }

    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.FINALIZADO)
    );

    const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

    if (!pedidoSalvo) {
      throw new PersistenceErrorException("Erro ao salvar pedido");
    }

    return {
      pedido: pedidoSalvo,
      mensagem: "Pedido entregue com sucesso",
    };
  }
}
