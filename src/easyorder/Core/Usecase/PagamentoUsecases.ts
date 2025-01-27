import { TransactionEntity } from "../Entity/TransactionEntity";
import { RetornoPagamentoEnum } from "../Entity/ValueObject/RetornoPagamentoEnum";
import { StatusPagamentoEnum } from "../Entity/ValueObject/StatusPagamentoEnum";
import { StatusPedidoEnum, StatusPedidoValueObject } from "../Entity/ValueObject/StatusPedidoValueObject";
import { StatusTransacaoValueObject, StatusTransacaoEnum } from "../Entity/ValueObject/StatusTransacaoValueObject";
import { PedidoGatewayInterface } from "../Interfaces/Gateway/PedidoGatewayInterface";
import { TransactionGatewayInterface } from "../Interfaces/Gateway/TransactionGatewayInterface";
import { PagamentoServiceInterface } from "../Interfaces/Services/PagamentoServiceInterface";
import { PagamentoDTO } from "../Types/dto/PagamentoDTO";

export class PagamentoUsecases {

    public static async ConfirmarPagamentoUsecase(transactionGateway: TransactionGatewayInterface, pedidoGateway: PedidoGatewayInterface, pagamentoService: PagamentoServiceInterface, payload:string): Promise<{ transacao: TransactionEntity | undefined, mensagem: string }> {

        const transactionDTO:PagamentoDTO = await pagamentoService.handlePaymentResponse(payload);

        const transaction = await transactionGateway.buscarTransactionPorId(transactionDTO.id);
        if (transaction === undefined) {
            return { transacao: undefined, mensagem: "Transação não encontrada." };
        }
        const pedido = await pedidoGateway.buscaPedidoPorId(transaction.getIdPedido());
        if (pedido === undefined || pedido === null) {
            return { transacao: undefined, mensagem: "Pedido associado à transação não foi encontrado." };
        }
        if (transaction.getStatusTransacao() === StatusTransacaoEnum.PAGO || transaction.getStatusTransacao() === StatusTransacaoEnum.NEGADO || transaction.getStatusTransacao() === StatusTransacaoEnum.CANCELADO) {
            return { transacao: undefined, mensagem: "Transação já finalizada." };
        }

        if (transactionDTO.status === RetornoPagamentoEnum.APROVADO) {
            transaction.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO));
            transaction.setMsgRetorno(JSON.stringify(payload));
            const transacaoSalva = await transactionGateway.atualizarTransactionsPorId(transactionDTO.id, transaction);
            if (!transacaoSalva) {
                return { transacao: undefined, mensagem: "Erro ao salvar a transação." };
            }
            pedido.setStatusPagamento(StatusPagamentoEnum.PAGO);
            pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO)); 
            await pedidoGateway.salvarPedido(pedido);
            return { transacao:transacaoSalva, mensagem:"Transação confirmada e pedido atualizado" } 
        }

        if (transactionDTO.status === RetornoPagamentoEnum.PENDENTE) {
            return { transacao:transaction, mensagem:"Transação sem alterações" } 
        }

       // TODO: criar os outros casos de tratamento de status de transação - qualquer diferente de approved irá negar
        transaction.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.NEGADO));
        transaction.setMsgRetorno(payload);
        const transacaoSalva = await transactionGateway.atualizarTransactionsPorId(transactionDTO.id, transaction);
        if (!transacaoSalva) {
            return { transacao: undefined, mensagem: "Erro ao salvar a transação." };
        }
        pedido.setStatusPagamento(StatusPagamentoEnum.NEGADO);
        pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO));
        await pedidoGateway.salvarPedido(pedido);
        return { transacao:transacaoSalva, mensagem:"Transação com status diferente de approved - NEGADA e pedido CANCELADO" } 
    }


    public static async ListarTransacoesUsecase (transactionGateway: TransactionGatewayInterface, pedidoGateway: PedidoGatewayInterface, pedidoId: string): Promise<{ transacoes: TransactionEntity[] | undefined, mensagem: string }> {
        const transactions = await transactionGateway.listarTransactionsPorPedido(pedidoId);
        if (transactions === undefined) { 
            return { transacoes: undefined, mensagem: "Não foram encontradas transações para o pedido." };
        }
        return { transacoes: transactions, mensagem: `Sucesso. ${transactions.length} Transações encontrada(s).` };
    }


}