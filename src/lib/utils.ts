// src/lib/utils.ts
export function generisiSlug(ime: string): string {
  return ime
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Menja razmake u crtice
    .replace(/[^\w-]+/g, '');       // Uklanja sve što nisu slova i brojevi
}

export function proveriEmailDomen(email: string): boolean {
  return email.toLowerCase().endsWith('@fon.rs');
}