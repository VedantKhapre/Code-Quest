import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Container, Button, Form, Spinner, Alert, Tabs, Tab, Badge, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";
import ChatBot from "./ChatBot.jsx";
import QuestionPanel from "./QuestionPanel.jsx";
import questionsData from "../Questions/question.json";
import { FaExclamationTriangle, FaShieldAlt, FaEye, FaClipboard } from "react-icons/fa";

const CodeEditor = () => {
  const [code, setCode] = useState(`// C++ code here\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`);
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [solutionStatus, setSolutionStatus] = useState(null); // 'accepted', 'wrong', null
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  
  // Anti-cheating state
  const [pasteCount, setPasteCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [monitoringLevel, setMonitoringLevel] = useState("normal"); // "normal", "elevated", "high"
  const [showAntiCheatDetails, setShowAntiCheatDetails] = useState(false);
  const editorRef = useRef(null);
  const previousCodeLength = useRef(0);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
  
    const templates = {
      cpp: `// C++ code here\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`,
      java: `// Java code here\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
      c: `// C code here\n#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
      python: `# Python code here\nprint("Hello, World!")`
    };
  
    setCode(templates[selectedLanguage] || templates.cpp);
  };

  const handleCodeChange = (newValue) => {
    if (newValue && previousCodeLength.current > 0) {
      const lengthDifference = newValue.length - previousCodeLength.current;
      if (lengthDifference > 50) {
        const newActivity = [...suspiciousActivity, {
          type: 'large-paste',
          timestamp: new Date().toISOString(),
          details: `Added ${lengthDifference} characters at once`
        }];
        setSuspiciousActivity(newActivity);
      }
    }
    previousCodeLength.current = newValue ? newValue.length : 0;
    setCode(newValue);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidPaste(() => {
      setPasteCount(prev => prev + 1);
      const newActivity = [...suspiciousActivity, {
        type: 'paste',
        timestamp: new Date().toISOString(),
        details: 'Code pasted into editor'
      }];
      setSuspiciousActivity(newActivity);
      if (pasteCount >= 2) {
        setWarningMessage("Multiple paste actions detected. Please type your solution.");
        setShowWarning(true);
        setMonitoringLevel("elevated");
      }
    });
  };

  useEffect(() => {
    const savedSolved = localStorage.getItem('solvedQuestions');
    if (savedSolved) {
      try {
        setSolvedQuestions(JSON.parse(savedSolved));
      } catch (err) {
        console.error("Failed to parse solved questions", err);
      }
    }
    setStartTime(new Date());
  }, []);

  const handleQuestionChange = (questionIndex) => {
    if (startTime && currentQuestion !== questionIndex) {
      const timeSpent = Math.floor((new Date() - startTime) / 1000);
      const newActivity = [...suspiciousActivity, {
        type: 'question-switch',
        timestamp: new Date().toISOString(),
        details: `Spent ${timeSpent} seconds on question ${currentQuestion + 1}`
      }];
      setSuspiciousActivity(newActivity);
      setStartTime(new Date());
      setPasteCount(0);
    }
    setCurrentQuestion(questionIndex);
    setSolutionStatus(null);
    setOutput("");
    setError(null);
  };

  const checkForHardcodedAnswer = (code, expectedOutput) => {
    const cleanExpectedOutput = expectedOutput.trim().replace(/\s+/g, '');
    const patterns = [
      new RegExp(`cout\\s*<<\\s*["'\`]\\s*${cleanExpectedOutput}\\s*["'\`]`, 'i'),
      new RegExp(`cout\\s*<<\\s*["'\`][^"'\`]*${cleanExpectedOutput}[^"'\`]*["'\`]`, 'i'),
      new RegExp(`System\\.out\\.print(ln)?\\s*\\(\\s*["'\`]\\s*${cleanExpectedOutput}\\s*["'\`]`, 'i'),
      new RegExp(`System\\.out\\.print(ln)?\\s*\\(\\s*["'\`][^"'\`]*${cleanExpectedOutput}[^"'\`]*["'\`]`, 'i'),
      new RegExp(`printf\\s*\\(\\s*["'\`][^"'\`]*${cleanExpectedOutput}[^"'\`]*["'\`]`, 'i'),
      new RegExp(`return\\s*["'\`]\\s*${cleanExpectedOutput}\\s*["'\`]`, 'i'),
    ];
    for (const pattern of patterns) {
      if (pattern.test(code)) {
        return true;
      }
    }
    const codeWithoutComments = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
    const linesOfCode = codeWithoutComments.split('\n').filter(line => line.trim() !== '').length;
    const difficultyLevel = questionsData[currentQuestion]?.difficulty || "medium";
    const isCodeTooSimple =
      (difficultyLevel === 'easy' && linesOfCode < 5) ||
      (difficultyLevel === 'medium' && linesOfCode < 8) ||
      (difficultyLevel === 'hard' && linesOfCode < 12);
    return isCodeTooSimple && code.includes(cleanExpectedOutput);
  };

  const runCode = async () => {
    setLoading(true);
    setError(null);
    setSolutionStatus(null);

    const currentQuestionData = questionsData[currentQuestion];
    const difficultyLevel = currentQuestionData ? currentQuestionData.difficulty || "medium" : "medium";
    let minTimeThreshold, warningTimeThreshold;
    switch (difficultyLevel) {
      case "easy":
        minTimeThreshold = 60;
        warningTimeThreshold = 30;
        break;
      case "medium":
        minTimeThreshold = 120;
        warningTimeThreshold = 60;
        break;
      case "hard":
        minTimeThreshold = 300;
        warningTimeThreshold = 120;
        break;
      default:
        minTimeThreshold = 120;
        warningTimeThreshold = 60;
    }

    if (startTime) {
      const timeSpent = Math.floor((new Date() - startTime) / 1000);
      if (timeSpent < minTimeThreshold) {
        const newActivity = [...suspiciousActivity, {
          type: 'fast-solution',
          timestamp: new Date().toISOString(),
          details: `Solution attempted after only ${timeSpent} seconds (expected minimum: ${minTimeThreshold} seconds for ${difficultyLevel} difficulty)`
        }];
        setSuspiciousActivity(newActivity);
        if (timeSpent < warningTimeThreshold) {
          setWarningMessage(`Solution attempted too quickly for a ${difficultyLevel} difficulty problem. Please take time to understand the problem thoroughly.`);
          setShowWarning(true);
          setMonitoringLevel("high");
        }
      }
    }

    if (currentQuestionData && currentQuestionData.answer) {
      const isHardcoded = checkForHardcodedAnswer(code, currentQuestionData.answer);
      if (isHardcoded) {
        const newActivity = [...suspiciousActivity, {
          type: 'hardcoded-answer',
          timestamp: new Date().toISOString(),
          details: 'Potential hardcoded answer detected'
        }];
        setSuspiciousActivity(newActivity);
        setMonitoringLevel("high");
        setWarningMessage("Your solution appears to simply output the expected answer without implementing the required logic. Please solve the problem using proper algorithms.");
        setShowWarning(true);
      }
    }

    try {
      const response = await axios.post("http://localhost:5000/run", {
        code,
        language,
        metadata: {
          pasteCount,
          timeSpent: startTime ? Math.floor((new Date() - startTime) / 1000) : null,
          suspiciousActivity
        }
      });
      const outputText = response.data.output;
      setOutput(outputText);

      if (currentQuestionData) {
        const cleanOutput = outputText.trim().replace(/\s+/g, '');
        const expectedOutput = currentQuestionData.answer.trim().replace(/\s+/g, '');

        const isHardcoded = checkForHardcodedAnswer(code, currentQuestionData.answer);
        if (cleanOutput === expectedOutput) {
          if (isHardcoded) {
            setOutput(outputText + "\n\n⚠️ Warning: Your solution appears to output the correct answer, but our system detected a potential hardcoded solution. In a real assessment, this might be flagged for review. We recommend implementing a proper algorithm to solve the problem.");
          }
          setSolutionStatus('accepted');
          if (!solvedQuestions.includes(currentQuestionData.id)) {
            const newSolved = [...solvedQuestions, currentQuestionData.id];
            setSolvedQuestions(newSolved);
            localStorage.setItem('solvedQuestions', JSON.stringify(newSolved));

            const token = localStorage.getItem('token');
            if (token) {
              try {
                const response = await fetch('/api/progress', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    questionId: currentQuestionData.id,
                    solved: true,
                    code: code,
                    language: language,
                    token: token,
                    antiCheatData: {
                      pasteCount,
                      timeSpent: startTime ? Math.floor((new Date() - startTime) / 1000) : null,
                      suspiciousActivity,
                      potentialHardcodedSolution: checkForHardcodedAnswer(code, currentQuestionData.answer)
                    }
                  })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Failed to save progress:', errorData.error);
                  if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    alert('Your session has expired. Please log in again.');
                  }
                } else {
                  console.log('Progress saved successfully');
                }
              } catch (error) {
                console.error('Failed to save progress to database:', error);
              }
            }
          }
        } else {
          setSolutionStatus('wrong');
        }
      }
    } catch (err) {
      console.error("Run code error:", err);
      setError(err.response?.data?.error || err.message || "Error running code");
      setOutput(err.response?.data?.output || "Failed to connect to code execution service. Make sure the Docker container is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <div className="code-editor-container">
      <Modal show={showWarning} onHide={handleCloseWarning} centered>
        <Modal.Header closeButton style={{ background: 'var(--error-bg)', color: 'var(--text-color)' }}>
          <Modal.Title>
            <FaExclamationTriangle className="me-2" style={{ color: 'var(--error-text)' }} />
            Suspicious Activity Detected
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--secondary-bg)', color: 'var(--text-color)' }}>
          <p>{warningMessage}</p>
          <p>Our learning integrity system monitors how you solve problems. The timing of solutions is tracked to ensure you're getting the most educational value from each challenge.</p>
          <p><small>Estimated solution times: Easy (1+ min), Medium (2+ min), Hard (5+ min)</small></p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary-bg)', borderTop: '1px solid var(--border-color)' }}>
          <Button variant="secondary" onClick={handleCloseWarning}>
            I Understand
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAntiCheatDetails} onHide={() => setShowAntiCheatDetails(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--secondary-bg)', color: 'var(--text-color)' }}>
          <Modal.Title>
            <FaShieldAlt className="me-2" style={{ color: 'var(--accent-color)' }} />
            Code Integrity System
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--secondary-bg)', color: 'var(--text-color)' }}>
          <h5>What's being monitored:</h5>
          <div className="d-flex flex-wrap mt-3">
            <div className="me-4 mb-3 d-flex align-items-center">
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'rgba(79, 158, 250, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '10px'
              }}>
                <FaClipboard style={{ color: 'var(--accent-color)' }} />
              </div>
              <div>
                <strong>Code Paste Detection</strong>
                <div><small>{pasteCount > 0 ? `${pasteCount} paste events detected` : 'No pastes detected'}</small></div>
              </div>
            </div>
            <div className="me-4 mb-3 d-flex align-items-center">
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'rgba(79, 158, 250, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '10px'
              }}>
                <FaShieldAlt style={{ color: 'var(--accent-color)' }} />
              </div>
              <div>
                <strong>Solution Validation</strong>
                <div><small>Checking for hardcoded answers and logic bypassing</small></div>
              </div>
            </div>
            <div className="me-4 mb-3 d-flex align-items-center">
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'rgba(79, 158, 250, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '10px'
              }}>
                <FaEye style={{ color: 'var(--accent-color)' }} />
              </div>
              <div>
                <strong>Time Tracking</strong>
                <div>
                  <small>
                    {startTime ? (
                      <>
                        {Math.floor((new Date() - startTime) / 1000)} seconds on current question
                        <br/>
                        {(() => {
                          const questionData = questionsData[currentQuestion];
                          const difficulty = questionData ? questionData.difficulty || "medium" : "medium";
                          const expectedTime = difficulty === "easy" ? "60+ sec" : 
                                              difficulty === "medium" ? "120+ sec" : "300+ sec";
                          return `Expected: ${expectedTime} (${difficulty})`;
                        })()}
                      </>
                    ) : 'Not started'}
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <h6>Activity Log:</h6>
            {suspiciousActivity.length > 0 ? (
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px' }}>
                {suspiciousActivity.map((activity, index) => (
                  <div key={index} className="mb-1 d-flex" style={{ fontSize: '0.85rem' }}>
                    <span className="me-2" style={{ color: 'var(--text-muted)' }}>
                      {new Date(activity.timestamp).toLocaleTimeString()}:
                    </span>
                    <span>{activity.details}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p><small>No suspicious activity detected.</small></p>
            )}
          </div>
          <div className="mt-4 p-3" style={{ background: 'var(--hover-bg)', borderRadius: '4px' }}>
            <h6>Why we monitor:</h6>
            <p style={{ fontSize: '0.9rem' }}>
              Code Quest is designed to help you learn programming skills through practice. 
              Our integrity system monitors code entry methods, solution timing, and solution approach 
              to ensure you get the most educational value from each challenge. Simply printing the expected 
              output without implementing the proper algorithm doesn't help you learn.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary-bg)', borderTop: '1px solid var(--border-color)' }}>
          <Button variant="primary" onClick={() => setShowAntiCheatDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <PanelGroup direction="horizontal" className="panel-group">
        <Panel defaultSize={30} minSize={15} maxSize={30}>
          <div className="questions-container">
            <QuestionPanel 
              currentIndex={currentQuestion}
              onQuestionChange={handleQuestionChange}
              solvedQuestions={solvedQuestions}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        <Panel defaultSize={40} minSize={30} maxSize={70}>
          <div className="editor-container">
            <div className="d-flex justify-content-between align-items-center p-2 bg-dark text-white">
              <div className="d-flex align-items-center">
                <h5 className="m-0">Code</h5>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="anti-cheat-tooltip">
                      <strong>Anti-Cheat System Active</strong><br />
                      {monitoringLevel === "normal" && "Normal monitoring"}
                      {monitoringLevel === "elevated" && "Elevated monitoring - paste activity detected"}
                      {monitoringLevel === "high" && "High monitoring - potential integrity issue detected"}
                      <br />
                      <small>Click for details</small>
                    </Tooltip>
                  }
                >
                  <div 
                    className="ms-2 d-flex align-items-center" 
                    style={{ 
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      background: monitoringLevel === "normal" ? 'rgba(0, 255, 0, 0.1)' : 
                                 monitoringLevel === "elevated" ? 'rgba(255, 165, 0, 0.2)' : 
                                 'rgba(255, 0, 0, 0.2)'
                    }}
                    onClick={() => setShowAntiCheatDetails(!showAntiCheatDetails)}
                  >
                    <FaShieldAlt 
                      size={14} 
                      className="me-1" 
                      style={{ 
                        color: monitoringLevel === "normal" ? 'var(--success-text)' : 
                               monitoringLevel === "elevated" ? '#ffc107' : 
                               'var(--error-text)'
                      }} 
                    />
                    <small style={{ fontSize: '0.7rem' }}>
                      {monitoringLevel === "normal" ? "Protected" : 
                       monitoringLevel === "elevated" ? "Warning" : 
                       "Alert"}
                    </small>
                  </div>
                </OverlayTrigger>
              </div>
              <Form.Group className="m-0" style={{ width: "120px" }}>
                <Form.Select size="sm" value={language} onChange={handleLanguageChange}>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                </Form.Select>
              </Form.Group>
            </div>
            <Editor
              height="calc(100% - 40px)"
              language={language}
              theme="vs-dark"
              value={code}
              options={{
                selectOnLineNumbers: true,
                minimap: { enabled: false },
                fontSize: 16,
                renderLineHighlight: 'none',
                contextmenu: false
              }}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        <Panel defaultSize={25} minSize={20} maxSize={40}>
          <div className="output-container">
            <div className="d-flex justify-content-between align-items-center mb-3 px-4">
              <div className="messages-container">
                {error && (
                  <Alert variant="danger" className="mb-0 py-2">
                    <small>{error}</small>
                  </Alert>
                )}
                {solutionStatus === 'accepted' && (
                  <Alert variant="success" className="mb-0 py-2 solution-accepted">
                    <div className="d-flex align-items-center">
                      <span className="checkmark">✓</span>
                      <div>
                        <strong>Solution Accepted!</strong>
                      </div>
                    </div>
                  </Alert>
                )}
                {solutionStatus === 'wrong' && (
                  <Alert variant="warning" className="mb-0 py-2">
                    <div className="d-flex align-items-center">
                      <span className="wrong-mark">✗</span>
                      <div>
                        <strong>Incorrect output</strong>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
              <Button 
                variant="success" 
                onClick={runCode} 
                disabled={loading} 
                className="run-btn"
                size="sm"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Running...</span>
                  </>
                ) : (
                  "▶ Run Code"
                )}
              </Button>
            </div>
            <Tabs defaultActiveKey="output" id="output-tabs" className="mb-0 custom-tabs">
              <Tab eventKey="output" title="Program Output">
                <div className="tab-content-wrapper">
                  <pre className="output-text">{output || "Your code output will appear here..."}</pre>
                </div>
              </Tab>
              <Tab eventKey="chat" title="AI Assistant">
                <div className="tab-content-wrapper">
                  <ChatBot />
                </div>
              </Tab>
            </Tabs>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default CodeEditor;