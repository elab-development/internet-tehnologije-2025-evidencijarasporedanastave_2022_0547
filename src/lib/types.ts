// types.ts

export type UserRole = 'ADMIN' | 'PROFESOR' | 'STUDENT';

export type StatusPrisustva = 'PRISUTAN' | 'ODSUTAN';

export type nastavni_dan = 'RADNI' | 'NERADNI';

export type Korisnik = {
    id: number;
    ime: string;
    email: string;
    password?: string;
    role: UserRole;
};

export type Predmet = {
    id: number;
    naziv: string;
    opis: string;
};

export type Kalendar = {
    id: number;
    datum: string; 
    opis: string;
};

export type Raspored = {
    id: number;
    dan_u_nedelji: string;
    vreme_pocetka: string;
    vreme_zavrsetka: string;
    nastavni_dan: string;
    
    // Relacije
    predmetId: number;
    kalendarId: number;
    
};

export type Prisustvo = {
    datum_prisustva: string;
    status: StatusPrisustva;
    
    // Asocijativna veza
    korisnikId: number;
    rasporedId: number;
    
};