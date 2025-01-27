

export class CpfValueObject {

    private value: string;

    constructor(value: string) {

        if (value.length !== 11 || !CpfValueObject.validaEntradaCPF(value)) {
            throw new Error('Entrada de CPF inválida. CPF deve ser inserido sem formatação (11 dígitos)');
        }
        this.value = value;
    }

    static validaEntradaCPF (cpf: string): boolean {
        const cpfNaoFormatadoRegex = /^\d{11}$/;
        return cpfNaoFormatadoRegex.test(cpf);
    }

    static formataCPF (cpf: string): string {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    getValue(): string {
        return this.value;
    }

    getFormatado(): string {
        return CpfValueObject.formataCPF(this.value);
    }
}