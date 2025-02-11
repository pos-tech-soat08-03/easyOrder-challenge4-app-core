import axios, { AxiosError } from "axios";
import { ProdutoGateway } from "../../../easyorder/Application/Gateway/ProdutoGateway";
import { ProdutoEntity } from "../../../easyorder/Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../../easyorder/Core/Entity/ValueObject/CategoriaEnum";
import { DataNotFoundException } from "../../../easyorder/Core/Types/ExceptionType";

jest.mock("axios");

describe("ProdutoGateway", () => {
  let gateway: ProdutoGateway;

  beforeEach(() => {
    gateway = new ProdutoGateway("https://api.example.com");
    jest.clearAllMocks();
  });

  it("deve buscar um produto por ID corretamente", async () => {
    const produtoMock = {
      id: "produto-001",
      nome: "Hambúrguer",
      descricao: "Delicioso hambúrguer artesanal",
      preco: 20,
      categoria: CategoriaEnum.LANCHE,
      imagemURL: "https://example.com/hamburguer.jpg",
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: produtoMock });

    const resultado = await gateway.buscarProdutoPorId("produto-001");

    expect(resultado).toBeInstanceOf(ProdutoEntity);
    expect(resultado?.getId()).toBe("produto-001");
    expect(resultado?.getNome()).toBe("Hambúrguer");
    expect(resultado?.getCategoria()).toBe(CategoriaEnum.LANCHE);
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.com/produtos/buscar/produto-001"
    );
  });

  it("deve lançar DataNotFoundException se o produto não for encontrado", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: null });

    await expect(
      gateway.buscarProdutoPorId("produto-inexistente")
    ).rejects.toThrow(new DataNotFoundException("Produto não encontrado"));

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.com/produtos/buscar/produto-inexistente"
    );
  });

  it("deve lançar DataNotFoundException em caso de erro na requisição", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Erro na requisição"));

    await expect(gateway.buscarProdutoPorId("produto-001")).rejects.toThrow(
      new DataNotFoundException("Erro na requisição")
    );

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.com/produtos/buscar/produto-001"
    );
  });
});
