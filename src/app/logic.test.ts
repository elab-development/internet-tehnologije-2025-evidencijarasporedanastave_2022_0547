// src/app/logic.test.ts
import { expect, test, describe } from 'vitest';
import { generisiSlug, proveriEmailDomen } from '../lib/utils';

describe('Testovi logike aplikacije', () => {
  
  test('generisiSlug bi trebalo da ispravno formatira ime i prezime', () => {
    const unos = "Petar Petrovic"; // Koristimo 'c' umesto 'ć' za test
    const rezultat = generisiSlug(unos);
    expect(rezultat).toBe('petar-petrovic');
  });

  test('proveriEmailDomen bi trebalo da prepozna @fon.rs adresu', () => {
    expect(proveriEmailDomen('marko@fon.rs')).toBe(true);
    expect(proveriEmailDomen('test@gmail.com')).toBe(false);
  });

  test('generisiSlug bi trebalo da radi sa vise razmaka', () => {
    const unos = "  Marko   Markovic  ";
    const rezultat = generisiSlug(unos);
    expect(rezultat).toBe('marko-markovic');
  });

});