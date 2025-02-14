import axios from "axios";
import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../Core/Entity/ValueObject/CategoriaEnum";
import { ProdutoGatewayInterface } from "../../Core/Interfaces/Gateway/ProdutoGatewayInterface";
import { DataNotFoundException } from "../../Core/Types/ExceptionType";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
export class ProdutoGateway implements ProdutoGatewayInterface {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  public async buscarProdutoPorId(id: string): Promise<ProdutoEntity | null> {
    try {
      console.log(`Buscando produto no Microserviço de Produtos - id ${id}`);
      const chamada_produto = `http://${this.apiUrl}/produto/buscar/${id}`;
      console.log(`Chamada: ${chamada_produto}`);
      const response = await axios.get(chamada_produto).catch((error) => {
        console.error(`Erro ao acessar microserviço: ${error.message}`);
        throw new DataNotFoundException("Não foi possível acessar o microserviço de produtos");
      });
      if (!response || !response.data) {
        throw new DataNotFoundException("Erro obtendo dados do microserviço de produtos");
      }
      console.log(`Produto encontrado: ${response.data}`);

      return new ProdutoEntity(
        response.data.produto.nome,
        response.data.produto.descricao,
        response.data.produto.preco,
        response.data.produto.categoria as CategoriaEnum,
        response.data.produto.imagemURL,
        response.data.produto.id
      );
    } catch (error: any) {
      console.error(`Erro ao buscar produto: ${error.message}`);
      throw error;
    }
  }
}
