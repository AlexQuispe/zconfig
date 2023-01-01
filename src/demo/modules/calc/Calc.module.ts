import { Message } from './types';

export class CalcModule {
  private message: Message;

  constructor() {
    this.message = { other: 'value' };
  }

  async suma(a: number, b: number): Promise<number> {
    return a + b;
  }

  async resta(a: number, b: number): Promise<number> {
    return a - b;
  }

  async producto(a: number, b: number): Promise<number> {
    return a * b;
  }

  async division(a: number, b: number): Promise<number> {
    return a / b;
  }
}
