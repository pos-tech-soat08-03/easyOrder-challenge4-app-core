import { v4 as uuidv4 } from 'uuid';
import { ProdutoEntity } from '../../../easyorder/Core/Entity/ProdutoEntity';
import { PedidoComboEntity } from '../../../easyorder/Core/Entity/PedidoComboEntity';
import { CategoriaEnum } from '../../../easyorder/Core/Entity/ValueObject/CategoriaEnum';

describe('PedidoComboEntity', () => {
  const lanche = new ProdutoEntity('Lanche', 'Delicioso lanche', 20, CategoriaEnum.LANCHE, 'url');
  const bebida = new ProdutoEntity('Bebida', 'Refrigerante gelado', 10, CategoriaEnum.BEBIDA, 'url');
  const sobremesa = new ProdutoEntity('Sobremesa', 'Sorvete de chocolate', 15, CategoriaEnum.SOBREMESA, 'url');
  const acompanhamento = new ProdutoEntity('Acompanhamento', 'Batata frita', 8, CategoriaEnum.ACOMPANHAMENTO, 'url');

  it('deve criar um combo com ID gerado automaticamente', () => {
    const combo = new PedidoComboEntity(lanche, null, null, null);
    expect(combo.getId()).toBeDefined();
  });

  it('deve criar um combo com ID fornecido', () => {
    const id = uuidv4();
    const combo = new PedidoComboEntity(lanche, null, null, null, id);
    expect(combo.getId()).toBe(id);
  });

  it('deve lançar erro se nenhum produto for informado', () => {
    expect(() => new PedidoComboEntity(null, null, null, null)).toThrow(
      'Combo deve ter ao menos um produto informado'
    );
  });

  it('deve retornar o lanche corretamente', () => {
    const combo = new PedidoComboEntity(lanche, null, null, null);
    expect(combo.getLanche()).toBe(lanche);
  });

  it('deve retornar a bebida corretamente', () => {
    const combo = new PedidoComboEntity(null, bebida, null, null);
    expect(combo.getBebida()).toBe(bebida);
  });

  it('deve retornar a sobremesa corretamente', () => {
    const combo = new PedidoComboEntity(null, null, sobremesa, null);
    expect(combo.getSobremesa()).toBe(sobremesa);
  });

  it('deve retornar o acompanhamento corretamente', () => {
    const combo = new PedidoComboEntity(null, null, null, acompanhamento);
    expect(combo.getAcompanhamento()).toBe(acompanhamento);
  });

  it('deve calcular o valor total do combo corretamente', () => {
    const combo = new PedidoComboEntity(lanche, bebida, sobremesa, acompanhamento);
    expect(combo.getValorTotal()).toBe(53); // 20 (lanche) + 10 (bebida) + 15 (sobremesa) + 8 (acompanhamento)
  });

  it('deve calcular o valor total do combo com produtos ausentes', () => {
    const combo = new PedidoComboEntity(lanche, null, sobremesa, null);
    expect(combo.getValorTotal()).toBe(35); // 20 (lanche) + 15 (sobremesa)
  });
});
