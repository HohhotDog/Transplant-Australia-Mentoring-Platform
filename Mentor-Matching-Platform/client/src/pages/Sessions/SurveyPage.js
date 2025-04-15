// src/pages/SurveyPage.js
import React from "react";
import SurveyForm from "../../components/Survey/SurveyForm";
import MatchResult from "../../components/Match/MatchResult";

const SurveyPage = () => {
  return (
    <div>
      <h2>Survey</h2>
      <SurveyForm />
      <hr />
      <MatchResult />
    </div>
  );
};

export default SurveyPage;
