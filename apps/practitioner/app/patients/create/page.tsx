import { redirect } from "next/navigation";

export default function PatientsCreatePage() {
  redirect("/patients#invite-form");
}
