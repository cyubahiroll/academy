const calculateScore = (answers, questions) => {
  let correctCount = 0;
  const totalQuestions = questions.length;

  const results = questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer && userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
    if (isCorrect) correctCount++;
    return {
      question_id: question.id,
      question_text: question.question_text,
      user_answer: userAnswer,
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      explanation: question.explanation
    };
  });

  const score = Math.round((correctCount / totalQuestions) * 100);

  return {
    score,
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount,
    results
  };
};

const hasPassed = (score, passScore) => {
  return score >= passScore;
};

const calculatePoints = (score, difficulty) => {
  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3
  };
  const multiplier = difficultyMultiplier[difficulty] || 1;
  return Math.round(score * multiplier);
};

module.exports = { calculateScore, hasPassed, calculatePoints };
