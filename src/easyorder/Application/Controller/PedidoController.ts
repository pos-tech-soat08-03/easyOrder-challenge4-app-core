import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PagamentoServiceInterface } from "../../Core/Interfaces/Services/PagamentoServiceInterface";
import { DataNotFoundException, ValidationErrorException } from "../../Core/Types/ExceptionType";
import { PedidoUsecases } from "../../Core/Usecase/PedidoUsecases";
import { PedidoAdapter } from "../Presenter/PedidoAdapter";

export class PedidoController {

    public static async CadastrarPedido(
        dbConnection: IDbConnection,
        clienteIdentificado: boolean,
        clienteId: string,
    ): Promise<PedidoAdapter> {
        try {
            if (typeof clienteId !== "string") {
                return PedidoAdapter.validateError("Falha ao criar pedido");
            }

            if (typeof clienteIdentificado !== "boolean") {
                return PedidoAdapter.validateError("Falha ao criar pedido");
            }

            const response = await PedidoUsecases.CadastrarPedido(
                clienteId ? clienteId : undefined,
                dbConnection.gateways.pedidoGateway,
            );

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);

        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound("Erro ao cadastrar pedido.");
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError("Erro ao cadastrar pedido.");
            }

            return PedidoAdapter.systemError("Erro ao cadastrar pedido.");
        }
    }

    public static async ListarPedidosPorStatus(
        dbConnection: IDbConnection,
        statusPedido: string,
        page: number,
        limit: number,
        orderField: string,
        orderDirection: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;

            const response = await PedidoUsecases.ListarPedidosPorStatus(
                pedidoGateway,
                statusPedido,
                page,
                limit,
                orderField,
                orderDirection
            );

            return PedidoAdapter.successPedidos(response.pedidos, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao listar pedido.");
        }
    }

    public static async BuscaPedidoPorId(
        dbConnection: IDbConnection,
        pedidoId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;

            const response = await PedidoUsecases.BuscaPedidoPorId(pedidoGateway, pedidoId);

            if (!response.pedido) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao buscar pedido.");
        }
    }

    public static async CancelarPedido(
        dbConnection: IDbConnection,
        pedidoId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;

            const response = await PedidoUsecases.CancelarPedido(pedidoGateway, pedidoId);

            if (!response.pedido) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao cancelar pedido.");
        }
    }

    public static async ConfirmarPagamentoPedido(
        dbConnection: IDbConnection,
        servicoPagamento: PagamentoServiceInterface,
        pedidoId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;
            const transactionGateway = dbConnection.gateways.transactionGateway;

            const response = await PedidoUsecases.ConfirmarPagamentoPedido(pedidoGateway, pedidoId);

            if (!response.pedido) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao finalizar pedido.");
        }
    }

    public static async CheckoutPedido(
        dbConnection: IDbConnection,
        servicoPagamento: PagamentoServiceInterface,
        pedidoId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;
            const transactionGateway = dbConnection.gateways.transactionGateway;

            const response = await PedidoUsecases.CheckoutPedido(pedidoGateway, transactionGateway, servicoPagamento, pedidoId);

            if (!response) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);

        } catch (error: any) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }
            console.log("Erro encontrado: "+error.message);
            return PedidoAdapter.systemError("Erro ao Checkout pedido.");
        }

    }

    public static async AdicionarComboAoPedido(
        dbConnection: IDbConnection,
        pedidoId: string,
        lancheId: string,
        bebidaId: string,
        sobremesaId: string,
        acompanhamentoId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;
            const produtoGateway = dbConnection.gateways.produtoGateway;

            const response = await PedidoUsecases.AdicionarComboAoPedido(
                pedidoGateway,
                produtoGateway,
                pedidoId,
                lancheId,
                bebidaId,
                sobremesaId,
                acompanhamentoId
            );

            if (!response.pedido) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao adicionar combo ao pedido.");
        }
    }

    public static async RemoverComboDoPedido(
        dbConnection: IDbConnection,
        pedidoId: string,
        comboId: string,
    ): Promise<PedidoAdapter> {
        try {
            const pedidoGateway = dbConnection.gateways.pedidoGateway;

            const response = await PedidoUsecases.RemoverComboDoPedido(pedidoGateway, pedidoId, comboId);

            if (!response.pedido) {
                throw new DataNotFoundException("Pedido não encontrado.");
            }

            return PedidoAdapter.successPedido(response.pedido, response.mensagem);
        } catch (error) {
            if (error instanceof DataNotFoundException) {
                return PedidoAdapter.dataNotFound(error.message);
            }

            if (error instanceof ValidationErrorException) {
                return PedidoAdapter.validateError(error.message);
            }

            return PedidoAdapter.systemError("Erro ao remover combo do pedido.");
        }
    }

}