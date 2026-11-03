import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Temas, type EventoEncomienda } from "../../contracts/eventos";
import { BUS, type Bus } from "../bus/bus";
import { SqliteStore } from "../persistence/sqlite";
import { TrackingGateway } from "../tracking/tracking.gateway";
import { DespachadorWebhooks } from "../webhook/despachador";
import { Encomienda, ReglaDeNegocio } from "./encomienda";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class EncomiendaService {
  constructor(
    private readonly store: SqliteStore,
    @Inject(BUS) private readonly bus: Bus,
    private readonly webhooks: DespachadorWebhooks,
    private readonly tracking: TrackingGateway,
  ) {}

  crear(destinatario: string, destino: string): Encomienda {
    if (!destinatario.trim() || !destino.trim()) {
      throw new BadRequestException("Destinatario y destino son obligatorios");
    }
    const encomienda = new Encomienda(randomUUID(), destinatario.trim(), destino.trim());
    this.store.guardarEncomienda(encomienda);
    return encomienda;
  }

  obtener(id: string): Encomienda {
    const encomienda = this.store.obtenerEncomienda(id);
    if (!encomienda) throw new NotFoundException("Encomienda no encontrada");
    return encomienda;
  }

  async avanzar(id: string): Promise<Encomienda> {
    const encomienda = this.obtener(id);
    try {
      encomienda.avanzar();
    } catch (error) {
      if (error instanceof ReglaDeNegocio) throw new BadRequestException(error.message);
      throw error;
    }
    this.store.guardarEncomienda(encomienda);
    const evento: EventoEncomienda = {
      id: encomienda.id,
      estado: encomienda.estado,
      en: new Date().toISOString(),
    };
    await this.bus.publicar(Temas.encomiendaAvanzada, evento);
    await this.webhooks.despachar(evento);
    this.tracking.emitir(encomienda.id, encomienda.estado);
    return encomienda;
  }
}
