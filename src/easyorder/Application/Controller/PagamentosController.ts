import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PagamentoServiceInterface } from "../../Core/Interfaces/Services/PagamentoServiceInterface";
import { PagamentoDTO } from "../../Core/Types/dto/PagamentoDTO";
import { PagamentoUsecases } from "../../Core/Usecase/PagamentoUsecases";
import { PagamentoAdapter } from "../Presenter/PagamentoAdapter";

export class PagamentosController {

    public static async ConfirmarPagamento (dbConnection: IDbConnection, servicoPagamento: PagamentoServiceInterface, payload:string): Promise<string> {
        const transactionGateway = dbConnection.gateways.transactionGateway;
        const pedidoGateway = dbConnection.gateways.pedidoGateway;
        const { transacao, mensagem }  = await PagamentoUsecases.ConfirmarPagamentoUsecase(transactionGateway, pedidoGateway, servicoPagamento, payload);
        if (transacao === undefined) {
            return PagamentoAdapter.adaptPagamentoJsonError(mensagem);
        }
        return PagamentoAdapter.adaptJsonTransacao(transacao, mensagem); 
    }

    public static async ListarTransacoes (dbConnection: IDbConnection, idPedido: string): Promise<string> {
        const transactionGateway = dbConnection.gateways.transactionGateway;
        const pedidoGateway = dbConnection.gateways.pedidoGateway;
        const { transacoes, mensagem }  = await PagamentoUsecases.ListarTransacoesUsecase(transactionGateway, pedidoGateway, idPedido);
        if (transacoes === undefined) {
            return PagamentoAdapter.adaptPagamentoJsonError(mensagem);
        }
        return PagamentoAdapter.adaptJsonListaTransacoes(transacoes, mensagem); 
    }


}