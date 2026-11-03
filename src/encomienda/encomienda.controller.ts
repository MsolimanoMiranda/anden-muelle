import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { SqliteStore } from "../persistence/sqlite";
import { EncomiendaService } from "./encomienda.service";

@Controller()
export class EncomiendaController {
  constructor(
    private readonly encomiendas: EncomiendaService,
    private readonly store: SqliteStore,
  ) {}

  @Post("encomiendas")
  crear(@Body() body: { destinatario?: string; destino?: string }) {
    return this.encomiendas.crear(body.destinatario ?? "", body.destino ?? "");
  }

  @Get("encomiendas/:id")
  obtener(@Param("id") id: string) {
    return this.encomiendas.obtener(id);
  }

  @Post("encomiendas/:id/avanzar")
  avanzar(@Param("id") id: string) {
    return this.encomiendas.avanzar(id);
  }

  @Post("suscripciones")
  suscribir(@Body() body: { url?: string; secreto?: string }) {
    const suscripcion = {
      id: randomUUID(),
      url: body.url ?? "",
      secreto: body.secreto ?? "",
      evento: "encomienda.avanzada",
    };
    this.store.guardar(suscripcion);
    return suscripcion;
  }

  @Get("entregas")
  entregas() {
    return this.store.listar();
  }
}
