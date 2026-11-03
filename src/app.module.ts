import { Module } from "@nestjs/common";
import { DatabaseSync } from "node:sqlite";
import { BUS, BusEnProceso } from "./bus/bus";
import { NatsBus } from "./bus/nats-bus";
import { EncomiendaController } from "./encomienda/encomienda.controller";
import { EncomiendaService } from "./encomienda/encomienda.service";
import { SqliteStore } from "./persistence/sqlite";
import { TrackingGateway } from "./tracking/tracking.gateway";
import { DespachadorWebhooks } from "./webhook/despachador";

@Module({
  controllers: [EncomiendaController],
  providers: [
    EncomiendaService,
    TrackingGateway,
    {
      provide: SqliteStore,
      useFactory: () => new SqliteStore(new DatabaseSync(process.env.MUELLE_DB ?? ":memory:")),
    },
    {
      provide: BUS,
      useFactory: () => {
        const url = process.env.NATS_URL;
        return url ? new NatsBus(url) : new BusEnProceso();
      },
    },
    {
      provide: DespachadorWebhooks,
      useFactory: (store: SqliteStore) => new DespachadorWebhooks(store, store, fetch),
      inject: [SqliteStore],
    },
  ],
})
export class AppModule {}
