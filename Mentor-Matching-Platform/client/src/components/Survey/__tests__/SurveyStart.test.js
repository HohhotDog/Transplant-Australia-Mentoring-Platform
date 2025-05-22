import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SurveyStart from "../SurveyStart";

// Mock fetch responses
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.startsWith("/api/profile")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            profile: {
              first_name: "Amrita",
              last_name: "Manoj",
              date_of_birth: "1999-08-04",
              address: "123 Perth Lane",
              gender: "Female",
              aboriginal_or_torres_strait_islander: false,
              language_spoken_at_home: "English",
              living_situation: "With Family",
            },
          }),
      });
    }

    if (url.startsWith("/api/form-status")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            submitted: false,
          }),
      });
    }

    return Promise.reject(new Error("Unknown API call"));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderWithRouter(url = "/survey?sessionId=1") {
  window.history.pushState({}, "Test page", url);
  return render(
    <BrowserRouter>
      <SurveyStart />
    </BrowserRouter>
  );
}

test("renders profile fields from API", async () => {
  renderWithRouter();

  expect(await screen.findByDisplayValue("Amrita")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("Manoj")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("1999-08-04")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("123 Perth Lane")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("Female")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("No")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("English")).toBeInTheDocument();
  expect(await screen.findByDisplayValue("With Family")).toBeInTheDocument();
});

test("disables Next button until a role is selected", async () => {
  renderWithRouter();
  const nextButton = screen.getByRole("button", { name: /Next/i });
  expect(nextButton).toBeDisabled();

  const menteeButton = await screen.findByRole("button", { name: "Mentee" });
  fireEvent.click(menteeButton);

  expect(nextButton).toBeEnabled();
});
