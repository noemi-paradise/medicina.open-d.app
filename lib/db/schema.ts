import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  inet,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const compromisos = pgTable(
  "compromisos",
  {
    id: serial("id").primaryKey(),
    nombre: varchar("nombre", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailHash: varchar("email_hash", { length: 255 }).notNull(),
    pais: varchar("pais", { length: 10 }).notNull().default("ES"),
    comprometidoEn: timestamp("comprometido_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
    confirmado: boolean("confirmado").notNull().default(false),
    confirmadoEn: timestamp("confirmado_en", { withTimezone: true }),
    activo: boolean("activo").notNull().default(true),
    token: varchar("token", { length: 255 }).notNull().unique(),
    ip: inet("ip"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    emailHashIdx: index("idx_compromisos_email_hash").on(table.emailHash),
    activoIdx: index("idx_compromisos_activo").on(table.activo, table.confirmado),
    tokenIdx: index("idx_compromisos_token").on(table.token),
  })
);

export const casos = pgTable(
  "casos",
  {
    id: serial("id").primaryKey(),
    solicitanteNombre: varchar("solicitante_nombre", { length: 255 }).notNull(),
    solicitanteEmail: varchar("solicitante_email", { length: 255 }).notNull(),
    medicinaDenegada: varchar("medicina_denegada", { length: 255 }).notNull(),
    autoridadNombre: varchar("autoridad_nombre", { length: 255 }).notNull(),
    autoridadCiudad: varchar("autoridad_ciudad", { length: 255 }).notNull(),
    autoridadRegion: varchar("autoridad_region", { length: 255 }).notNull(),
    autoridadTipo: varchar("autoridad_tipo", { length: 50 }).notNull(),
    historia: text("historia"),
    anonimo: boolean("anonimo").notNull().default(false),
    estado: varchar("estado", { length: 50 }).notNull().default("recogiendo"),
    creadoEn: timestamp("creado_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
    cartaGeneradaEn: timestamp("carta_generada_en", { withTimezone: true }),
    firmasCount: integer("firmas_count").notNull().default(0),
    reportesCount: integer("reportes_count").notNull().default(0),
    tokenSeguimiento: varchar("token_seguimiento", { length: 255 })
      .notNull()
      .unique(),
    ip: inet("ip"),
    limiteReenvio: timestamp("limite_reenvio", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolucion: text("resolucion"),
    resueltoEn: timestamp("resuelto_en", { withTimezone: true }),
  },
  (table) => ({
    estadoIdx: index("idx_casos_estado").on(table.estado),
    creadoIdx: index("idx_casos_creado").on(table.creadoEn),
    tokenIdx: index("idx_casos_token").on(table.tokenSeguimiento),
    emailIdx: index("idx_casos_email").on(table.solicitanteEmail),
  })
);

export const firmas = pgTable(
  "firmas",
  {
    id: serial("id").primaryKey(),
    casoId: integer("caso_id")
      .notNull()
      .references(() => casos.id, { onDelete: "cascade" }),
    compromisoId: integer("compromiso_id")
      .notNull()
      .references(() => compromisos.id, { onDelete: "cascade" }),
    firmadoEn: timestamp("firmado_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
    nombreEnCarta: varchar("nombre_en_carta", { length: 255 }).notNull(),
    ip: inet("ip"),
    token: varchar("token", { length: 255 }).notNull().unique(),
  },
  (table) => ({
    casoIdx: index("idx_firmas_caso").on(table.casoId),
    compromisoIdx: index("idx_firmas_compromiso").on(table.compromisoId),
    tokenIdx: index("idx_firmas_token").on(table.token),
    uniqueCasoCompromiso: unique("unique_caso_compromiso").on(
      table.casoId,
      table.compromisoId
    ),
  })
);

export const logsEmail = pgTable(
  "logs_email",
  {
    id: serial("id").primaryKey(),
    compromisoId: integer("compromiso_id").references(() => compromisos.id),
    casoId: integer("caso_id").references(() => casos.id),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    enviadoEn: timestamp("enviado_en", { withTimezone: true })
      .notNull()
      .defaultNow(),
    estado: varchar("estado", { length: 50 }).notNull().default("enviado"),
    resendId: varchar("resend_id", { length: 255 }),
  },
  (table) => ({
    casoIdx: index("idx_logs_email_caso").on(table.casoId),
    tipoIdx: index("idx_logs_email_tipo").on(table.tipo),
  })
);
