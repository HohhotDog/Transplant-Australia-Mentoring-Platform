import React from 'react';
import EnneagramQuiz from '../components/Survey/EnneagramQuiz';

const EnneagramPage = () => {
  const userId = 1; // Replace this with your actual logged-in user ID logic
  return <EnneagramQuiz userId={userId} />;
};

export default EnneagramPage;
