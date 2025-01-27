import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import {
  DataNotFoundException,
  ValidationErrorException,
} from "../../Core/Types/ExceptionType";
import { PreparacaoUseCases } from "../../Core/Usecase/PreparacaoUseCases";
import { PedidoAdapter } from "../Presenter/PedidoAdapter";

export class PreparacaoController {
  public static async buscarProximoPedido(
    dbConnection: IDbConnection
  ): Promise<PedidoAdapter> {
    try {
      const pedidoGateway = dbConnection.gateways.pedidoGateway;
      const { pedido, mensagem } =
        await PreparacaoUseCases.buscaProximoPedidoUseCase(pedidoGateway);
      if (pedido === undefined) {
        return PedidoAdapter.dataNotFound(mensagem);
      }
      return PedidoAdapter.successPedido(pedido, mensagem);
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        return PedidoAdapter.dataNotFound(error.message);
      }

      if (error instanceof ValidationErrorException) {
        return PedidoAdapter.validateError(error.message);
      }

      return PedidoAdapter.systemError("Erro ao buscar próximo pedido.");
    }
  }

  public static async entregarPedido(
    dbConnection: IDbConnection,
    pedidoId: string
  ): Promise<PedidoAdapter> {
    try {
      if (typeof pedidoId !== "string") {
        return PedidoAdapter.validateError("Id do pedido inválido");
    }
      const pedidoGateway = dbConnection.gateways.pedidoGateway;
      const { pedido, mensagem } =
        await PreparacaoUseCases.entregaPedidoUseCase(pedidoGateway, pedidoId);
      if (pedido === undefined) {
        return PedidoAdapter.dataNotFound(mensagem);
      }
      return PedidoAdapter.successPedido(pedido, mensagem);
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        return PedidoAdapter.dataNotFound(error.message);
      }

      if (error instanceof ValidationErrorException) {
        return PedidoAdapter.validateError(error.message);
      }

      return PedidoAdapter.systemError("Erro ao entregar pedido.");
    }
  }

  public static async iniciarPreparacaoPedido(
    dbConnection: IDbConnection,
    pedidoId: string
  ): Promise<PedidoAdapter> {
    try {
      if (typeof pedidoId !== "string") {
        return PedidoAdapter.validateError("Id do pedido inválido");
    }
      const pedidoGateway = dbConnection.gateways.pedidoGateway;
      const { pedido, mensagem } =
        await PreparacaoUseCases.iniciarPreparacaoPedidoUseCase(pedidoGateway, pedidoId);
      if (pedido === undefined) {
        return PedidoAdapter.dataNotFound(mensagem);
      }
      return PedidoAdapter.successPedido(pedido, mensagem);
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        return PedidoAdapter.dataNotFound(error.message);
      }

      if (error instanceof ValidationErrorException) {
        return PedidoAdapter.validateError(error.message);
      }

      return PedidoAdapter.systemError("Erro ao iniciar preparação do pedido.");
    }
  }
  
  public static async finalizaPreparacao(
    dbConnection: IDbConnection,
    pedidoId: string
  ): Promise<PedidoAdapter> {
    try {
      if (typeof pedidoId !== "string") {
        return PedidoAdapter.validateError("Id do pedido inválido");
    }
      const pedidoGateway = dbConnection.gateways.pedidoGateway;
      const { pedido, mensagem } =
        await PreparacaoUseCases.finalizaPreparacaoUseCase(pedidoGateway, pedidoId);
      if (pedido === undefined) {
        return PedidoAdapter.dataNotFound(mensagem);
      }
      return PedidoAdapter.successPedido(pedido, mensagem);
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        return PedidoAdapter.dataNotFound(error.message);
      }

      if (error instanceof ValidationErrorException) {
        return PedidoAdapter.validateError(error.message);
      }

      return PedidoAdapter.systemError("Erro ao finalizar preparação do pedido.");
    }
  }}
