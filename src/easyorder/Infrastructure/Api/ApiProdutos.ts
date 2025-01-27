import express, { Request, Response, Express } from "express";
import { ProdutoController } from "../../Application/Controller/ProdutoController";
import { CategoriaEnum } from "../../Core/Entity/ValueObject/CategoriaEnum";
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";

export class ApiProdutos {

    static start(dbconnection: IDbConnection, app: Express): void {

        app.use(express.json());

        app.get(
            "/produto/listar",
            async (req: Request, res: Response) => {
                /**
        #swagger.tags = ['Produtos']
        #swagger.path = '/produto/listar'
        #swagger.method = 'get'
        #swagger.summary = 'Listar Produtos'
        #swagger.description = 'Lista todos os produtos cadastrados<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
        #swagger.produces = ["application/json"]  
        #swagger.security = [{
            "bearerAuth": []
        }]
    */
                /**
           #swagger.response[200] = {
           'description': 'Produtos listados com sucesso',
               '@type': 'Array',
               'items': {
                   '$ref': '#/definitions/Produto'
               }
           }
        */
                try {
                    const produtoPayload = await ProdutoController.listarProdutos(dbconnection);
                    res.send(produtoPayload);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        app.get(
            "/produto/buscar/:id",
            async (req: Request<{ id: string }>, res: Response) => {
                /**
            #swagger.summary = 'Buscar Produto'
            #swagger.description = 'Busca um produto utilizando o Id.<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/buscar/{id}'
            #swagger.method = 'get'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'ID do produto',
                required: true,
                type: 'string',
                example: '5e73a938-41e7-4b76-a5a0-ae6147266e72'
            }
        */
                /**
                                            #swagger.responses[200] = {
                                                'description': 'Produto localizado:',
                                                '@schema': {
                                                    'properties': {
                                                        resultado_busca: {
                                                            type: 'boolean',
                                                            example: true
                                                        },
                                                        mensagem: {
                                                            type: 'string',
                                                            example: 'Produto localizado:'
                                                        },
                                                        produto: {
                                                            type: 'object',
                                                            properties: {
                                                                "id": { 
                                                                "type": "string", 
                                                                "example": "5e73a938-41e7-4b76-a5a0-ae6147266e72"
                                                            },
                                                                "nome": { 
                                                                    "type": "string",
                                                                    "example": "X-Bacon"
                                                                },
                                                                "preco": { 
                                                                    "type": "number",
                                                                    "example": "20"
                                                                },
                                                                "categoria": {
                                                                    "type": "string",
                                                                    "example": "Lanche"
                                                            }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        */
                /**
#swagger.responses[404] = {
'description': 'Produto não encontrado',
'@schema': {
    'properties': {
    resultado_busca: {
    type: 'boolean',
    example: false
    },
        mensagem: {
            type: 'string',
            example: 'Produto não encontrado'
        }
                                    }
    }
}
}
*/
                try {
                    const id = req.params.id;
                    if (!id) {
                        res.status(400).send("ID inválido.");
                        throw new Error("Erro: ID não informado no parâmetro da busca.");
                    }
                    const produtoPayload = await ProdutoController.buscarProdutoPorId(dbconnection, id);
                    res.send(produtoPayload);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        app.get(
            "/produto/listar/:categoria",
                /**
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/listar/{categoria}'
            #swagger.method = 'get'
            #swagger.summary = 'Listar Produtos por Categoria'
            #swagger.description = 'Lista produtos por categoria<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['categoria'] = {
                in: 'path',
                description: 'ID da Categoria',
                required: true,
                type: 'string',
                example: 'LANCHE'
            }
            }
        */  
            async (req: Request<{ categoria: string }>, res: Response) => {
                try {
                    const categoria: string = req.params.categoria;
                    if (!(categoria.toUpperCase() in CategoriaEnum)) {
                        res.status(400).send("Categoria inválida");
                        throw new Error("Erro: Categoria não informado no parâmetro da busca.");
                    }

                    const produtoPayload = await ProdutoController.listarProdutoPorCategoria(
                        dbconnection,
                        CategoriaEnum[categoria.toUpperCase() as keyof typeof CategoriaEnum]
                    );
                    res.send(produtoPayload);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        app.delete(
            "/produto/remover/:id",
            async (req: Request<{ id: string }>, res: Response) => {
                /**
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/remover/{id}'
            #swagger.method = 'delete'
            #swagger.summary = 'Remover Produto'
            #swagger.description = 'Remove um produto, por Id.<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'ID do produto',
                required: true,
                type: 'string',
                example: '228ec10e-5675-47f4-ba1f-2c4932fe68cc'
            }
            }
        */
                try {
                    const id: string = req.params.id;
                    if (!id) {
                        res.status(400).send("ID inválido.");
                        throw new Error("Erro: ID não informado no parâmetro da busca.");
                    }
                    const produtoRemovido = await ProdutoController.removerProdutoPorId(dbconnection, id);
                    res.send(produtoRemovido);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        app.post(
            "/produto/cadastrar",
            async (req: Request, res: Response) => {
                /**
                #swagger.tags = ['Produtos']
                #swagger.path = '/produto/cadastrar'
                #swagger.method = 'post'
                #swagger.summary = 'Cadastrar Produto'
                #swagger.description = 'Realiza o Cadastro de um Novo Produto, através dos dados fornecidos no corpo da requisição.<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
                #swagger.produces = ["application/json"]  
                #swagger.security = [{
                    "bearerAuth": []
                }]
                #swagger.parameters['body'] = { 
                    in: 'body', 
                    '@schema': {  
                        "properties": { 
                            "nome": { 
                                "type": "string", 
                                "example": "X-Salada"
                            },
                            "descricao": { 
                                "type": "string",
                                "example": "sem salada, sem tomate"
                            },
                            "preco": { 
                                "type": "number",
                                "example": "25"
                            },
                            "imagemURL": {
                                "type": "string",
                                "example": "xsalada.png"
                            },
                            "categoria": {
                                "type": "string",
                                "example": "LANCHE"
                            }
                            }    
                            }     
    
                            }
                        }
                    }
                }
            */
           /**
                                    #swagger.responses[200] = {
                                        'description': 'Produto cadastrado com sucesso',
                                        '@schema': {
                                            'properties': {
                                                resultado_cadastro: {
                                                    type: 'boolean',
                                                    example: true
                                                },
                                                mensagem: {
                                                    type: 'string',
                                                    example: 'Produto cadastrado com sucesso'
                                                },
                                                produto: {
                                                    type: 'object',
                                                    properties: {
                                                        "nome": { 
                                                        "type": "string", 
                                                        "example": "X-Salada"
                                                    },
                                                        "descricao": { 
                                                            "type": "string",
                                                            "example": "sem salada, sem tomate"
                                                        },
                                                        "preco": { 
                                                            "type": "number",
                                                            "example": "25"
                                                        },
                                                        "imagemURL": {
                                                            "type": "string",
                                                            "example": "xsalada.png"
                                                        },
                                                        "categoria": {
                                                            "type": "string",
                                                            "example": "LANCHE"
                                                    }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                */
                                     /**
            #swagger.responses[400] = {
                'description': 'Ocorreu um erro inesperado',
                '@schema': {
                    'properties': {
                        mensagem: {
                            type: 'string',
                            example: 'Erro inesperado: Não foi possivel cadastrar o produto'
                        }
                    }
                }
            }
            */

                try {
                    if (req.body === undefined || Object.keys(req.body).length === 0) {
                        res.status(400).send("Nenhum dado informado.");
                        throw new Error("Erro: Nenhum dado informado.");
                    }
                    const { nome, descricao, preco, categoria, imagemURL } = req.body;
                    const produtoPayload = await ProdutoController.cadastrarProduto(dbconnection, nome, descricao, preco, categoria, imagemURL);
                    res.send(produtoPayload);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );

        app.put(
            "/produto/atualizar",
            async (req: Request, res: Response) => {
                /**
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/atualizar'
            #swagger.method = 'put'
            #swagger.summary = 'Atualizar Produto'
            #swagger.description = 'Atualiza o Cadastro de um Produto, através dos dados fornecidos no corpo da requisição.<br><br>
        [ Endpoint para integração aos sistemas administrativo e/ou de loja ]'
            #swagger.produces = ["application/json"]  
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['body'] = { 
                in: 'body', 
                '@schema': {  
                    "properties": { 
                        "nome": { 
                            "type": "string", 
                            "example": "X-EGG"
                        },
                        "descricao": { 
                            "type": "string",
                            "example": "Sem cebola, sem tomate"
                        },
                        "preco": { 
                            "type": "number",
                            "example": "35"
                        },
                        "categoria": { 
                            "type": "string",
                            "example": "Lanche"
                        },
                        "imagemURL": { 
                            "type": "string",
                            "example": "x-egg.jpeg"
                        },
                        "id": { 
                            "type": "string",
                            "example": "0eb3a93d-df52-4f04-a463-389105328855"
                        }
                    }
                }
            }
        */
       /**
            #swagger.responses[400] = {
                'description': 'Produto não encontrado',
                '@schema': {
                    'properties': {
                    resultado_cadastro: {
                            type: 'boolean',
                             example: false
                       },
                        mensagem: {
                            type: 'string',
                            example: 'Produto não encontrado, id inexistente'
                        }
                    }
                }
            }
            */
                try {
                    if (req.body === undefined || Object.keys(req.body).length === 0) {
                        res.status(400).send("Nenhum dado informado.");
                        throw new Error("Erro: Nenhum dado informado.");
                    }
                    const { nome, descricao, preco, categoria, imagemURL, id } = req.body;
                    const produtoAtualizado = await ProdutoController.atualizarProduto(dbconnection, nome, descricao, preco, categoria, imagemURL, id);
                    res.send(produtoAtualizado);

                } catch (error: any) {
                    res.send(error.message);
                }
            }
        );
    }
}
