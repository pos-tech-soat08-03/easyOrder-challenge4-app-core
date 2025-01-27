import express, { Express, Request, Response } from "express";
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { PreparacaoController } from "../../Application/Controller/PreparacaoController";
import { ApiResponsePedidos } from "./utils/ApiResponsePedidos";
import { PedidoAdapter } from "../../Application/Presenter/PedidoAdapter";

export class ApiPreparacao {
  static start(dbconnection: IDbConnection, app: Express): void {
    app.use(express.json());

    // Contexto de preparação
    app.get(
      "/preparacao/pedido/proximo",
      async (req: Request, res: Response) => {
        /**
            #swagger.tags = ['Preparação']
            #swagger.path = '/preparacao/pedido/proximo'
            #swagger.method = 'get'
            #swagger.summary = 'Buscar o próximo Pedido'
            #swagger.description = 'Busca o próximo pedido para preparação<br><br>
            [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
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
                'description': 'Pedido encontrado',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Pedido encontrado'
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
        const pedidoPresenter = await PreparacaoController.buscarProximoPedido(
          dbconnection
        );

        ApiResponsePedidos.responseJson(pedidoPresenter, res);
      }
    );
    app.put(
      "/preparacao/pedido/:pedidoId/iniciar-preparacao",
      async (req: Request, res: Response) => {
        /**
            #swagger.tags = ['Preparação']
            #swagger.path = '/preparacao/pedido/{pedidoId}/iniciar-preparacao'
            #swagger.method = 'put'
            #swagger.summary = 'Iniciar Preparação de Pedido'
            #swagger.description = 'Inicia a preparação de um pedido<br><br>
            [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['pedidoId'] = {
                in: 'path',
                description: 'ID do pedido',
                required: true,
                type: 'string',
                example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
            }
            #swagger.responses[200] = {
                'description': 'Preparação do pedido iniciada com sucesso',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Preparação do pedido iniciada com sucesso'
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
        if (
          req.params.pedidoId === undefined ||
          req.params.pedidoId === "" ||
          req.params.pedidoId === null
        ) {
          ApiResponsePedidos.responseJson(
            PedidoAdapter.validateError("Erro: ID do pedido não informado."),
            res
          );
        }
        const pedidoId = req.params.pedidoId;
        const pedidoPresenter =
          await PreparacaoController.iniciarPreparacaoPedido(
            dbconnection,
            pedidoId
          );

        ApiResponsePedidos.responseJson(pedidoPresenter, res);
      }
    );
    app.put(
      "/preparacao/pedido/:pedidoId/finalizar-preparacao",
      async (req: Request, res: Response) => {
        /**
            #swagger.tags = ['Preparação']
            #swagger.path = '/preparacao/pedido/{pedidoId}/finalizar-preparacao'
            #swagger.method = 'put'
            #swagger.summary = 'Finalizar Preparação de Pedido'
            #swagger.description = 'Finaliza a preparação de um pedido<br><br>
            [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['pedidoId'] = {
                in: 'path',
                description: 'ID do pedido',
                required: true,
                type: 'string',
                example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
            }
            #swagger.responses[200] = {
                'description': 'Preparação do pedido finalizada com sucesso',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Preparação do pedido finalizada com sucesso'
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
        if (
          req.params.pedidoId === undefined ||
          req.params.pedidoId === "" ||
          req.params.pedidoId === null
        ) {
          ApiResponsePedidos.responseJson(
            PedidoAdapter.validateError("Erro: ID do pedido não informado."),
            res
          );
        }
        const pedidoId = req.params.pedidoId;
        const pedidoPresenter = await PreparacaoController.finalizaPreparacao(
          dbconnection,
          pedidoId
        );

        ApiResponsePedidos.responseJson(pedidoPresenter, res);
      }
    );
    app.put(
      "/preparacao/pedido/:pedidoId/entregar",
      async (req: Request, res: Response) => {
        /**
            #swagger.tags = ['Preparação']
            #swagger.path = '/preparacao/pedido/{pedidoId}/entregar'
            #swagger.method = 'put'
            #swagger.summary = 'Entregar Pedido'
            #swagger.description = 'Entrega um pedido preparado<br><br>
            [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['pedidoId'] = {
                in: 'path',
                description: 'ID do pedido',
                required: true,
                type: 'string',
                example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
            }
            #swagger.responses[200] = {
                'description': 'Pedido entregue com sucesso.',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Pedido entregue com sucesso.'
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
        if (
          req.params.pedidoId === undefined ||
          req.params.pedidoId === "" ||
          req.params.pedidoId === null
        ) {
          ApiResponsePedidos.responseJson(
            PedidoAdapter.validateError("Erro: ID do pedido não informado."),
            res
          );
        }
        const pedidoId = req.params.pedidoId;
        const pedidoPresenter = await PreparacaoController.entregarPedido(
          dbconnection,
          pedidoId
        );

        ApiResponsePedidos.responseJson(pedidoPresenter, res);
      }
    );
  }
}
