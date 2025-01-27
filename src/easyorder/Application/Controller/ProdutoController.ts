import { CategoriaEnum } from "../../Core/Entity/ValueObject/CategoriaEnum";
import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { ProdutoUsesCases } from "../../Core/Usecase/ProdutoUsecases";
import { ProdutoGateway } from "../Gateway/ProdutoGateway";
import { ProdutoAdapter } from "../Presenter/ProdutoAdapter";

export class ProdutoController {

    public static async listarProdutos(dbConnection: IDbConnection): Promise<string> {
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const { produtos, mensagem } = await ProdutoUsesCases.listarProdutosUsecase(produtoGateway);
        if (produtos === undefined || produtos.length === 0) {
            return ProdutoAdapter.adaptPrudoJsonError(mensagem);
        }
        return ProdutoAdapter.adaptJsonListaProduto(produtos, mensagem);
    }

    public static async listarProdutoPorCategoria(dbConnection: IDbConnection, categoria: CategoriaEnum): Promise<string> {
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const { produtos, mensagem } = await ProdutoUsesCases.listarProdutosPorCategoriaUsecase(produtoGateway, categoria);
        if (produtos === undefined || produtos.length === 0) {
            return ProdutoAdapter.adaptPrudoJsonError(mensagem);
        }
        return ProdutoAdapter.adaptJsonListaProduto(produtos, mensagem);
    }

    public static async buscarProdutoPorId(dbConnection: IDbConnection, id: string): Promise<string> {
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const { produto, mensagem } = await ProdutoUsesCases.buscarProdutoPorIdUsecase(produtoGateway, id);
        if (produto === undefined) {
            return ProdutoAdapter.adaptPrudoJsonError(mensagem);
        }
        return ProdutoAdapter.adaptJsonProduto(produto, mensagem);
    }

    public static async cadastrarProduto(dbConnection: IDbConnection, nome: string, descricao: string, preco: number, categoria: CategoriaEnum, imagemURL: string): Promise<string> {
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const { produto, mensagem } = await ProdutoUsesCases.salvarProdutoUsecase(produtoGateway, nome, descricao, preco, categoria, imagemURL);
        if (produto === undefined) {
            return ProdutoAdapter.adaptPrudoJsonError(mensagem);
        }
        return ProdutoAdapter.adaptJsonProduto(produto, mensagem);
    }

    public static async atualizarProduto(dbConnection: IDbConnection, nome: string, descricao: string, preco: number, categoria: CategoriaEnum, imagemURL: string, id :string): Promise<string>{
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const { produto, mensagem } = await ProdutoUsesCases.atualizarProdutoUsecase(produtoGateway, id, nome, descricao, preco, categoria, imagemURL);
        if (produto === undefined) {
            return ProdutoAdapter.adaptPrudoJsonError(mensagem);
        }
        return ProdutoAdapter.adaptJsonProduto(produto, mensagem);
    }

    public static async removerProdutoPorId(dbConnection: IDbConnection, id: string): Promise<string>{
        const produtoGateway = dbConnection.gateways.produtoGateway;
        const {produtoID, mensagem} = await ProdutoUsesCases.removerProdutoPorIdUsecase(produtoGateway, id);

        return ProdutoAdapter.adaptJsonProdutoId(produtoID ,mensagem);   
    }

}