import type { EstadoEncomienda } from "../../contracts/eventos";

const ORDEN: EstadoEncomienda[] = ["recibida", "en_ruta", "entregada"];

export class ReglaDeNegocio extends Error {}

export class Encomienda {
  constructor(
    readonly id: string,
    readonly destinatario: string,
    readonly destino: string,
    public estado: EstadoEncomienda = "recibida",
  ) {}

  avanzar(): EstadoEncomienda {
    const indice = ORDEN.indexOf(this.estado);
    if (indice === ORDEN.length - 1) {
      throw new ReglaDeNegocio("La encomienda ya fue entregada");
    }
    this.estado = ORDEN[indice + 1];
    return this.estado;
  }
}
