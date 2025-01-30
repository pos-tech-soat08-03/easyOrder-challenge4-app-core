import axios from "axios";
import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../Core/Entity/ValueObject/CategoriaEnum";
import { ProdutoGatewayInterface } from "../../Core/Interfaces/Gateway/ProdutoGatewayInterface";
import { DataNotFoundException } from "../../Core/Types/ExceptionType";
export class ProdutoGateway implements ProdutoGatewayInterface {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  public async buscarProdutoPorId(id: string): Promise<ProdutoEntity> {
    try {
      const response = await axios.get(`${this.apiUrl}/produtos/buscar/${id}`);

      if (!response.data) {
        throw new DataNotFoundException("Produto não encontrado");
      }

      return new ProdutoEntity(
        response.data.nome,
        response.data.descricao,
        response.data.preco,
        response.data.categoria as CategoriaEnum,
        response.data.imagemURL,
        response.data.id
      );
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new DataNotFoundException(
          `Erro ao buscar produto: ${error.message}`
        );
      }
      throw error;
    }
  }
}
