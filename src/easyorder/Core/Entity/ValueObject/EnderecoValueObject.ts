

export class EnderecoValueObject {

    private rua: string;
    private numero: number;

    constructor(rua: string, numero: number) {
        this.rua = rua;
        this.numero = numero;
    }

    getRua() {
        return this.rua;
    }

    getNumero() {
        return this.numero;
    }
}