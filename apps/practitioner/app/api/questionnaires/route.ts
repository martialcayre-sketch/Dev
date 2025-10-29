import { NextResponse } from "next/server";
import { listQuestionnaireCategories } from "@/lib/questionnaires";

export async function GET() {
  try {
    const categories = await listQuestionnaireCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erreur lors de la lecture des questionnaires", error);
    return NextResponse.json(
      { message: "Impossible de charger les questionnaires" },
      { status: 500 }
    );
  }
}
