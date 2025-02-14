import { v4 as uuidv4 } from "uuid";
import { CategoriaEnum } from "./ValueObject/CategoriaEnum";

export class ProdutoEntity {
  public id: string;
  public nome: string;
  public descricao: string;
  public preco: number;
  public categoria: CategoriaEnum;
  public imagemURL: string;

  constructor(
    nome: string,
    descricao: string,
    preco: number,
    categoria: CategoriaEnum,
    imagemURL: string,
    id?: string
  ) {
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.categoria = categoria;
    this.imagemURL = imagemURL;
    if (!id) {
      id = uuidv4();
    }
    this.id = id;
  }
  public getId(): string {
    return this.id;
  }
  public getNome(): string {
    return this.nome;
  }
  public getDescricao(): string {
    return this.descricao;
  }
  public getPreco(): number {
    return this.preco;
  }
  public getImagemURL(): string {
    return this.imagemURL;
  }
  public getCategoria(): CategoriaEnum {
    return this.categoria;
  }
}
