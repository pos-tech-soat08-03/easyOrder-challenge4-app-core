import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";


export class ProdutoAdapter {

    public static adaptPrudoJsonError(mensagem: string): string {
        return JSON.stringify({
            message: mensagem
        });
    }

    public static adaptJsonListaProduto (produtos: ProdutoEntity[], mensagem: string): string {
        return JSON.stringify({
            mensagem: mensagem,
            produtos: produtos?.map((produto) => {
              return {
                id: produto.getId(),
                nome: produto.getNome(),
                descricao: produto.getDescricao(),
                preco: produto.getPreco(),
                categoria: produto.getCategoria(),
                imagem_url: produto.getImagemURL(),
              };
            }),
          });
    }

    public static adaptJsonProduto (produto: ProdutoEntity, mensagem: string): string {
      return JSON.stringify({
        mensagem: mensagem,
        produto: {
            id: produto.getId(),
            nome: produto.getNome(),
            descricao: produto.getDescricao(),
            preco: produto.getPreco(),
            categoria: produto.getCategoria(),
            imagem_url: produto.getImagemURL(),
        }
      });
    }
    public static adaptJsonProdutoId (id: string, mensagem: string): string {
      return JSON.stringify({
        mensagem,
        id
      });
    }

}