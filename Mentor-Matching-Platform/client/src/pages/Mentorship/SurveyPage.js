// src/pages/SurveyPage.js
import React from "react";
import SurveyForm from "../../components/Survey/SurveyForm";
import MatchResult from "../../components/Match/MatchResult";

const SurveyPage = () => {
  return (
    <div className="mx-auto" style={{ maxWidth: '36rem' /* 36rem ≈ max-w-xl */ }}>
      <h2>Survey</h2>
      <SurveyForm />
      <hr />
      <MatchResult />
    </div>
  );
};

export default SurveyPage;
