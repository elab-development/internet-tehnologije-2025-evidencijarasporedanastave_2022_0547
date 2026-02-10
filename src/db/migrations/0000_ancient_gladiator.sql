CREATE TABLE "kalendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datum" date NOT NULL,
	"opis" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "korisnik" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ime" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "korisnik_slug_unique" UNIQUE("slug"),
	CONSTRAINT "korisnik_email_unique" UNIQUE("email")
);

CREATE TABLE "predmet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"naziv" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"opis" varchar(1000),
	"nastavnik_id" uuid NOT NULL, 
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "predmet_slug_unique" UNIQUE("slug")
);

CREATE TABLE "prisustvo" (
	"korisnik_id" uuid NOT NULL,
	"raspored_id" uuid NOT NULL,
	"datum_prisustva" date NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prisustvo_korisnik_id_raspored_id_datum_prisustva_pk" PRIMARY KEY("korisnik_id","raspored_id","datum_prisustva")
);

CREATE TABLE "raspored" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dan_u_nedelji" varchar(20) NOT NULL,
	"vreme_pocetka" time NOT NULL,
	"vreme_zavrsetka" time NOT NULL,
	"nastavni_dan" varchar(50),
	"predmet_id" uuid NOT NULL,
	"kalendar_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "prisustvo" ADD CONSTRAINT "prisustvo_korisnik_id_korisnik_id_fk" FOREIGN KEY ("korisnik_id") REFERENCES "public"."korisnik"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prisustvo" ADD CONSTRAINT "prisustvo_raspored_id_raspored_id_fk" FOREIGN KEY ("raspored_id") REFERENCES "public"."raspored"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raspored" ADD CONSTRAINT "raspored_predmet_id_predmet_id_fk" FOREIGN KEY ("predmet_id") REFERENCES "public"."predmet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raspored" ADD CONSTRAINT "raspored_kalendar_id_kalendar_id_fk" FOREIGN KEY ("kalendar_id") REFERENCES "public"."kalendar"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "raspored" ADD COLUMN "kabinet" varchar(50);

ALTER TABLE "predmet" ALTER COLUMN "opis" SET DATA TYPE varchar(2000);

ALTER TABLE "prisustvo" ADD CONSTRAINT "status_provera" CHECK (length(status) > 0);