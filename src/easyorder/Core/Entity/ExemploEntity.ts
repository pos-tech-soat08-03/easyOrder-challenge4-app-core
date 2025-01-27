

import { v4 as uuidv4 } from 'uuid';
import { EnderecoValueObject } from './ValueObject/EnderecoValueObject';

export class ExemploEntity {
    id: string;
    nome: string;
    endereco: EnderecoValueObject;

    constructor(nome: string, endereco: EnderecoValueObject, id?: string) {
        this.nome = nome;
        this.endereco = endereco;

        if (!id) {
            id = uuidv4();
        }

        this.id = id;
    }

    getId() {
        return this.id;
    }

    getNome() {
        return this.nome;
    }

    getEndereco() {
        return this.endereco;
    }
}