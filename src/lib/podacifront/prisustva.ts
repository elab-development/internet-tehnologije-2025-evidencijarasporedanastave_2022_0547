import type { Prisustvo } from "../types";

export const prisustva: Prisustvo[] = [
    {
        korisnikId: 3, // Nikola Nikolić 
        rasporedId: 1, // Internet Tehnologije 08:15 ponedeljak 
        datum_prisustva: "2024-10-01",
        status: "PRISUTAN"
    },
    {
        korisnikId: 3, // Nikola Nikolić
        rasporedId: 2, // Modelovanje Procesa
        datum_prisustva: "2024-10-03",
        status: "ODSUTAN"
    },
    {
        korisnikId: 2, // Milica Milic (Profesor)
        rasporedId: 1,
        datum_prisustva: "2024-10-01",
        status: "PRISUTAN"
    }
];