// src/pages/SurveyPage.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import SurveyStart from '../../components/Survey/SurveyStart';
import MatchingPreferences from '../../components/Survey/MatchingPreferences';
import MatchingLifestyle from '../../components/Survey/MatchingLifestyle';
import MatchingEnneagram from '../../components/Survey/MatchingEnneagram';
import SubmitForm from '../../components/Survey/SubmitForm';

const SurveyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Routes>
        <Route path="/" element={<SurveyStart />} />
        <Route path="preferences" element={<MatchingPreferences />} />
        <Route path="lifestyle" element={<MatchingLifestyle />} />
        <Route path="enneagram" element={<MatchingEnneagram />} />
        <Route path="submitform" element={<SubmitForm />} />
      </Routes>
    </div>
  );
};

export default SurveyPage;
