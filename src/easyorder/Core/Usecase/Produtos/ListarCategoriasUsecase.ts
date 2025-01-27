import { CategoriaEnum } from "../../Entity/ValueObject/CategoriaEnum";
import { ListaCategoriasUsecaseInput, ListaCategoriasUsecaseOutput } from "../../Interfaces/Gateway/CategoriaGatewayInterface";

export class ListarCategoriasUsecase {
  public async execute(
    input: ListaCategoriasUsecaseInput
  ): Promise<ListaCategoriasUsecaseOutput> {
    try {
      // Mapeia o enum para uma lista de strings
      const categorias = Object.values(CategoriaEnum);

      // Se a lista de categorias estiver vazia, retornar uma mensagem de erro
      if (categorias.length === 0) {
        return { categorias: [], mensagem: "Nenhum item foi encontrado." };
      }

      // Retorna as categorias se houver sucesso
      return { categorias };
    } catch (error) {
      // Tratar erros e retornar uma mensagem apropriada
      return {
        categorias: [],
        mensagem: "Ocorreu um erro ao listar as categorias.",
      };
    }
  }
}
