import fs from "fs/promises";
import path from "path";

export interface QuestionnaireCategory {
  name: string;
  slug: string;
  questionnaires: Array<{
    name: string;
    filePath: string;
  }>;
}

function getQuestionnairesRoot() {
  // Chemin absolu depuis la racine du monorepo
  const monorepoRoot = path.resolve(process.cwd(), "..", "..");
  return path.join(monorepoRoot, "data", "questionnaires", "extracted");
}

export async function listQuestionnaireCategories(): Promise<QuestionnaireCategory[]> {
  try {
    const root = getQuestionnairesRoot();
    
    // Vérifier que le répertoire existe
    try {
      await fs.access(root);
    } catch {
      console.warn(`Questionnaires directory not found at ${root}, returning empty list`);
      return [];
    }
    
    const entries = await fs.readdir(root, { withFileTypes: true });
    const categories: QuestionnaireCategory[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const categoryPath = path.join(root, entry.name);
      const files = await fs.readdir(categoryPath, { withFileTypes: true });

      categories.push({
        name: entry.name.replace(/[-_]/g, " "),
        slug: entry.name,
        questionnaires: files
          .filter((file) => file.isFile() && file.name.toLowerCase().endsWith(".json"))
          .map((file) => ({
            name: file.name.replace(/\.json$/i, ""),
            filePath: path.join(categoryPath, file.name),
          })),
      });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  } catch (error) {
    console.error("Error listing questionnaire categories:", error);
    return [];
  }
}
