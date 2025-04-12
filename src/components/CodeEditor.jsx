import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Container, Button, Form, Spinner, Alert, Tabs, Tab, Badge } from "react-bootstrap";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";
import ChatBot from "./ChatBot.jsx";
import QuestionPanel from "./QuestionPanel.jsx";
import questionsData from "../Questions/question.json";

const CodeEditor = () => {
  const [code, setCode] = useState(`// C++ code here\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`);
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [solutionStatus, setSolutionStatus] = useState(null); // 'accepted', 'wrong', null
  const [solvedQuestions, setSolvedQuestions] = useState([]);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setCode(
      selectedLanguage === "cpp"
        ? `// C++ code here\n#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`
        : `// Java code here\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`
    );
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue);
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
  }, []);

  const handleQuestionChange = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setSolutionStatus(null);
    setOutput("");
    setError(null);
  };

  const runCode = async () => {
    setLoading(true);
    setError(null);
    setSolutionStatus(null);
    
    try {
      const response = await axios.post("http://localhost:5000/run", { code, language });
      const outputText = response.data.output;
      setOutput(outputText);
      
      const currentQuestionData = questionsData[currentQuestion];
      if (currentQuestionData) {
        const cleanOutput = outputText.trim().replace(/\s+/g, '');
        const expectedOutput = currentQuestionData.answer.trim().replace(/\s+/g, '');
        
        if (cleanOutput === expectedOutput) {
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
                    token: token
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
      setError(err.response?.data?.error || "Error running code");
      setOutput(err.response?.data?.output || "Failed to connect to code execution service. Make sure the Docker container is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="code-editor-container">
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
              <h5 className="m-0">Code</h5>
              <Form.Group className="m-0" style={{ width: "120px" }}>
                <Form.Select size="sm" value={language} onChange={handleLanguageChange}>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
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
              }}
              onChange={handleCodeChange}
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
    </Container>
  );
}

export default CodeEditor;
