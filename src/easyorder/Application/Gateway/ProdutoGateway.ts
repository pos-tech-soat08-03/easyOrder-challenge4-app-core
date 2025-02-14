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

  public async buscarProdutoPorId(id: string): Promise<ProdutoEntity | null> {
    try {
      
      const chamada_produto = `http://${this.apiUrl}/produto/buscar/${id}`;

      console.log(`Buscando produto no Microserviço de Produtos - id ${id}`);
      console.log(`Chamada: ${chamada_produto}`);

      const response = await axios.get(chamada_produto).catch((error) => {
        console.error(`Erro ao acessar microserviço: ${error.message}`);
        throw new DataNotFoundException("Não foi possível acessar o microserviço de produtos");
      });
      
      console.log(`Resposta da chamada: ${response.data}`);
      
      if (!response.data.produto) {
        throw new DataNotFoundException("Produto não encontrado");
      }
      
      const produto_data = response.data.produto;
      return new ProdutoEntity(
        produto_data.nome,
        produto_data.descricao,
        produto_data.preco,
        produto_data.categoria as CategoriaEnum,
        produto_data.imagemURL,
        produto_data.id
      );
    } catch (error: any) {
      console.error(`Erro ao buscar produto: ${error.message}`);
      throw error;
    }
  }
}
