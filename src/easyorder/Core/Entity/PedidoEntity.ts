
import { v4 as uuidv4 } from 'uuid';
import { PedidoComboEntity } from './PedidoComboEntity';
import { StatusPagamentoEnum } from './ValueObject/StatusPagamentoEnum';
import { StatusPedidoValueObject, StatusPedidoEnum } from './ValueObject/StatusPedidoValueObject';

export class PedidoEntity {
    private id: string;
    private dataPedido: Date;
    private clienteId: string;
    private statusPedido: StatusPedidoValueObject;
    private statusPagamento: StatusPagamentoEnum;
    private combos: PedidoComboEntity[] = [];

    constructor(
        clienteId: string,
        dataPedido?: Date,
        statusPedido?: StatusPedidoValueObject,
        statusPagamento?: StatusPagamentoEnum,
        id?: string,
        combos?: PedidoComboEntity[]
    ) {
        if (!id) {
            id = uuidv4();
            dataPedido = new Date();
            statusPedido = new StatusPedidoValueObject(StatusPedidoEnum.EM_ABERTO);
            statusPagamento = StatusPagamentoEnum.PENDENTE;
        }

        if (!dataPedido || dataPedido instanceof Date === false) {
            throw new Error('Data do pedido não informada ou inválida na montagem do pedido');
        }

        if (!clienteId) {
            throw new Error('Cliente não informado na montagem do pedido');
        }

        if (!statusPedido) {
            throw new Error('Status do pedido não informado na montagem do pedido');
        }

        if (!statusPagamento) {
            throw new Error('Status do pagamento não informado na montagem do pedido');
        }

        this.dataPedido = dataPedido;
        this.clienteId = clienteId;
        this.statusPedido = statusPedido;
        this.statusPagamento = statusPagamento;
        this.id = id;

        this.combos = combos || [];
    }

    public getId(): string {
        return this.id;
    }

    public getDataPedido(): Date {
        return this.dataPedido;
    }

    public getClienteId(): string {
        return this.clienteId;
    }

    public getStatusPedido(): StatusPedidoValueObject {
        return this.statusPedido;
    }

    public setStatusPedido(status: StatusPedidoValueObject): void {
        if (!status) {
            throw new Error('Status do pedido não informado');
        }

        if (status.getValue() === StatusPedidoEnum.CANCELADO) {
            const statusPermitidos = [
                StatusPedidoEnum.EM_ABERTO,
                StatusPedidoEnum.AGUARDANDO_PAGAMENTO,
            ];

            if (!statusPermitidos.includes(this.statusPedido.getValue())) {
                throw new Error('Status do pedido não permite cancelamento');
            }
        }

        if (status.getValue() === StatusPedidoEnum.AGUARDANDO_PAGAMENTO) {
            // RN2. Para Checkout um pedido, deve existir ao menos um combo vinculado
            if (this.combos.length === 0) {
                throw new Error('Para Checkout um pedido, deve existir ao menos um combo selecionado');
            }

            if (this.statusPedido.getValue() !== StatusPedidoEnum.EM_ABERTO) {
                throw new Error('Status do pedido não permite enviar para pagamento');
            }
        }

        if (status.getValue() === StatusPedidoEnum.RECEBIDO) {
            if (this.statusPedido.getValue() !== StatusPedidoEnum.AGUARDANDO_PAGAMENTO) {
                throw new Error('Status do pedido não permite pagamento');
            }
        }

        if (status.getValue() === StatusPedidoEnum.EM_PREPARACAO) {
            if (this.statusPedido.getValue() !== StatusPedidoEnum.RECEBIDO) {
                throw new Error('Status do pedido não permite início de preparação');
            }
        }

        if (status.getValue() === StatusPedidoEnum.PRONTO) {
            if (this.statusPedido.getValue() !== StatusPedidoEnum.EM_PREPARACAO) {
                throw new Error('Status do pedido não permite finalização de preparação');
            }
        }

        if (status.getValue() === StatusPedidoEnum.FINALIZADO) {
            if (this.statusPedido.getValue() !== StatusPedidoEnum.PRONTO) {
                throw new Error('Status do pedido não permite entrega');
            }
        }

        this.statusPedido = status;
    }

    public getStatusPagamento(): StatusPagamentoEnum {
        return this.statusPagamento;
    }

    public setStatusPagamento(novoStatus: StatusPagamentoEnum): void {
        if (!novoStatus) {
            throw new Error('Status do pagamento não informado');
        }

        if (novoStatus === StatusPagamentoEnum.PAGO) {
            if (this.statusPagamento !== StatusPagamentoEnum.PENDENTE) {
                throw new Error('Somente é possível marcar como pago pedidos com status de pagamento pendente');
            }
        }

        if (novoStatus !== StatusPagamentoEnum.PAGO) {
            if (this.statusPagamento === StatusPagamentoEnum.PAGO) {
                throw new Error('Não é possível alterar o status de pagamento de um pedido já pago');
            }
        }

        this.statusPagamento = novoStatus;
    }

    public getCombos(): PedidoComboEntity[] {
        return this.combos;
    }

    public adicionarCombos(combos: PedidoComboEntity[]): boolean {

        // RN4. Só podemos adicionar ou remover combos ao pedido se este estiver no status EM_ABERTO
        if (this.statusPedido.getValue() !== StatusPedidoEnum.EM_ABERTO) {
            throw new Error('Não é possível adicionar combos a um pedido que não está em aberto');
        }

        if (!combos) {
            throw new Error('Combos não informados');
        }

        combos.forEach(combo => {
            this.combos.push(combo);
        });

        return true;
    }

    public removerCombo(comboId: string): boolean {

        // RN4. Só podemos adicionar ou remover combos ao pedido se este estiver no status EM_ABERTO
        if (this.statusPedido.getValue() !== StatusPedidoEnum.EM_ABERTO) {
            throw new Error('Não é possível remover combos de um pedido que não está em aberto');
        }

        if (!comboId) {
            throw new Error('Combo não informado');
        }

        const index = this.combos.findIndex(combo => combo.getId() === comboId);

        if (index === -1) {
            throw new Error('Combo não encontrado');
        }

        this.combos.splice(index, 1);

        return true;
    }

    public getValorTotal(): number {
        let valorTotal = 0;

        if (this.combos && this.combos.length > 0) {
            this.combos.forEach(combo => {
                valorTotal += combo.getValorTotal();
            });
        }

        return valorTotal;
    }
}