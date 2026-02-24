CREATE TABLE "reset_zahtev" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"vreme" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "predmet" ADD COLUMN "nastavnik_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "raspored" ADD COLUMN "kabinet" varchar(50);--> statement-breakpoint
ALTER TABLE "predmet" ADD CONSTRAINT "predmet_nastavnik_id_korisnik_id_fk" FOREIGN KEY ("nastavnik_id") REFERENCES "public"."korisnik"("id") ON DELETE no action ON UPDATE no action;