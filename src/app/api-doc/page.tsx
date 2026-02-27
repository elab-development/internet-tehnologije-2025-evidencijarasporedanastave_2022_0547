'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => <p style={{ padding: '20px' }}>Učitavanje API specifikacije...</p>
});

export default function ApiDocPage() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'API Evidencija Nastave i Rasporeda',
      version: '1.0.0',
      description: 'Kompletna API specifikacija za ITEH projekat (Indeks: 2022/0547). Dokumentacija obuhvata rute za autentifikaciju, upravljanje korisnicima, rasporedom i prisustvom.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Lokalni Docker server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
        },
      },
    },
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Autentifikacija'],
          summary: 'Prijava na sistem',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@test.com' },
                    password: { type: 'string', example: 'admin123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Uspešna prijava' },
            401: { description: 'Neispravni podaci' }
          }
        }
      },
      '/api/auth/register': {
        post: {
          tags: ['Autentifikacija'],
          summary: 'Registracija novog korisnika',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['STUDENT', 'TEACHER'] }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Korisnik kreiran' }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Autentifikacija'],
          summary: 'Odjava sa sistema',
          responses: {
            200: { description: 'Uspešna odjava' }
          }
        }
      },

      '/api/user/profile': {
        get: {
          tags: ['Korisnik'],
          summary: 'Dobavljanje podataka o ulogovanom korisniku',
          responses: {
            200: { description: 'Podaci o profilu' }
          }
        }
      },
      '/api/user/update': {
        post: {
          tags: ['Korisnik'],
          summary: 'Ažuriranje profila korisnika',
          responses: {
            200: { description: 'Profil uspešno ažuriran' }
          }
        }
      },

      '/api/raspored': {
        get: {
          tags: ['Raspored'],
          summary: 'Pregled celokupnog rasporeda nastave',
          responses: {
            200: { description: 'Lista termina nastave' }
          }
        }
      },
      '/api/prisustvo': {
        get: {
          tags: ['Prisustvo'],
          summary: 'Pregled evidencije prisustva',
          responses: {
            200: { description: 'Lista prisustava' }
          }
        },
        post: {
          tags: ['Prisustvo'],
          summary: 'Evidentiranje novog prisustva',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    scheduleId: { type: 'number' },
                    studentId: { type: 'number' },
                    status: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Prisustvo zabeleženo' }
          }
        }
      },

      '/api/kalendar': {
        get: {
          tags: ['Kalendar'],
          summary: 'Dobavljanje događaja za kalendarski prikaz',
          responses: {
            200: { description: 'Lista kalendarskih događaja' }
          }
        }
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white' }}>
        <h1>Swagger API Dokumentacija</h1>
      </div>
      <SwaggerUI spec={spec} />
    </div>
  );
}