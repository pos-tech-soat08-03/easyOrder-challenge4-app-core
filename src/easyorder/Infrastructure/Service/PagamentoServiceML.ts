import { TransactionEntity } from "../../Core/Entity/TransactionEntity";
import { StatusTransacaoValueObject, StatusTransacaoEnum } from "../../Core/Entity/ValueObject/StatusTransacaoValueObject";
import { PagamentoServiceInterface } from "../../Core/Interfaces/Services/PagamentoServiceInterface";
import { PagamentoDTO } from '../../Core/Types/dto/PagamentoDTO';
import { RetornoPagamentoEnum } from '../../Core/Entity/ValueObject/RetornoPagamentoEnum';
import { parse } from "path";

export class PagamentoServiceML implements PagamentoServiceInterface {

    constructor() {
    }
    
    async processPayment (transaction: TransactionEntity): Promise <TransactionEntity> {
        // Utilizando QRCode Modelo Dinamico ML
        // Documentacao geral https://www.mercadopago.com.br/developers/pt/docs/qr-code/integration-configuration/qr-dynamic/integration
        // Referencia API https://www.mercadopago.com.br/developers/pt/reference/qr-dynamic/_instore_orders_qr_seller_collectors_user_id_pos_external_pos_id_qrs/post

        const ML_USER_ID = process.env.ML_USER_ID || '';
        const ML_POS_ID = process.env.ML_POS_ID || '';
        const ML_ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN || '';
        const NGROK_URL = process.env.NGROK_URL || '';

        if (transaction.getStatusTransacao() === StatusTransacaoEnum.PENDENTE) {
            
            transaction.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO));

            const bodyChamada = JSON.stringify({
                external_reference: transaction.getIdTransacao(),
                title: 'Pagamento pedido: ' + transaction.getIdPedido(),
                description: 'Pagamento pedido ' + transaction.getIdPedido() + ' no valor de R$ ' + transaction.getValorTransacao() + ' transação ' + transaction.getIdTransacao(),
                notification_url: "https://06cf-179-98-8-98.ngrok-free.app/pagamento/webhook/ml",
                total_amount: transaction.getValorTransacao(),
                "items": [
                    {
                      "sku_number": "A123K9191938",
                      "category": "marketplace",
                      "title": "easyOrder",
                      "description": "easyOrder",
                      "unit_price": transaction.getValorTransacao(),
                      "quantity": 1,
                      "unit_measure": "unit",
                      "total_amount": transaction.getValorTransacao()
                    }
                  ],
                  "cash_out": {
                    "amount": 0
                  }
            });
            //console.log("****************************** BODY CHAMADA: ", bodyChamada);
            const response = await fetch(`https://api.mercadopago.com/instore/orders/qr/seller/collectors/2018827962/pos/SUC001POS001/qrs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer APP_USR-3044895488797945-101514-0d9fcdc00bf3a365654b3785654d189e-2018827962`
                },
                body: bodyChamada
            });
            const data = await response.json();
            // console.log("****************************** DATA: ", data);
            transaction.setHash_EMVCo(JSON.stringify(data));
            transaction.setMsgEnvio(JSON.stringify(bodyChamada));
        }
        return transaction;
    }
    
    async handlePaymentResponse (payload: string): Promise <PagamentoDTO> {

        // const ML_ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN || '';
        try {
            payload = JSON.stringify(payload);
            const parsedPayload = JSON.parse(payload);
            
            if (parsedPayload.topic === "merchant_order") {

                const resource = parsedPayload.resource;
                const confirmation = await fetch(`${resource}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer APP_USR-3044895488797945-101514-0d9fcdc00bf3a365654b3785654d189e-2018827962`
                    }
                });
                
                let data = await confirmation.json();

                // console.log("****************************** DATA: ", data);

                const dataTemp = JSON.stringify(data);
                const parsedData = JSON.parse(dataTemp);

                if (parsedData.order_status !== "payment_required") {

                    const transactionId = parsedData.external_reference;
                    // console.log("****************************** transactionId: ", transactionId);
                    const receivedStatus = parsedData.payments[0].status;
                    // console.log("****************************** receivedStatus: ", receivedStatus);

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
            }

            const defaultPagamentoDto: PagamentoDTO = {
                id: "",
                status: RetornoPagamentoEnum.PENDENTE,
                payload: ""
            };
            return defaultPagamentoDto;

        } 
        catch (error: any) {
            throw new Error("Erro parsing transaction");
        }

    }
    
}