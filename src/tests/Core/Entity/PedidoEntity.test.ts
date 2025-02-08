import { PedidoComboEntity } from "../../../easyorder/Core/Entity/PedidoComboEntity";
import { PedidoEntity } from "../../../easyorder/Core/Entity/PedidoEntity";
import { ProdutoEntity } from "../../../easyorder/Core/Entity/ProdutoEntity";
import { CategoriaEnum } from "../../../easyorder/Core/Entity/ValueObject/CategoriaEnum";
import { StatusPagamentoEnum } from "../../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum";
import {
  StatusPedidoEnum,
  StatusPedidoValueObject,
} from "../../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject";

describe("PedidoEntity", () => {
  let pedido: PedidoEntity;
  const clienteId = "aa9b1222-0ba2-4388-9bde-e1a1d5ca1015";
  const lanche = new ProdutoEntity(
    "Lanche 1", // nome
    "Delicioso lanche com queijo e hambúrguer", // descricao
    20, // preco
    CategoriaEnum.LANCHE, // categoria
    "https://exemplo.com/lanche1.jpg" // imagemURL
  );

  const bebida = new ProdutoEntity(
    "Bebida 1", // nome
    "Refrigerante gelado", // descricao
    10, // preco
    CategoriaEnum.BEBIDA, // categoria
    "https://exemplo.com/bebida1.jpg" // imagemURL
  );
  const combo = new PedidoComboEntity(lanche, bebida, null, null);

  beforeEach(() => {
    pedido = new PedidoEntity(clienteId);
  });

  it("deve criar um pedido com valores padrão", () => {
    expect(pedido.getId()).toBeDefined();
    expect(pedido.getDataPedido()).toBeDefined();
    expect(pedido.getClienteId()).toBe(clienteId);
    expect(pedido.getStatusPedido().getValue()).toBe(
      StatusPedidoEnum.EM_ABERTO
    );
    expect(pedido.getStatusPagamento()).toBe(StatusPagamentoEnum.PENDENTE);
    expect(pedido.getCombos()).toEqual([]);
  });

  it("deve lançar erro se clienteId não for informado", () => {
    expect(() => new PedidoEntity("")).toThrow(
      "Cliente não informado na montagem do pedido"
    );
  });

  it("deve permitir adicionar combos ao pedido", () => {
    pedido.adicionarCombos([combo]);
    expect(pedido.getCombos()).toContain(combo);
  });

  it("deve lançar erro ao adicionar combos se o pedido não estiver em aberto", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    );
    expect(() => pedido.adicionarCombos([combo])).toThrow(
      "Não é possível adicionar combos a um pedido que não está em aberto"
    );
  });

  it("deve lançar erro ao tentar enviar pedido que não está em aberto para pagamento", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO))

    expect(() => pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    )).toThrow(
      "Status do pedido não permite enviar para pagamento"
    );
  });

  it("deve lançar erro ao tentar trocar pedido para recebido que não tenha seu anterior como aguardando pagamento", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO))

    expect(() => pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO)
    )).toThrow(
      "Status do pedido não permite pagamento"
    );
  });

  it("deve lançar erro ao tentar trocar pedido para em preparação que não tenha seu anterior como recebido", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO))

    expect(() => pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO)
    )).toThrow(
      "Status do pedido não permite início de preparação"
    );
  });

  it("deve lançar erro ao tentar trocar pedido para pronto que não tenha seu anterior como em preparação", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO))

    expect(() => pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.PRONTO)
    )).toThrow(
      "Status do pedido não permite finalização de preparação"
    );
  });

  
  it("deve lançar erro ao tentar trocar pedido para finalizado que não tenha seu anterior como pronto", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO))

    expect(() => pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.FINALIZADO)
    )).toThrow(
      "Status do pedido não permite entrega"
    );
  });

  it("deve permitir remover um combo do pedido", () => {
    pedido.adicionarCombos([combo]);
    pedido.removerCombo(combo.getId());
    expect(pedido.getCombos()).not.toContain(combo);
  });

  it("deve lançar erro ao remover combo se o pedido não estiver em aberto", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    );
    expect(() => pedido.removerCombo(combo.getId())).toThrow(
      "Não é possível remover combos de um pedido que não está em aberto"
    );
  });

  it("deve calcular o valor total do pedido corretamente", () => {
    const sobremesa = new ProdutoEntity(
      "Sobremesa 1", // nome
      "Sorvete de chocolate", // descricao
      15, // preco
      CategoriaEnum.SOBREMESA, // categoria
      "https://exemplo.com/sobremesa1.jpg" // imagemURL
    );
    const combo2 = new PedidoComboEntity(null, null, sobremesa, null);
    pedido.adicionarCombos([combo, combo2]);
    expect(pedido.getValorTotal()).toBe(45); // 20 (lanche) + 10 (bebida) + 15 (sobremesa)
  });

  it("deve permitir alterar o status do pedido", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    );
    expect(pedido.getStatusPedido().getValue()).toBe(
      StatusPedidoEnum.AGUARDANDO_PAGAMENTO
    );
  });

  it("deve lançar erro ao tentar cancelar um pedido em status inválido", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    );
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO)
    );
    expect(() =>
      pedido.setStatusPedido(
        new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO)
      )
    ).toThrow("Status do pedido não permite cancelamento");
  });

  it("deve permitir alterar o status de pagamento para PAGO", () => {
    pedido.setStatusPagamento(StatusPagamentoEnum.PAGO);
    expect(pedido.getStatusPagamento()).toBe(StatusPagamentoEnum.PAGO);
  });

  it("deve lançar erro ao tentar alterar o status de pagamento de um pedido já pago", () => {
    pedido.setStatusPagamento(StatusPagamentoEnum.PAGO);
    expect(() =>
      pedido.setStatusPagamento(StatusPagamentoEnum.PENDENTE)
    ).toThrow(
      "Não é possível alterar o status de pagamento de um pedido já pago"
    );
  });

  it("deve lançar erro ao tentar enviar para pagamento sem combos", () => {
    expect(() =>
      pedido.setStatusPedido(
        new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
      )
    ).toThrow(
      "Para Checkout um pedido, deve existir ao menos um combo selecionado"
    );
  });

  it("deve permitir enviar para pagamento se houver combos", () => {
    pedido.adicionarCombos([combo]);
    pedido.setStatusPedido(
      new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
    );
    expect(pedido.getStatusPedido().getValue()).toBe(
      StatusPedidoEnum.AGUARDANDO_PAGAMENTO
    );
  });
});
