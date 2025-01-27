import { ProdutoEntity } from "../Entity/ProdutoEntity";
import { CategoriaEnum } from "../Entity/ValueObject/CategoriaEnum";
import { ProdutoGatewayInterface } from "../Interfaces/Gateway/ProdutoGatewayInterface";
import { DataNotFoundException } from "../Types/ExceptionType";

export class ProdutoUsesCases {
  public static async listarProdutosUsecase(
    produtoGateway: ProdutoGatewayInterface
  ): Promise<{ produtos: ProdutoEntity[] | undefined; mensagem: string }> {
    try {
      const produtos = await produtoGateway.listarProdutos();
      return { produtos, mensagem: "Produtos listado com sucesso." };
    } catch (error) {
      throw new Error("Erro ao listar produtos por categoria.");
    }
  }

  public static async listarProdutosPorCategoriaUsecase(
    produtoGateway: ProdutoGatewayInterface,
    categoria: CategoriaEnum
  ): Promise<{ produtos: ProdutoEntity[] | undefined; mensagem: string }> {
    try {
      const produtos = await produtoGateway.listarProdutoCategoria(categoria);
      return { produtos, mensagem: "Produtos listado com sucesso." };
    } catch (error) {
      throw new Error("Erro ao listar produtos por categoria.");
    }
  }

  public static async salvarProdutoUsecase(
    produtoGateway: ProdutoGatewayInterface,
    nome: string,
    descricao: string,
    preco: number,
    categoria: CategoriaEnum,
    imagemURL: string
  ): Promise<{ produto: ProdutoEntity | undefined; mensagem: string }> {
    const produto = new ProdutoEntity(
      nome,
      descricao,
      preco,
      categoria,
      imagemURL
    );
    try {
      await produtoGateway.salvarProduto(produto);
      return { produto, mensagem: "Produto salvo com sucesso." };
    } catch (error) {
      throw new Error("Erro ao salvar produto.");
    }
  }

  public static async buscarProdutoPorIdUsecase(
    produtoGateway: ProdutoGatewayInterface,
    id: string
  ): Promise<{ produto: ProdutoEntity | undefined; mensagem: string }> {
    try {
      const produto = await produtoGateway.buscarProdutoPorId(id);
      return { produto, mensagem: "Sucesso ao buscar o produto." };
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        throw new Error("Produto não encontrado: " + id);
      }
      throw new Error("Erro ao bucar produto: " + id);
    }
  }

  public static async removerProdutoPorIdUsecase(
    produtoGateway: ProdutoGatewayInterface,
    produtoID: string
  ): Promise<{ produtoID: string; mensagem: string }> {
    try {
      await produtoGateway.removerPorId(produtoID);
      return { produtoID, mensagem: "Sucesso ao remover o produto." };
    } catch (error) {
      throw new Error("Erro ao remover produto: " + produtoID);
    }
  }

  public static async atualizarProdutoUsecase(
    produtoGateway: ProdutoGatewayInterface,
    id: string,
    nome: string,
    descricao: string,
    preco: number,
    categoria: CategoriaEnum,
    imagemURL: string
  ): Promise<{ produto: ProdutoEntity | undefined; mensagem: string }> {
    try {
      await produtoGateway.buscarProdutoPorId(id);
      const produto = new ProdutoEntity(
        nome,
        descricao,
        preco,
        categoria,
        imagemURL,
        id
      );
      return { produto, mensagem: "Sucesso ao atualizar o produto." };
    } catch (error) {
      if (error instanceof DataNotFoundException) {
        throw new Error("Produto não encontrado: " + id);
      }
      throw new Error("Erro ao atualizar produto: " + id);
    }
  }
}
