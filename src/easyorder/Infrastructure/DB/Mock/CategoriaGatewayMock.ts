import { CategoriaEnum } from "../../../Core/Entity/ValueObject/CategoriaEnum";
import { ListaCategoriasUsecaseOutput } from "../../../Core/Interfaces/Gateway/CategoriaGatewayInterface";

export class CategoriaGatewayMock {
  private categorias: CategoriaEnum[] = Object.values(
    CategoriaEnum
  ) as CategoriaEnum[];
  private simularVazio: boolean = true;

  public setSimularVazio(vazio: boolean): void {
    this.simularVazio = vazio;
  }

  public async execute(): Promise<ListaCategoriasUsecaseOutput> {
    try {
      if (this.categorias.length === 0) {
        return { categorias: [], mensagem: "Nenhum item foi encontrado." };
      }

      return { categorias: this.categorias };
    } catch (error) {
      return {
        categorias: [],
        mensagem: "Ocorreu um erro ao listar as categorias.",
      };
    }
  }
}
