import axios, { AxiosError } from "axios";
import { ProdutoGateway } from "../../../easyorder/Application/Gateway/ProdutoGateway";
import { ProdutoEntity } from "../../../easyorder/Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../../easyorder/Core/Entity/ValueObject/CategoriaEnum";
import { DataNotFoundException } from "../../../easyorder/Core/Types/ExceptionType";

jest.mock("axios");

describe("ProdutoGateway", () => {
  let produtoGateway: ProdutoGateway;
  const apiUrl = "localhost:3000";
  const produtoId = "123";
  const produtoData = {
    nome: "Produto Teste",
    descricao: "Descrição do Produto Teste",
    preco: 100,
    categoria: "ELETRONICOS",
    imagemURL: "http://imagem.com/produto.jpg",
    id: produtoId,
  };

  beforeEach(() => {
    produtoGateway = new ProdutoGateway(apiUrl);
  });

  it("deve retornar um ProdutoEntity quando o produto é encontrado", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { produto: produtoData },
    });

    const produto = await produtoGateway.buscarProdutoPorId(produtoId);

    expect(produto).toBeInstanceOf(ProdutoEntity);
    expect(produto?.nome).toBe(produtoData.nome);
    expect(produto?.descricao).toBe(produtoData.descricao);
    expect(produto?.preco).toBe(produtoData.preco);
    expect(produto?.categoria).toBe(produtoData.categoria);
    expect(produto?.imagemURL).toBe(produtoData.imagemURL);
    expect(produto?.id).toBe(produtoData.id);
  });

  it("deve lançar DataNotFoundException quando o produto não é encontrado", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { produto: null },
    });

    await expect(produtoGateway.buscarProdutoPorId(produtoId)).rejects.toThrow(DataNotFoundException);
  });

  it("deve lançar DataNotFoundException quando ocorre um erro ao acessar o microserviço", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Erro de rede"));

    await expect(produtoGateway.buscarProdutoPorId(produtoId)).rejects.toThrow(DataNotFoundException);
  });
});