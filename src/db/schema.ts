import { pgTable, uuid, varchar, timestamp, time, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --TABELE

export const korisnik = pgTable('korisnik', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  ime: varchar('ime', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

export const predmet = pgTable('predmet', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  naziv: varchar('naziv', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  opis: varchar('opis', { length: 500 }).notNull(), 
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

export const kalendar = pgTable('kalendar', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  datum: date('datum').notNull(),
  opis: varchar('opis', { length: 255 }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

export const raspored = pgTable('raspored', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  danUNedelji: varchar('dan_u_nedelji', { length: 20 }).notNull(),
  vremePocetka: time('vreme_pocetka').notNull(),
  vremeZavrsetka: time('vreme_zavrsetka').notNull(),
  nastavniDan: varchar('nastavni_dan', { length: 50 }),
  predmetId: uuid('predmet_id').references(() => predmet.id).notNull(),
  kalendarId: uuid('kalendar_id').references(() => kalendar.id),
  kabinet: varchar('kabinet', { length: 50 }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
});

export const prisustvo = pgTable('prisustvo', {
  korisnikId: uuid('korisnik_id').references(() => korisnik.id).notNull(),
  rasporedId: uuid('raspored_id').references(() => raspored.id).notNull(),
  datumPrisustva: date('datum_prisustva').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.korisnikId, t.rasporedId, t.datumPrisustva] }),
}));


// --- RELACIJE ---

export const korisnikRelations = relations(korisnik, ({ many }) => ({
  prisustva: many(prisustvo),
}));

export const predmetRelations = relations(predmet, ({ many }) => ({
  rasporedi: many(raspored),
}));

export const kalendarRelations = relations(kalendar, ({ many }) => ({
  rasporedi: many(raspored),
}));

export const rasporedRelations = relations(raspored, ({ one, many }) => ({
  predmet: one(predmet, { fields: [raspored.predmetId], references: [predmet.id] }),
  kalendar: one(kalendar, { fields: [raspored.kalendarId], references: [kalendar.id] }),
  prisustva: many(prisustvo),
}));

export const prisustvoRelations = relations(prisustvo, ({ one }) => ({
  korisnik: one(korisnik, { fields: [prisustvo.korisnikId], references: [korisnik.id] }),
  raspored: one(raspored, { fields: [prisustvo.rasporedId], references: [raspored.id] }),
}));