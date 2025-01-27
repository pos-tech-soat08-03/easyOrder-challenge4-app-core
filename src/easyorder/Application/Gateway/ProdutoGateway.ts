import { DataTypes, Model, Sequelize } from "sequelize";
import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../Core/Entity/ValueObject/CategoriaEnum";
import { ProdutoGatewayInterface } from "../../Core/Interfaces/Gateway/ProdutoGatewayInterface";
import { ConnectionInfo } from "../../Core/Types/ConnectionInfo";
import { DataNotFoundException } from "../../Core/Types/ExceptionType";

class LocalModel extends Model {
  public id!: string;
  public nome!: string;
  public descricao!: string;
  public preco!: number;
  public categoria!: string;
  public imagemURL!: string;
}

export class ProdutoGateway implements ProdutoGatewayInterface {
  private sequelize: Sequelize;

  constructor(private dbconnection: ConnectionInfo) {
    this.sequelize = new Sequelize(
      this.dbconnection.database,
      this.dbconnection.username,
      this.dbconnection.password,
      {
        host: this.dbconnection.hostname,
        port: this.dbconnection.portnumb,
        dialect: this.dbconnection.databaseType
      }
    );
    LocalModel.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        nome: {
          type: DataTypes.STRING,
        },
        descricao: {
          type: DataTypes.STRING,
        },
        preco: {
          type: DataTypes.DOUBLE,
        },
        categoria: {
          type: DataTypes.STRING,
        },
        imagemURL: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize: this.sequelize,
        modelName: "Produto",
        tableName: "produtos",
        timestamps: false,
      }
    );
    this.sequelize.sync({
      alter: true,
    });
  }

  public async listarProdutos(): Promise<ProdutoEntity[]> {
    const produtos = await LocalModel.findAll();
    if (!produtos) {
      return [];
    }

    return produtos.map((produto) => {
      return new ProdutoEntity(
        produto.nome,
        produto.descricao,
        produto.preco,
        produto.categoria as CategoriaEnum,
        produto.imagemURL,
        produto.id
      );
    });
  }
  public async listarProdutoCategoria(
    categoria: CategoriaEnum
  ): Promise<ProdutoEntity[]> {
    return new Array<ProdutoEntity>();
  }
  public async buscarProdutoPorId(
    id: string
  ): Promise<ProdutoEntity> {
    const produto = await LocalModel.findOne({
      where: {
        id: id,
      },
    });
    if (!produto) {
      throw new DataNotFoundException("Produto não encontrado");
    }
    return new ProdutoEntity(
      produto.nome,
      produto.descricao,
      produto.preco,
      produto.categoria as CategoriaEnum,
      produto.imagemURL,
      produto.id
    );
  }
  public async removerPorId(idProduto: string): Promise<void> {
    await LocalModel.destroy({
      where: {
        id: idProduto,
      },
    });
    return;
  }

  public async salvarProduto(cliente: ProdutoEntity): Promise<void> {
    const dto = {
      id: cliente.getId(),
      nome: cliente.getNome(),
      descricao: cliente.getDescricao(),
      preco: cliente.getPreco(),
      categoria: cliente.getCategoria(),
      imagemURL: cliente.getImagemURL(),
    };

    await LocalModel.upsert(dto);

    return;
  }
}
