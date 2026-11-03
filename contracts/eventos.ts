/**
 * Contrato compartido. En un repo aparte se publica como submódulo:
 *   git submodule add git@github.com:TU_USUARIO/muelle-contracts.git projects/nest-muelle/contracts
 */
export const Temas = {
  encomiendaAvanzada: "encomienda.avanzada",
} as const;

export type EventoEncomienda = {
  id: string;
  estado: EstadoEncomienda;
  en: string;
};

export type EstadoEncomienda = "recibida" | "en_ruta" | "entregada";
