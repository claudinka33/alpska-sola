import { NextRequest, NextResponse } from "next/server";
import { initDatabase, pridobiAdminPoEmailu, ustvariAdmina } from "@/lib/db";
import { hashGeslo } from "@/lib/auth";

const SETUP_KEY = process.env.SETUP_KEY || "alpska-setup-2026";

export async function POST(req: NextRequest) {
  const { kljuc, admin_email, admin_geslo, admin_ime } = await req.json();

  if (kljuc !== SETUP_KEY) {
    return NextResponse.json({ error: "Napačen ključ" }, { status: 401 });
  }

  try {
    await initDatabase();

    // Ustvari prvega admina, če je podan
    if (admin_email && admin_geslo) {
      const obstaja = await pridobiAdminPoEmailu(admin_email);
      if (!obstaja) {
        const hash = await hashGeslo(admin_geslo);
        await ustvariAdmina(admin_email, admin_ime || "Admin", hash);
      }
    }

    return NextResponse.json({ uspeh: true, sporocilo: "Baza pripravljena ✓" });
  } catch (error: any) {
    console.error("Napaka pri setup:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
