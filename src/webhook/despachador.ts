import { createHmac, randomUUID } from "node:crypto";
import type { EventoEncomienda } from "../../contracts/eventos";

export type Suscripcion = {
  id: string;
  url: string;
  secreto: string;
  evento: string;
};

export type Entrega = {
  id: string;
  suscripcionId: string;
  ok: boolean;
  codigo: number;
  cuerpo: string;
};

export interface SuscripcionRepositorio {
  guardar(suscripcion: Suscripcion): void;
  paraEvento(evento: string): Suscripcion[];
}

export interface EntregaRepositorio {
  registrar(entrega: Entrega): void;
  listar(): Entrega[];
}

export function firmar(secreto: string, cuerpo: string): string {
  return createHmac("sha256", secreto).update(cuerpo).digest("hex");
}

export class DespachadorWebhooks {
  constructor(
    private readonly suscripciones: SuscripcionRepositorio,
    private readonly entregas: EntregaRepositorio,
    private readonly fetchImpl: typeof fetch,
  ) {}

  async despachar(evento: EventoEncomienda): Promise<void> {
    const cuerpo = JSON.stringify(evento);
    for (const sub of this.suscripciones.paraEvento("encomienda.avanzada")) {
      const firma = firmar(sub.secreto, cuerpo);
      let ok = false;
      let codigo = 0;
      try {
        const respuesta = await this.fetchImpl(sub.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-anden-firma": firma,
          },
          body: cuerpo,
        });
        codigo = respuesta.status;
        ok = respuesta.ok;
      } catch {
        ok = false;
      }
      this.entregas.registrar({
        id: randomUUID(),
        suscripcionId: sub.id,
        ok,
        codigo,
        cuerpo,
      });
    }
  }
}
