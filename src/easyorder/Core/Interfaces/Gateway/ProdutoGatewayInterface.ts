import { ProdutoEntity } from "../../Entity/ProdutoEntity";

export interface ProdutoGatewayInterface {
  buscarProdutoPorId(id: string): Promise<ProdutoEntity>;
}
