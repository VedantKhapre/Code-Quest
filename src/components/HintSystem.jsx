import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const HintSystem = ({ hints = [], questionId }) => {
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Reset hint visibility when questionId changes
  useEffect(() => {
    setShowHint(false);
    setCurrentHintIndex(0);
  }, [questionId]);

  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  const handleNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handlePrevHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  return (
    <div className="hint-system">
      <Button 
        variant="info" 
        size="sm" 
        onClick={handleShowHint}
        disabled={currentHintIndex >= hints.length}
      >
        Need a hint? ({currentHintIndex + 1}/{hints.length})
      </Button>

      {showHint && (
        <div className="hint-display">
          <div className="hint-header">
            <h5>Hint {currentHintIndex + 1}</h5>
          </div>
          <div className="hint-content">
            {hints[currentHintIndex]}
          </div>
          <div className="hint-footer">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handlePrevHint}
              disabled={currentHintIndex === 0}
            >
              Previous Hint
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleNextHint}
              disabled={currentHintIndex === hints.length - 1}
            >
              Next Hint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HintSystem;