import express, { Request, Response } from "express";
import { CategoriaGatewayMock } from "../../../Infrastructure/DB/Mock/CategoriaGatewayMock";
import { ListarCategoriasUsecase } from "../../../Core/Usecase/Produtos/ListarCategoriasUsecase";

export class ListaCategoriasController {
  public constructor(private listaCategoriasUsecaseMock: CategoriaGatewayMock) {
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response): Promise<void> {
    /**
            #swagger.tags = ['Produtos']
            #swagger.path = '/produto/categoria/listar'
            #swagger.method = 'get'
            #swagger.summary = 'Listar todos as categorias'
            #swagger.description = 'Controller para listar todos as categorias cadastradas'
            #swagger.produces = ["application/json"]  
                #swagger.response[200] = {
                description: 'Categorias listadas com sucesso',
                schema: {
                type: 'object',
                properties: {
                categorias: {
                type: 'array',
                items: {
                type: 'string',
                example: 'LANCHE'
                            },
                example: ['LANCHE', 
                     'BEBIDA', 
                     'SOBREMESA', 
                     'ACOMPANHAMENTO']
         }
       }
     }
   }
  */

    const listaCategoriasUsecase = new ListarCategoriasUsecase();

    try {
      const result = await listaCategoriasUsecase.execute(req.body);


      if (result.categorias.length > 0) {
        res.status(200).json(result);
      } else {
        res
          .status(404)
          .json({ categorias: [], mensagem: "Nenhum item foi encontrado." });
      }
    } catch (error) {
      res
        .status(500)
        .json({
          categorias: [],
          mensagem: "Ocorreu um erro ao listar as categorias.",
        });
    }
  }
}
