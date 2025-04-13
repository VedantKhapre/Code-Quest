import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import questionsData from '../Questions/question.json';
import HintSystem from './HintSystem';
import '../styles/global.css';

const QuestionPanel = ({ currentIndex: propIndex, onQuestionChange, solvedQuestions = [] }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(propIndex || 0);
  
  useEffect(() => {
    setQuestions(questionsData);
  }, []);
  
  useEffect(() => {
    if (propIndex !== undefined && propIndex !== currentIndex) {
      setCurrentIndex(propIndex);
    }
  }, [propIndex]);
  
  const currentQuestion = questions[currentIndex] || {};
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (onQuestionChange) {
        onQuestionChange(newIndex);
      }
    }
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (onQuestionChange) {
        onQuestionChange(newIndex);
      }
    }
  };
  
  const isQuestionSolved = (id) => {
    return solvedQuestions.includes(id);
  };
  
  // Render difficulty stars
  const renderDifficulty = (level) => {
    if (level <= 2) {
      return 'Easy';
    } else if (level === 3) {
      return 'Medium';
    } else if (level >= 4) {
      return 'Hard';
    }
  };

  
  return (
    <div className="question-panel">
      <div className="question-header">
        <span className="question-number">Question {currentQuestion.id || '?'}</span>
        <div className="status-indicators">
          {isQuestionSolved(currentQuestion.id) && (
            <span className="solved-badge">Solved ✓</span>
          )}
          <span className="difficulty">{renderDifficulty(currentQuestion.difficulty || 0)}</span>
        </div>
      </div>
      <div className="question-body">
        <h2 className="question-title">{currentQuestion.name || 'Loading...'}</h2>
        <div className="question-description">
          {currentQuestion.description || 'No description available'}
        </div>
        {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <HintSystem 
                    hints={currentQuestion.hints} 
                    questionId={currentQuestion.id}
                  />
                )}
              </div>
      
      <div className="navigation-buttons">
        <Button 
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          &larr; Previous
        </Button>
        <span className="question-progress">
          {currentIndex + 1} / {questions.length}
        </span>
        <Button 
          className="nav-button"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
};

export default QuestionPanel;