

export class EmailValueObject {

    private value: string;

    constructor(value: string) {

        if (value) {
            if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error('O email deve estar no formato a-z@az-.az');
            }
        }
        this.value = value;
    }

    getValue(): string {
        return this.value;
    }
}