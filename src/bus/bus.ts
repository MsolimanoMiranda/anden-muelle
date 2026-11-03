export const BUS = Symbol("BUS");

export interface Bus {
  publicar(tema: string, payload: unknown): Promise<void>;
}

export class BusEnProceso implements Bus {
  readonly publicados: { tema: string; payload: unknown }[] = [];

  async publicar(tema: string, payload: unknown): Promise<void> {
    this.publicados.push({ tema, payload });
  }
}
