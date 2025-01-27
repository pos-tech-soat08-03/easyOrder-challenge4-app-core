import { v4 as uuidv4 } from 'uuid';
import { ProdutoEntity } from './ProdutoEntity';

export class PedidoComboEntity {
   private id: string;
   private lanche: ProdutoEntity | null;
   private bebida: ProdutoEntity | null;
   private sobremesa: ProdutoEntity | null;
   private acompanhamento: ProdutoEntity | null;

   constructor(
      lanche: ProdutoEntity | null,
      bebibda: ProdutoEntity | null,
      sobremesa: ProdutoEntity | null,
      acompanhamento: ProdutoEntity | null,
      id?: string
   ) {
      this.lanche = lanche || null;
      this.bebida = bebibda || null;
      this.sobremesa = sobremesa || null;
      this.acompanhamento = acompanhamento || null;

      // RN5. O combo deve ter ao menos um produto informado
      if (!this.lanche && !this.bebida && !this.sobremesa && !this.acompanhamento) {
         throw new Error('Combo deve ter ao menos um produto informado');
      }

      this.id = id || uuidv4();
   }

   public getId(): string {
      return this.id;
   }

   public getLanche(): ProdutoEntity | null {
      return this.lanche;
   }

   public getBebida(): ProdutoEntity | null {
      return this.bebida;
   }

   public getSobremesa(): ProdutoEntity | null {
      return this.sobremesa;
   }

   public getAcompanhamento(): ProdutoEntity | null {
      return this.acompanhamento;
   }

   public getValorTotal(): number {
      let valorTotal = 0;

      if (this.lanche) {
         valorTotal += this.lanche.getPreco();
      }

      if (this.bebida) {
         valorTotal += this.bebida.getPreco();
      }

      if (this.sobremesa) {
         valorTotal += this.sobremesa.getPreco();
      }

      if (this.acompanhamento) {
         valorTotal += this.acompanhamento.getPreco();
      }

      return valorTotal;
   }
}

