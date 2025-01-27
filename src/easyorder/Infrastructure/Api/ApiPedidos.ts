import { Express } from "express";
import express from "express";
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PedidoController } from "../../Application/Controller/PedidoController";
import { PedidoAdapter } from "../../Application/Presenter/PedidoAdapter";
import { PagamentoServiceInterface } from "../../Core/Interfaces/Services/PagamentoServiceInterface";
import { ApiResponsePedidos } from './utils/ApiResponsePedidos';

export class ApiPedidos {

    static start(dbconnection: IDbConnection, servicoPagamento: PagamentoServiceInterface, app: Express): void {

        app.use(express.json());

        app.post("/pedido", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido'
                #swagger.method = 'post'
                #swagger.summary = 'Cadastrar Pedido'
                #swagger.description = 'Início (rascunho) de novo Pedido. Retorna um Id de Pedido.<br>
                - Pode considerar cliente identificado com ID (cliente já cadastrado) ou<br>
                - Cliente não identificado (pedido sem associação a cliente)<br><br>
                [ Endpoint para integração ao sistema de autoatendimento ]' 
                #swagger.produces = ["application/json"]
                #swagger.parameters['body'] = { 
                    in: 'body', 
                    '@schema': { 
                        "properties": { 
                            "cliente_identificado": { 
                                "type": "boolean", 
                                "example": "true" 
                            },
                            "clienteId": { 
                                "type": "string", 
                                "minLength": 36, 
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307" 
                            }
                        }
                    }
                }
                #swagger.responses[200] = {
                    'description': 'Pedido cadastrado com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Pedido cadastrado com sucesso'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado.'
                            }
                        }
                    }
                }
            */
            if (req.body === undefined || Object.keys(req.body).length === 0) {
                res.status(400).type('json').send(PedidoAdapter.systemError("Erro: Sem dados no Body da requisição.").dataJsonString);
                return
            }
            const clienteIdentificado: boolean = req.body.cliente_identificado == "true";
            const clienteId: string = req.body.clienteId;
            const pedidoPresenter = await PedidoController.CadastrarPedido(dbconnection, clienteIdentificado, clienteId);

            ApiResponsePedidos.responseJson(pedidoPresenter, res);

        });

        app.get("/pedido/listar/:statusPedido", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/listar/{statusPedido}'
                #swagger.method = 'get'
                #swagger.summary = 'Listar Pedidos por status'
                #swagger.description = 'Lista pedidos por status<br><br>
                [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                #swagger.security = [{
                    "bearerAuth": []
                }]
                #swagger.produces = ["application/json"]
                #swagger.parameters['statusPedido'] = {
                    in: 'path',
                    description: 'Status do pedido',
                    required: true,
                    type: 'string',
                    example: 'RASCUNHO',
                    enum: [
                        'EM_ABERTO',
                        'AGUARDANDO_PAGAMENTO',
                        'RECEBIDO',
                        'EM_PREPARACAO',
                        'PRONTO',
                        'FINALIZADO',
                        'CANCELADO'
                    ]
                }
                #swagger.parameters['page'] = {
                    in: 'query',
                    description: 'Página',
                    required: false,
                    type: 'integer',
                    example: 1,
                    default: 1
                }
                #swagger.parameters['limit'] = {
                    in: 'query',
                    description: 'Limite de registros por página',
                    required: false,
                    type: 'integer',
                    example: 10,
                    default: 10
                }
                #swagger.parameters['orderField'] = {
                    in: 'query',
                    description: 'Campo de ordenação',
                    required: false,
                    type: 'string',
                    example: 'DATA_CADASTRO',
                    default: 'DATA_CADASTRO',
                    enum: [
                        'DATA_CADASTRO',
                    ]
                }
                #swagger.parameters['orderDirection'] = {
                    in: 'query',
                    description: 'Direção da ordenação',
                    required: false,
                    type: 'string',
                    example: 'DESC',
                    default: 'DESC',
                    enum: [
                        'ASC',
                        'DESC'
                    ]
                }
                #swagger.responses[404] = {
                    'description': 'Nenhum pedido encontrado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Nenhum pedido encontrado'
                            },
                            pedidos: {
                                type: 'array',
                                items: {}
                            }
                        }
                    }
                }
                #swagger.responses[200] = {
                    'description': 'Pedidos listados com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Pedidos listados com sucesso'
                            },
                            pedidos: {
                                type: 'array',
                                items: {
                                    $ref: '#/definitions/Pedido'
                                }
                            }
                        }
                    }
                }
            */

            if (req.params.statusPedido === undefined || req.params.statusPedido === "" || req.params.statusPedido === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: Status do pedido não informado."), res);
            }

            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const orderField = req.query.orderField ? req.query.orderField as string : 'DATA_CADASTRO';
            const orderDirection = req.query.orderDirection ? req.query.orderDirection as string : 'DESC';

            const pedidoPresenter = await PedidoController.ListarPedidosPorStatus(
                dbconnection,
                req.params.statusPedido,
                page,
                limit,
                orderField,
                orderDirection
            );

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.get("/pedido/:pedidoId", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/{pedidoId}'
                #swagger.method = 'get'
                #swagger.summary = 'Buscar Pedido'
                #swagger.description = 'Busca um Pedido por ID<br><br>
                [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                #swagger.security = [{
                    "bearerAuth": []
                }]
                #swagger.produces = ["application/json"]
                #swagger.parameters['pedidoId'] = {
                    in: 'path',
                    description: 'ID do pedido',
                    required: true,
                    type: 'string',
                    example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                }
                #swagger.responses[404] = {
                    'description': 'Nenhum pedido encontrado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Nenhum pedido encontrado'
                            }
                        }
                    }
                }
                #swagger.responses[200] = {
                    description: 'Pedido Encontrado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Nenhum pedido encontrado'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                            }
                        }
                    }
                }
            */

            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res);
            }

            const pedidoId = req.params.pedidoId;
            const pedidoPresenter = await PedidoController.BuscaPedidoPorId(dbconnection, pedidoId);

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.put("/pedido/:pedidoId/cancelar", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/{pedidoId}/cancelar'
                #swagger.method = 'put'
                #swagger.summary = 'Cancelar Pedido'
                #swagger.description = 'Cancelamento de um Pedido com base no id.<br><br>
                [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                #swagger.security = [{
                    "bearerAuth": []
                }]
                #swagger.produces = ["application/json"]
            */
            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res);
            }

            const pedidoId = req.params.pedidoId;
            const pedidoPresenter = await PedidoController.CancelarPedido(dbconnection, pedidoId);

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.put("/pedido/:pedidoId/confirmacao-pagamento", async (req, res) => {
            /**
                #swagger.tags = ['Descontinuadas - Mantidas para Testes Locais']
                #swagger.path = '/pedido/{pedidoId}/confirmacao-pagamento'
                #swagger.method = 'put'
                #swagger.deprecated = true
                #swagger.summary = '[Deprecated] Confirmar Pagamento Pedido'
                #swagger.description = 'Baixa manual de um pedido pendente de pagamento.<br>
                - Endpoint exclusivo para testes locais<br><br>
                ! Atenção: Este endpoint foi descontinuado, sendo substituído por /pagamento/webhook<br><br>
                [ Endpoint para integração ao gateway de pagamentos - Externo]'
                #swagger.produces = ["application/json"]
                #swagger.parameters['pedidoId'] = {
                    in: 'path',
                    description: 'ID do pedido',
                    required: true,
                    type: 'string',
                    example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                }
                #swagger.responses[200] = {
                    'description': 'Pedido pago com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Pedido pago com sucesso'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                            }
                        }
                    }
                }
            */

            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res)
            }

            const pedidoId = req.params.pedidoId;
            const pedidoPresenter = await PedidoController.ConfirmarPagamentoPedido(dbconnection, servicoPagamento, pedidoId);

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.put("/pedido/:pedidoId/checkout", async (req, res) => {
            /**
                #swagger.method = 'put'
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/{pedidoId}/checkout'
                #swagger.summary = 'Checkout Pedido'
                #swagger.description = 'Checkout de um pedido e envio para o serviço de Pagamento<br><br>
                [ Endpoint para integração ao sistema de autoatendimento / PDV ]'
                #swagger.produces = ["application/json"]
                #swagger.parameters['pedidoId'] = {
                    in: 'path',
                    description: 'ID do pedido',
                    required: true,
                    type: 'string',
                    example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                }
                #swagger.responses[200] = {
                    'description': 'Pedido fechado com sucesso. Aguardando pagamento.',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Pedido fechado com sucesso. Aguardando pagamento.'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                            }
                        }
                    }
                }
            */

            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res)
            }

            const pedidoId = req.params.pedidoId;
            const pedidoPresenter = await PedidoController.CheckoutPedido(dbconnection, servicoPagamento, pedidoId);

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.post("/pedido/:pedidoId/combo", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/{pedidoId}/combo'
                #swagger.method = 'post'
                #swagger.summary = 'Adicionar Combo ao Pedido'
                #swagger.description = 'Adiciona um Combo ao Pedido. Precisa de um Produto válido associado ao Combo.<br><br>
                [ Endpoint para integração ao sistema de autoatendimento ]'
                #swagger.produces = ["application/json"]
                #swagger.parameters['pedidoId'] = {
                    in: 'path',
                    description: 'ID do pedido',
                    required: true,
                    type: 'string',
                    example: '228ec10e-5675-47f4-ba1f-2c4932fe68cc'
                }
                #swagger.parameters['body'] = { 
                    in: 'body', 
                    '@schema': { 
                        "required": ["lancheId", "bebidaId", "sobremesaId", "acompanhamentoId"],
                        "properties": { 
                            "lancheId": { 
                                "type": "string",
                                "minLength": 36,
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307"
                            },
                            "bebidaId": { 
                                "type": "string",
                                "minLength": 36,
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307"
                            },
                            "sobremesaId": { 
                                "type": "string",
                                "minLength": 36,
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307"
                            },
                            "acompanhamentoId": { 
                                "type": "string",
                                "minLength": 36,
                                "maxLength": 36,
                                "format": "uuid",
                                "example": "29a81eeb-d16d-4d6c-a86c-e13597667307"
                            },
                        }
                    }
                }
                #swagger.responses[200] = {
                    description: 'Combo adicionado ao pedido com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Combo adicionado ao pedido com sucesso'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                            }
                        }
                    }
                }
            */

            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res)
            }

            if (req.body === undefined || Object.keys(req.body).length === 0) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: Sem dados no Body da requisição."), res);
            }

            const pedidoId = req.params.pedidoId;
            const lancheId = req.body.lancheId;
            const bebidaId = req.body.bebidaId;
            const sobremesaId = req.body.sobremesaId;
            const acompanhamentoId = req.body.acompanhamentoId;

            const pedidoPresenter = await PedidoController.AdicionarComboAoPedido(
                dbconnection,
                pedidoId,
                lancheId,
                bebidaId,
                sobremesaId,
                acompanhamentoId
            );

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });

        app.delete("/pedido/:pedidoId/combo/:comboId", async (req, res) => {
            /**
                #swagger.tags = ['Pedidos']
                #swagger.path = '/pedido/{pedidoId}/combo/{comboId}'
                #swagger.method = 'delete'
                #swagger.summary = 'Remover Combo do Pedido'
                #swagger.description = 'Remove um Combo do Pedido<br><br>
                [ Endpoint para integração ao sistema de autoatendimento ]'
                #swagger.produces = ["application/json"]
                #swagger.parameters['pedidoId'] = {
                    in: 'path',
                    description: 'ID do pedido',
                    required: true,
                    type: 'string',
                    example: '228ec10e-5675-47f4-ba1f-2c4932fe68cc'
                }
                #swagger.parameters['comboId'] = {
                    in: 'path',
                    description: 'ID do combo',
                    required: true,
                    type: 'string',
                    example: '228ec10e-5675-47f4-ba1f-2c4932fe68cc'
                }
                #swagger.responses[200] = {
                    description: 'Combo removido do pedido com sucesso',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Combo removido do pedido com sucesso'
                            },
                            pedido: {
                                $ref: '#/definitions/Pedido'
                            }
                        }
                    }
                }
                #swagger.responses[400] = {
                    'description': 'Ocorreu um erro inesperado',
                    '@schema': {
                        'properties': {
                            mensagem: {
                                type: 'string',
                                example: 'Ocorreu um erro inesperado: Pedido não encontrado'
                            }
                        }
                    }
                }
            */

            if (req.params.pedidoId === undefined || req.params.pedidoId === "" || req.params.pedidoId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do pedido não informado."), res)
            }

            if (req.params.comboId === undefined || req.params.comboId === "" || req.params.comboId === null) {
                ApiResponsePedidos.responseJson(PedidoAdapter.validateError("Erro: ID do combo não informado."), res)
            }

            const pedidoId = req.params.pedidoId;
            const comboId = req.params.comboId;

            const pedidoPresenter = await PedidoController.RemoverComboDoPedido(
                dbconnection,
                pedidoId,
                comboId
            );

            ApiResponsePedidos.responseJson(pedidoPresenter, res);
        });
    }
}
