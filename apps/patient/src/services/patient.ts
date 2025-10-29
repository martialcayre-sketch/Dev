import type { MealPlanItem, SupplementPlanItem } from "@/src/types/patient";

const delay = (ms: number = 450) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
});

export async function joinTeleconsult(): Promise<void> {
  await delay(300);
}

export async function startQuestionnaire(questionnaireId: string): Promise<void> {
  console.info("startQuestionnaire", questionnaireId);
  await delay();
}

export async function markTodoAsRead(todoId: string): Promise<void> {
  console.info("markTodoAsRead", todoId);
  await delay();
}

export async function openDocument(documentId: string): Promise<void> {
  console.info("openDocument", documentId);
  await delay(200);
}

export async function sendMeasurement(kind: string): Promise<void> {
  console.info("sendMeasurement", kind);
  await delay();
}

export async function sendDocument(kind: string): Promise<void> {
  console.info("sendDocument", kind);
  await delay();
}

export async function bookAppointment(): Promise<void> {
  await delay();
}

export async function messagePractitioner(): Promise<void> {
  await delay(250);
}

export async function toggleMeal(
  mealId: MealPlanItem["id"],
  nextDone: MealPlanItem["done"],
): Promise<{ done: MealPlanItem["done"] }> {
  console.info("toggleMeal", { mealId, nextDone });
  await delay(200);
  return { done: nextDone };
}

export async function toggleSupplement(
  supplementId: SupplementPlanItem["id"],
  nextTaken: SupplementPlanItem["done"],
): Promise<{ done: SupplementPlanItem["done"] }> {
  console.info("toggleSupplement", { supplementId, nextTaken });
  await delay(200);
  return { done: nextTaken };
}

export async function addRecipeToPlan(recipeId: string): Promise<void> {
  console.info("addRecipeToPlan", recipeId);
  await delay(350);
}
