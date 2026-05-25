import { sql } from "@vercel/postgres";

export type Prijava = {
  id: number;
  program: string;
  otrok_ime: string;
  otrok_priimek: string;
  otrok_rojstvo: string;
  otrok_znanje: string | null;
  starsi_ime: string;
  starsi_priimek: string;
  email: string;
  telefon: string;
  naslov: string | null;
  posta: string | null;
  opomba: string | null;
  status: "nova" | "potrjeno" | "placano" | "koncano" | "preklicano";
  termin: string | null;
  cena: number | null;
  ustvarjeno: string;
  posodobljeno: string;
};

export type Program = {
  id: number;
  slug: string;
  naziv: string;
  opis: string | null;
  aktiven: boolean;
  cena_od: number | null;
  ustvarjeno: string;
};

export type Admin = {
  id: number;
  email: string;
  ime: string;
  geslo_hash: string;
  vloga: "admin" | "urednik";
  ustvarjeno: string;
};

// Inicializacija baze - kliče se ob prvem zagonu
export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS programi (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      naziv VARCHAR(200) NOT NULL,
      opis TEXT,
      aktiven BOOLEAN DEFAULT true,
      cena_od INTEGER,
      ustvarjeno TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS prijave (
      id SERIAL PRIMARY KEY,
      program VARCHAR(100) NOT NULL,
      otrok_ime VARCHAR(100) NOT NULL,
      otrok_priimek VARCHAR(100) NOT NULL,
      otrok_rojstvo DATE NOT NULL,
      otrok_znanje VARCHAR(50),
      starsi_ime VARCHAR(100) NOT NULL,
      starsi_priimek VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL,
      telefon VARCHAR(50) NOT NULL,
      naslov VARCHAR(300),
      posta VARCHAR(100),
      opomba TEXT,
      status VARCHAR(50) DEFAULT 'nova',
      termin VARCHAR(200),
      cena INTEGER,
      ustvarjeno TIMESTAMP DEFAULT NOW(),
      posodobljeno TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admini (
      id SERIAL PRIMARY KEY,
      email VARCHAR(200) UNIQUE NOT NULL,
      ime VARCHAR(100) NOT NULL,
      geslo_hash VARCHAR(500) NOT NULL,
      vloga VARCHAR(50) DEFAULT 'admin',
      ustvarjeno TIMESTAMP DEFAULT NOW()
    );
  `;

  // Privzeti programi
  await sql`
    INSERT INTO programi (slug, naziv, aktiven) VALUES
      ('sola-smucanja', 'Tečaji smučanja in bordanja', true),
      ('ski-racing-team', 'Tekmovalne ekipe', true),
      ('smucarska-akademija', 'Smučarska akademija', true),
      ('plavalni-tecaj', 'Tečaj plavanja', true),
      ('sportna-abeceda', 'Športna abeceda', true),
      ('sola-rolanja', 'Tečaj rolanja', true),
      ('praznovanje-rojstnega-dne', 'Rojstni dan z Alpsko šolo', true),
      ('servis', 'Servis smuči', true),
      ('izposoja-opreme', 'Izposoja opreme', true)
    ON CONFLICT (slug) DO NOTHING;
  `;
}

// Helper funkcije
export async function ustvariPrijavo(data: Omit<Prijava, "id" | "status" | "ustvarjeno" | "posodobljeno">) {
  const result = await sql<Prijava>`
    INSERT INTO prijave (
      program, otrok_ime, otrok_priimek, otrok_rojstvo, otrok_znanje,
      starsi_ime, starsi_priimek, email, telefon, naslov, posta, opomba, termin, cena
    ) VALUES (
      ${data.program}, ${data.otrok_ime}, ${data.otrok_priimek}, ${data.otrok_rojstvo}, ${data.otrok_znanje},
      ${data.starsi_ime}, ${data.starsi_priimek}, ${data.email}, ${data.telefon},
      ${data.naslov}, ${data.posta}, ${data.opomba}, ${data.termin}, ${data.cena}
    )
    RETURNING *;
  `;
  return result.rows[0];
}

export async function pridobiPrijave(filter?: {
  program?: string;
  status?: string;
  iskanje?: string;
}) {
  if (filter?.iskanje) {
    const q = `%${filter.iskanje}%`;
    const result = await sql<Prijava>`
      SELECT * FROM prijave
      WHERE otrok_ime ILIKE ${q}
         OR otrok_priimek ILIKE ${q}
         OR email ILIKE ${q}
         OR telefon ILIKE ${q}
      ORDER BY ustvarjeno DESC;
    `;
    return result.rows;
  }

  if (filter?.program && filter?.status) {
    const result = await sql<Prijava>`
      SELECT * FROM prijave
      WHERE program = ${filter.program} AND status = ${filter.status}
      ORDER BY ustvarjeno DESC;
    `;
    return result.rows;
  }

  if (filter?.program) {
    const result = await sql<Prijava>`
      SELECT * FROM prijave WHERE program = ${filter.program} ORDER BY ustvarjeno DESC;
    `;
    return result.rows;
  }

  if (filter?.status) {
    const result = await sql<Prijava>`
      SELECT * FROM prijave WHERE status = ${filter.status} ORDER BY ustvarjeno DESC;
    `;
    return result.rows;
  }

  const result = await sql<Prijava>`SELECT * FROM prijave ORDER BY ustvarjeno DESC;`;
  return result.rows;
}

export async function posodobiStatus(id: number, status: string) {
  await sql`
    UPDATE prijave SET status = ${status}, posodobljeno = NOW() WHERE id = ${id};
  `;
}

export async function izbrisiPrijavo(id: number) {
  await sql`DELETE FROM prijave WHERE id = ${id};`;
}

export async function pridobiProgrami() {
  const result = await sql<Program>`SELECT * FROM programi WHERE aktiven = true ORDER BY naziv;`;
  return result.rows;
}

export async function ustvariProgram(slug: string, naziv: string, opis?: string, cena_od?: number) {
  const result = await sql<Program>`
    INSERT INTO programi (slug, naziv, opis, cena_od) VALUES (${slug}, ${naziv}, ${opis}, ${cena_od})
    RETURNING *;
  `;
  return result.rows[0];
}

export async function pridobiAdminPoEmailu(email: string) {
  const result = await sql<Admin>`SELECT * FROM admini WHERE email = ${email};`;
  return result.rows[0];
}

export async function ustvariAdmina(email: string, ime: string, geslo_hash: string) {
  const result = await sql<Admin>`
    INSERT INTO admini (email, ime, geslo_hash) VALUES (${email}, ${ime}, ${geslo_hash})
    RETURNING *;
  `;
  return result.rows[0];
}

// Statistika za dashboard
export async function pridobiStatistiko() {
  const skupaj = await sql`SELECT COUNT(*)::int AS c FROM prijave;`;
  const nove = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'nova';`;
  const potrjene = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'potrjeno';`;
  const placane = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'placano';`;
  const poProgramih = await sql`
    SELECT program, COUNT(*)::int AS stevilo FROM prijave GROUP BY program ORDER BY stevilo DESC;
  `;

  return {
    skupaj: skupaj.rows[0].c as number,
    nove: nove.rows[0].c as number,
    potrjene: potrjene.rows[0].c as number,
    placane: placane.rows[0].c as number,
    poProgramih: poProgramih.rows as { program: string; stevilo: number }[],
  };
}
