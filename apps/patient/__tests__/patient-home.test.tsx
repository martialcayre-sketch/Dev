import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientHome from "@/src/components/PatientHome";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/src/services/patient", () => ({
  joinTeleconsult: jest.fn(() => Promise.resolve()),
  startQuestionnaire: jest.fn(() => Promise.resolve()),
  markTodoAsRead: jest.fn(() => Promise.resolve()),
  openDocument: jest.fn(() => Promise.resolve()),
  sendMeasurement: jest.fn(() => Promise.resolve()),
  sendDocument: jest.fn(() => Promise.resolve()),
  bookAppointment: jest.fn(() => Promise.resolve()),
  messagePractitioner: jest.fn(() => Promise.resolve()),
  toggleMeal: jest.fn(() => Promise.resolve({ done: true })),
  toggleSupplement: jest.fn(() => Promise.resolve({ done: true })),
  addRecipeToPlan: jest.fn(() => Promise.resolve()),
}));

describe("PatientHome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche les CTA principales", () => {
    render(<PatientHome />);

    expect(
      screen.getByRole("button", { name: /Rejoindre la visio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Prendre RDV/i }),
    ).toBeInTheDocument();
  });

  it("bascule l'état d'un repas lorsque l'utilisateur clique", async () => {
    render(<PatientHome />);

    const mealToggle = screen.getByTestId("meal-toggle-meal-breakfast");
    expect(mealToggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(mealToggle);

    await waitFor(() => {
      expect(mealToggle).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("marque un document comme lu", async () => {
    render(<PatientHome />);

    const markButton = screen.getByTestId("todo-mark-todo-document-plan");
    expect(markButton).toHaveTextContent("Marquer comme lu");

    await userEvent.click(markButton);

    await waitFor(() => {
      expect(markButton).toHaveTextContent("Lu");
      expect(markButton).toBeDisabled();
    });
  });

  it("redirige vers les routes attendues", async () => {
    render(<PatientHome />);

    await userEvent.click(screen.getByRole("button", { name: /Rejoindre la visio/i }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/teleconsult"));

    pushMock.mockClear();

    await userEvent.click(screen.getByRole("button", { name: /Prendre RDV/i }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/rdv"));
  });
});
