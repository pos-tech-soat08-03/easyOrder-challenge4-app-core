import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity } from '../../../easyorder/Core/Entity/TransactionEntity';
import { StatusTransacaoEnum, StatusTransacaoValueObject } from '../../../easyorder/Core/Entity/ValueObject/StatusTransacaoValueObject';

describe('TransactionEntity', () => {
  const idPedido = 'pedido-123';
  const valorTransacao = 100;
  const idTransacao = uuidv4();
  const dataCriacaoTransacao = new Date();
  const statusTransacao = new StatusTransacaoValueObject(StatusTransacaoEnum.PENDENTE);
  const msgEnvio = 'Mensagem de envio';
  const msgRetorno = 'Mensagem de retorno';
  const hash_EMVCo = 'hash-emvco';

  it('deve criar uma transação com valores padrão', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    expect(transacao.getIdTransacao()).toBeDefined();
    expect(transacao.getIdPedido()).toBe(idPedido);
    expect(transacao.getValorTransacao()).toBe(valorTransacao);
    expect(transacao.getDataCriacaoTransacao()).toBeInstanceOf(Date);
    expect(transacao.getStatusTransacao()).toBe(StatusTransacaoEnum.PENDENTE);
    expect(transacao.getMsgEnvio()).toBe('');
    expect(transacao.getMsgRetorno()).toBe('');
    expect(transacao.getHash_EMVCo()).toBe('');
  });

  it('deve criar uma transação com todos os valores fornecidos', () => {
    const transacao = new TransactionEntity(
      idPedido,
      valorTransacao,
      idTransacao,
      dataCriacaoTransacao,
      statusTransacao,
      msgEnvio,
      msgRetorno,
      hash_EMVCo
    );

    expect(transacao.getIdTransacao()).toBe(idTransacao);
    expect(transacao.getIdPedido()).toBe(idPedido);
    expect(transacao.getValorTransacao()).toBe(valorTransacao);
    expect(transacao.getDataCriacaoTransacao()).toBe(dataCriacaoTransacao);
    expect(transacao.getStatusTransacao()).toBe(StatusTransacaoEnum.PENDENTE);
    expect(transacao.getMsgEnvio()).toBe(msgEnvio);
    expect(transacao.getMsgRetorno()).toBe(msgRetorno);
    expect(transacao.getHash_EMVCo()).toBe(hash_EMVCo);
  });

  it('deve lançar erro se o valor da transação for inválido', () => {
    expect(() => new TransactionEntity(idPedido, 0)).toThrow(
      'Valor da transação é obrigatório e deve ser maior que zero'
    );
    expect(() => new TransactionEntity(idPedido, -10)).toThrow(
      'Valor da transação é obrigatório e deve ser maior que zero'
    );
  });

  it('deve permitir alterar o status da transação corretamente', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    transacao.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.EM_PROCESSAMENTO));
    expect(transacao.getStatusTransacao()).toBe(StatusTransacaoEnum.EM_PROCESSAMENTO);

    transacao.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO));
    expect(transacao.getStatusTransacao()).toBe(StatusTransacaoEnum.PAGO);
  });

  it('deve lançar erro ao tentar retornar o status para PENDENTE', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    expect(() =>
      transacao.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.PENDENTE))
    ).toThrow('Não é possível retornar o status de transacao para PENDENTE');
  });

  it('deve lançar erro ao tentar forçar o status para PAGO sem estar em processamento', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    expect(() =>
      transacao.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.PAGO))
    ).toThrow('Não é possível forçar a transação para status PAGO');
  });

  it('deve lançar erro ao tentar forçar o status para NEGADO sem estar em processamento', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    expect(() =>
      transacao.setStatusTransacao(new StatusTransacaoValueObject(StatusTransacaoEnum.NEGADO))
    ).toThrow('Não é possível forçar a transação para status NEGADO');
  });

  it('deve permitir alterar a mensagem de envio e retorno', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    transacao.setMsgEnvio('Nova mensagem de envio');
    expect(transacao.getMsgEnvio()).toBe('Nova mensagem de envio');

    transacao.setMsgRetorno('Nova mensagem de retorno');
    expect(transacao.getMsgRetorno()).toBe('Nova mensagem de retorno');
  });

  it('deve permitir alterar o hash EMVCo', () => {
    const transacao = new TransactionEntity(idPedido, valorTransacao);

    transacao.setHash_EMVCo('novo-hash-emvco');
    expect(transacao.getHash_EMVCo()).toBe('novo-hash-emvco');
  });
});
