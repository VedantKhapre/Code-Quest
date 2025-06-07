import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal } from 'react-bootstrap';
import questionsData from '../Questions/question.json';
import HintSystem from './HintSystem';
import '../styles/global.css';

const QuestionPanel = ({ currentIndex: propIndex, onQuestionChange, solvedQuestions = [] }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(propIndex || 0);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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

  // Render difficulty as badges with different colors
  const renderDifficulty = (level) => {
    if (level <= 2) {
      return <Badge bg="success" style={{ padding: '0.5em 0.7em' }}>Easy</Badge>;
    } else if (level === 3) {
      return <Badge bg="warning" text="dark" style={{ padding: '0.5em 0.7em' }}>Medium</Badge>;
    } else if (level >= 4) {
      return <Badge bg="danger" style={{ padding: '0.5em 0.7em' }}>Hard</Badge>;
    }
    return null;
  };

  return (
    <div className="question-panel">
      <div className="question-header">
        <span className="question-number">
          Question {currentQuestion.question_number || currentQuestion.id || '?'}
        </span>
        <div className="status-indicators">
          {isQuestionSolved(currentQuestion.id) && (
            <span className="solved-badge">Solved ✓</span>
          )}
          <span className="difficulty">{renderDifficulty(currentQuestion.difficulty || 0)}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            style={{ marginLeft: 12 }}
            onClick={handleOpenModal}
            title="Enlarge Question"
          >
            &#128470; {/* Unicode for "enlarge" icon, you can use an SVG/icon if you prefer */}
          </Button>
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Question {currentQuestion.question_number || currentQuestion.id || '?'}: {currentQuestion.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="mb-2">
              <strong>Difficulty:</strong> {renderDifficulty(currentQuestion.difficulty || 0)}
            </div>
            <div>
              <strong>Description:</strong>
              <div style={{ whiteSpace: "pre-line", marginTop: 8 }}>
                {currentQuestion.description || 'No description available'}
              </div>
            </div>
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className="mt-3">
                <HintSystem 
                  hints={currentQuestion.hints} 
                  questionId={currentQuestion.id}
                />
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default QuestionPanel;