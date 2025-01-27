import { ProdutoEntity } from "../../Entity/ProdutoEntity";
import { CategoriaEnum } from "../../Entity/ValueObject/CategoriaEnum";

export interface ProdutoGatewayInterface {
    listarProdutos (): Promise<ProdutoEntity[]>;
    listarProdutoCategoria(categoria: CategoriaEnum): Promise<ProdutoEntity[]>;
    salvarProduto (produto: ProdutoEntity):Promise <void> ;
    buscarProdutoPorId (id: string): Promise<ProdutoEntity> ;
    removerPorId (id: string): Promise<void>;

}
