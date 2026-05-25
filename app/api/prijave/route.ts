import { NextRequest, NextResponse } from "next/server";
import { ustvariPrijavo } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Osnovna validacija
    const required = [
      "program",
      "otrok_ime",
      "otrok_priimek",
      "otrok_rojstvo",
      "starsi_ime",
      "starsi_priimek",
      "email",
      "telefon",
    ];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Manjka polje: ${field}` },
          { status: 400 }
        );
      }
    }

    // Email validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Neveljaven email" }, { status: 400 });
    }

    const prijava = await ustvariPrijavo({
      program: data.program,
      otrok_ime: data.otrok_ime,
      otrok_priimek: data.otrok_priimek,
      otrok_rojstvo: data.otrok_rojstvo,
      otrok_znanje: data.otrok_znanje || null,
      starsi_ime: data.starsi_ime,
      starsi_priimek: data.starsi_priimek,
      email: data.email,
      telefon: data.telefon,
      naslov: data.naslov || null,
      posta: data.posta || null,
      opomba: data.opomba || null,
      termin: data.termin || null,
      cena: data.cena || null,
    });

    return NextResponse.json({ uspeh: true, prijava }, { status: 201 });
  } catch (error: any) {
    console.error("Napaka pri shranjevanju prijavnice:", error);
    return NextResponse.json(
      { error: "Napaka pri shranjevanju. Poskusite znova ali pokličite 064 230 888." },
      { status: 500 }
    );
  }
}
