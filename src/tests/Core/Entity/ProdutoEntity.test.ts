
import { v4 as uuidv4 } from 'uuid';
import { ProdutoEntity } from '../../../easyorder/Core/Entity/ProdutoEntity';
import { CategoriaEnum } from '../../../easyorder/Core/Entity/ValueObject/CategoriaEnum';

describe('ProdutoEntity', () => {
  const nome = 'Lanche 1';
  const descricao = 'Delicioso lanche com queijo e hambúrguer';
  const preco = 20;
  const categoria = CategoriaEnum.LANCHE;
  const imagemURL = 'https://exemplo.com/lanche1.jpg';

  it('deve criar um produto com valores padrão', () => {
    const produto = new ProdutoEntity(nome, descricao, preco, categoria, imagemURL);

    expect(produto.getId()).toBeDefined(); // ID deve ser gerado automaticamente
    expect(produto.getNome()).toBe(nome);
    expect(produto.getDescricao()).toBe(descricao);
    expect(produto.getPreco()).toBe(preco);
    expect(produto.getCategoria()).toBe(categoria);
    expect(produto.getImagemURL()).toBe(imagemURL);
  });

  it('deve criar um produto com ID fornecido', () => {
    const id = uuidv4();
    const produto = new ProdutoEntity(nome, descricao, preco, categoria, imagemURL, id);

    expect(produto.getId()).toBe(id); // ID deve ser o mesmo que foi fornecido
  });
});
