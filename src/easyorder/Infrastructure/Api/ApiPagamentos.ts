import { Express } from 'express';
import express from 'express';
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PagamentosController } from '../../Application/Controller/PagamentosController';
import { PagamentoServiceInterface } from '../../Core/Interfaces/Services/PagamentoServiceInterface';
import { PagamentoDTO } from '../../Core/Types/dto/PagamentoDTO';

export class ApiPagamentos {

    static start(dbconnection: IDbConnection, servicoPagamento: PagamentoServiceInterface, app: Express): void {

        app.use(express.json());

        app.post("/pagamento/webhook/", async (req, res) => {
            /**
                #swagger.tags = ['Pagamentos']
                #swagger.path = '/pagamento/webhook/'
                #swagger.method = 'post'
                #swagger.summary = 'Webhook para Confirmação de Pagamento (Transação)'
                #swagger.description = 'Captura o retorno de status de transação a partir de webhook disparado pelo Serviço de Pagamento.<br>
                - Pode ser utilizado para simulação, nesse caso informe o id e status de aprovação no corpo da requisição<br><br>
                [ Endpoint para integração ao gateway de pagamentos - Externo]'
                #swagger.produces = ["application/json"]  
                #swagger.parameters['body'] = { 
                    in: 'body', 
                    '@schema': { 
                        "required": ["id", "status"], 
                        "properties": { 
                            "id": { 
                                "type": "string", 
                                "minLength": 36, 
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307" 
                            },
                            "status": { 
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 255,
                                "example": "approved"
                            }
                        }
                    }
                }
                
            */
            try {

                if (req.body === undefined || Object.keys(req.body).length === 0) {
                    throw new Error("Sem dados de body na requisição")
                }
                if (req.body.id === undefined || req.body.id === "" || req.body.id === null) {
                    throw new Error("Transação ID não informada no body")
                }
                if (req.body.status === undefined || req.body.status === "" || req.body.status === null) {
                    throw new Error("Status de Retorno da Transação não informado no body")
                }
                const payload = req.body;
                const pagamentoPayload = await PagamentosController.ConfirmarPagamento(dbconnection, servicoPagamento, payload);
                res.send(pagamentoPayload);
            }
            catch (error: any) {
                res.status(400).send(error.message);
            }
        });

        app.get("/pagamento/listar-transacoes/:pedidoId", async (req, res) => {
            /**
                #swagger.tags = ['Pagamentos']
                #swagger.path = '/pagamento/listar-transacoes/{pedidoId}'
                #swagger.method = 'get'
                #swagger.summary = 'Listar Transações'
                #swagger.description = 'Obtém a lista de Transações associadas a um id de Pedido.<br>
                - Utilizada para fins de simulação e consulta de transações pela adninistração.<br><br>
                [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                #swagger.produces = ["application/json"]  
                #swagger.security = [{
                    "bearerAuth": []
                }]
            */
            try {
                if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                    throw new Error("Pedido ID não informado para a busca")
                }
                const pedidoId = req.params.pedidoId;
                const transacoesPayload = await PagamentosController.ListarTransacoes(dbconnection, pedidoId);
                res.send(transacoesPayload);
            }
            catch (error: any) {
                res.status(400).send(error.message);
            }
        });

        // app.post("/pagamento/webhook/ml", async (req, res) => {
        //     // Referencia de formato de retorno https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
        //     try {

        //         if (req.body === undefined || Object.keys(req.body).length === 0) {
        //             throw new Error("Sem dados de body na requisição")
        //         }
        //         const payload = req.body;
        //         const pagamentoPayload = await PagamentosController.ConfirmarPagamento(dbconnection, servicoPagamento, payload);
        //         res.send(pagamentoPayload);
        //     }
        //     catch (error: any) {
        //         res.status(400).send(error.message);
        //     }
        // });
        

    }
}