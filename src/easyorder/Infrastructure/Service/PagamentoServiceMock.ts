import { TransactionEntity } from "../../Core/Entity/TransactionEntity";
import { StatusTransacaoValueObject, StatusTransacaoEnum } from "../../Core/Entity/ValueObject/StatusTransacaoValueObject";
import { PagamentoServiceInterface } from "../../Core/Interfaces/Services/PagamentoServiceInterface";
import { PagamentoDTO } from '../../Core/Types/dto/PagamentoDTO';
import { RetornoPagamentoEnum } from '../../Core/Entity/ValueObject/RetornoPagamentoEnum';
import { json } from "sequelize";

export class PagamentoServiceMock implements PagamentoServiceInterface {

    constructor() {
    }
    
    async processPayment (transaction: TransactionEntity): Promise <TransactionEntity> {
        if (transaction.getStatusTransacao() === StatusTransacaoEnum.PENDENTE) {
            transaction.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO));
            transaction.setMsgEnvio(
                JSON.stringify({
                    idTransacao: transaction.getIdTransacao(),
                    idPedido: transaction.getIdPedido(),
                    valorTransacao: transaction.getValorTransacao(),
                    dataCriacaoTransacao: transaction.getDataCriacaoTransacao().toISOString(),
                    dataEnvioTransacao: new Date().toISOString(),
                    statusTransacao: StatusTransacaoEnum.EM_PROCESSAMENTO
                })
            );
            transaction.setHash_EMVCo("MOCK####021243650016COM.MERCADOLIBRE02013063638f1192a-5fd1-4180-a180-8bcae3556bc35204000053039865802BR5925IZABEL AAAA DE MELO6007BARUERI62070503***63040B6D");
        }
        return transaction;
    }
    
    async handlePaymentResponse (payload: string): Promise <PagamentoDTO> {
        try {
            
            console.log("PAYLOAD RECEIVED (WEBHOOK): ", JSON.stringify(payload));
            payload = JSON.stringify(payload);
            const parsedPayload = JSON.parse(payload);

            const transactionId = parsedPayload.id;
            const receivedStatus = parsedPayload.status;
            let transactionStatus: RetornoPagamentoEnum;

            if (receivedStatus === "approved") transactionStatus = RetornoPagamentoEnum.APROVADO;
            else if (receivedStatus === "denied") transactionStatus = RetornoPagamentoEnum.NEGADO;
            else transactionStatus = RetornoPagamentoEnum.PENDENTE; 

            const pagamentoDto: PagamentoDTO = {
                id: transactionId,
                status: transactionStatus,
                payload: parsedPayload
            };
            
            return pagamentoDto;
        } 
        catch (error: any) {
            throw new Error("Erro parsing transaction: "+error.message);
        }

    }
    
}