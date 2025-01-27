import { Express } from "express";
import express from "express";
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { ClientesController } from "../../Application/Controller/ClientesController";

export class ApiClientes {

    static start(dbconnection: IDbConnection, app: Express): void {

        app.use(express.json());

        app.post(
            "/cliente/cadastrar",
            async (req, res) => {
                /**
                    #swagger.tags = ['Clientes']
                    #swagger.path = '/cliente/cadastrar'
                    #swagger.method = 'post'
                    #swagger.summary = 'Cadastrar Cliente'
                    #swagger.description = 'Realiza o Cadastro de um novo Cliente com dados fornecidos no corpo da requisição.<br>
                    - Retorna o Id de Cliente como chave para continuidade no Pedido.<br>
                    - Não é permitido o cadastro de mais de um cliente com o mesmo CPF.<br><br>
                    [ Endpoint para integração ao sistema de autoatendimento ]
                    '

                    #swagger.produces = ["application/json"]  
                    #swagger.parameters['body'] = { 
                        in: 'body', 
                        '@schema': { 
                            "required": ["cpf", "nome", "email"], 
                            "properties": { 
                                "cpf": { 
                                    "type": "string", 
                                    "minLength": 11,
                                    "maxLength": 11,
                                    "example": "12345678909"
                                },
                                "nome": { 
                                    "type": "string",
                                    "minLength": 1,
                                    "maxLength": 255,
                                    "example": "Nome de Teste Sobrenome"
                                },
                                "email": { 
                                    "type": "string",
                                    "minLength": 1,
                                    "maxLength": 255,
                                    "example": "teste.email@email.com"
                                }
                            }
                        }
                    }
                    #swagger.responses[200] = {
                        'description': 'Cliente cadastrado com sucesso',
                        '@schema': {
                            'properties': {
                                resultado_cadastro: {
                                    type: 'boolean',
                                    example: true
                                },
                                mensagem: {
                                    type: 'string',
                                    example: 'Cliente cadastrado com sucesso'
                                },
                                cliente: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string',
                                            example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                                        },
                                        nome: {
                                            type: 'string',
                                            example: 'João da Silva'
                                        },
                                        cpf: {
                                            type: 'string',
                                            example: '123.456.789-01'
                                        },
                                        email: {
                                            type: 'string',
                                            example: 'teste@teste.com'
                                        }
                                    }
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
                                    example: 'Erro inesperado: Não foi possível cadastrar o cliente'
                                }
                            }
                        }
                    }
                    #swagger.authorization = {
                        permission: 'public'
                    }
                */
                try {
                    if (req.body === undefined || Object.keys(req.body).length === 0) {
                        throw new Error("Nenhum dado informado.");
                    }
                    const { cpf, nome, email } = req.body;
                    const clientePayload = await ClientesController.CadastrarCliente(dbconnection, cpf, nome, email);
                    res.send(clientePayload); 
                }
                catch (error: any) {
                    res.send(error.message);
                }
            }
        );
        
        app.put(
            "/cliente/atualizar",
            async (req, res) => {
                /**
                    #swagger.tags = ['Clientes']
                    #swagger.path = '/cliente/atualizar'
                    #swagger.method = 'put'
                    #swagger.summary = 'Atualizar Cliente'
                    #swagger.description = 'Atualiza o Cadastro de um Cliente existente, através dos dados fornecidos no corpo da requisição.<br>
                    - Utiliza CPF como chave de identificação, retorna o detalhe do cadastro e Id do Cliente.<br><br>
                    [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                    #swagger.produces = ["application/json"]  
                    #swagger.security = [{
                        "bearerAuth": []
                    }]
                    #swagger.parameters['body'] = { 
                        in: 'body', 
                        '@schema': { 
                            "required": ["cpf", "nome", "email"], 
                            "properties": { 
                                "cpf": { 
                                    "type": "string", 
                                    "minLength": 11,
                                    "maxLength": 11,
                                    "example": "12345678909"
                                },
                                "nome": { 
                                    "type": "string",
                                    "minLength": 1,
                                    "maxLength": 255,
                                    "example": "Nome de Testes Sobrenome Atualizado"
                                },
                                "email": { 
                                    "type": "string",
                                    "minLength": 1,
                                    "maxLength": 255,
                                    "example": "teste-email-novo@email.com"
                                }
                            }
                        }
                    }
                    #swagger.responses[200] = {
                        'description': 'Cliente atualizado com sucesso',
                        '@schema': {
                            'properties': {
                                resultado_atualizacao: {
                                    type: 'boolean',
                                    example: true
                                },
                                mensagem: {
                                    type: 'string',
                                    example: 'Cliente atualizado com sucesso'
                                },
                                cliente: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string',
                                            example: '29a81eeb-d16d-4d6c-a86c-e13597667307'
                                        },
                                        nome: {
                                            type: 'string',
                                            example: 'João da Silva'
                                        },
                                        cpf: {
                                            type: 'string',
                                            example: '123.456.789-01'
                                        },
                                        email: {
                                            type: 'string',
                                            example: 'teste@teste.com'
                                        }
                                    }
                                }
                            }
                        }
                    }`
                    #swagger.responses[400] = {
                        'description': 'Ocorreu um erro inesperado',
                        '@schema': {
                            'properties': {
                                mensagem: {
                                    type: 'string',
                                    example: 'Erro inesperado: Não foi possível atualizar o cliente'
                                }
                            }
                        }
                    }
                */
                try {
                    if (req.body === undefined || Object.keys(req.body).length === 0) {
                        throw new Error("Nenhum dado informado.");
                    }
                    const { cpf, nome, email } = req.body;
                    const clientePayload = await ClientesController.AtualizarClientePorCpf(dbconnection, cpf, nome, email);
                    res.send(clientePayload); 
                }
                catch (error: any) {
                    res.send(error.message);
                }
    
            }
        );
        
        app.get(
            "/cliente/listar",
            async (req, res) => {
                /**
                    #swagger.tags = ['Clientes']
                    #swagger.path = '/cliente/listar'
                    #swagger.method = 'get'
                    #swagger.summary = 'Listar Clientes'
                    #swagger.description = 'Lista todos os clientes cadastrados.<br><br>
                    [ Endpoint para integração ao sistema administrativo ]'
                    #swagger.security = [{
                        "bearerAuth": []
                    }]
                    #swagger.produces = ["application/json"]  
                    #swagger.responses[200] = {
                        'description': 'Clientes listados com sucesso',
                        '@schema': {
                            properties: {
                                mensagem: {
                                    type: 'string',
                                    example: 'Clientes listados com sucesso'
                                },
                                clientes: {
                                    type: 'array',
                                    items: {
                                        properties: {
                                            id: {
                                                type: 'string',
                                                example: '1'
                                            },
                                            cpf: {
                                                type: 'string',
                                                example: '000.000.000-00'
                                            },
                                            nome: {
                                                type: 'string',
                                                example: 'Fulano de Tal'
                                            },
                                            email: {
                                                type: 'string',
                                                example: 'teste@teste.com'
                                            }
                                        }
                                    }
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
                                    example: 'Ocorreu um erro inesperado: Clientes não encontrados.'
                                }
                            }
                        }
                    }
                */
                try {
                    const clientesPayload = await ClientesController.ListarClientes(dbconnection);
                    res.send(clientesPayload); 
                }
                catch (error: any) {
                    res.send(error.message);
                }
            }
        );
        
        app.get(
            "/cliente/buscar/:cpf", 
            async (req, res) => {
                /**
                    #swagger.summary = '[Deprecated] Buscar Cliente'
                    #swagger.description = 'Busca Cliente por CPF.<br>
                    - Retorna detalhe do cadastro, incluindo o Id.<br><br>
                    ! Atenção: Este endpoint foi descontinuado para uso de autenticação via Lambda, no endpoint /cliente/auth/{cpf}<br><br>
                    [ Endpoint para integração ao sistema de autoatendimento ]'
                    #swagger.tags = ['Descontinuadas - Mantidas para Testes Locais']
                    #swagger.path = '/cliente/buscar/{cpf}'
                    #swagger.method = 'get'
                    #swagger.produces = ["application/json"]
                    #swagger.parameters['cpf'] = {
                        in: 'path',
                        description: 'CPF do Cliente sem pontuação',
                        required: true,
                        type: 'string',
                        example: '12345678910'
                    }
                    #swagger.deprecated = true
                */
                try {
                    const cpfBusca: string = req.params.cpf;
                    if (!cpfBusca) {
                        res.status(400).send("Ocorreu um erro inesperado: Parâmetro da busca não enviado.")
                        throw new Error("Erro: CPF não informado no parâmetro da busca.");
                    }
                    const clientePayload = await ClientesController.BuscarClientePorCpf(dbconnection, cpfBusca);
                    res.send(clientePayload); 
                }
                catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        /**
            #swagger.start
            #swagger.summary = '[Novo] Autenticar Cliente'
            #swagger.description = 'Autenticar Cliente via CPF.<br>
            - Retorna o Id do cliente, caso encontrado, como chave para continuidade no Pedido.<br><br>
            [ Endpoint para integração ao sistema de autoatendimento ]'
            #swagger.tags = ['Clientes']
            #swagger.path = '/cliente/auth/{cpf}'
            #swagger.method = 'get'
            #swagger.produces = ["application/json"]
            #swagger.parameters['cpf'] = {
                in: 'path',
                description: 'CPF do Cliente sem pontuação',
                required: true,
                type: 'string',
                example: '12345678910'
            }
            #swagger.end
        */

    }
}


