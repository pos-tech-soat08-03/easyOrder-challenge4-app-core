import { ProdutoEntity } from "../../../Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../../Core/Entity/ValueObject/CategoriaEnum";
import { ProdutoGatewayInterface } from "../../../Core/Interfaces/Gateway/ProdutoGatewayInterface";

export class ProdutoGatewayMock implements ProdutoGatewayInterface {
  constructor() {
    // inicializar um array com dados mockados
  }

  public async buscarProdutoPorId(id: string): Promise<ProdutoEntity> {
    throw new Error("Method not implemented.");
  }

  private produtos: Map<string, ProdutoEntity> = new Map();

  public async listarProdutos(): Promise<ProdutoEntity[]> {
    return Promise.resolve(Array.from(this.produtos.values()));
  }

  public async listarProdutoCategoria(
    categoria: CategoriaEnum
  ): Promise<ProdutoEntity[]> {
    return Promise.resolve(
      Array.from(this.produtos.values()).filter(
        (produto) => produto.getCategoria() === categoria
      )
    );
  }

  public async salvarProduto(produto: ProdutoEntity): Promise<void> {
    this.produtos.set(produto.getId(), produto);
    return Promise.resolve();
  }

  public async removerPorId(id: string): Promise<void> {
    this.produtos.delete(id);
    return Promise.resolve();
  }

  public async limpar(): Promise<void> {
    this.produtos.clear();
    return Promise.resolve();
  }
}
