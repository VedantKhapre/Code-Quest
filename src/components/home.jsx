import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";
import { FaCode, FaPuzzlePiece, FaRobot, FaArrowRight } from "react-icons/fa";

const Home = () => {
  // Check login status from localStorage
  let user = null;
  if (typeof window !== "undefined") {
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {}
  }

  // Determine CTA
  let ctaText = "Get Started";
  let ctaHref = "/signup";
  if (user) {
    ctaText = user.role === "admin" ? "Go to Admin Dashboard" : "Go to Dashboard";
    ctaHref = user.role === "admin" ? "/admin" : "/home";
  }

  return (
    <div className="home-page" style={{ 
      minHeight: "100vh", 
      background: "var(--primary-bg)",
      color: "var(--text-color)"
    }}>
      {/* Hero Section */}
      <Container className="py-5">
        <Row className="align-items-center py-5 px-3">
          <Col lg={7} className="text-lg-start text-center mb-5 mb-lg-0" style={{ zIndex: "1" }}>
            <h1 className="display-4 fw-bold mb-4" style={{ 
              fontSize: "3.5rem", 
              lineHeight: "1.1",
              marginBottom: "1.5rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              Practice coding with<br />
              <span style={{ color: "var(--accent-color)" }}>instant feedback</span>
            </h1>
            <p className="lead" style={{ 
              fontSize: "1.3rem", 
              color: "var(--text-muted)", 
              maxWidth: "90%", 
              marginBottom: "2.5rem",
              marginLeft: "0",
              marginRight: "auto",
              lineHeight: "1.6",
              letterSpacing: "0.01em",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              position: "relative"
            }}>
              <span style={{ 
                position: "relative", 
                zIndex: "1", 
                display: "inline-block" 
              }}>
                Solve challenges, improve your programming skills, and get AI-powered hints when you're stuck.
              </span>
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              href={ctaHref}
              className="d-inline-flex align-items-center" 
              style={{
                background: "var(--accent-color)",
                border: "none",
                padding: "0.8rem 1.8rem",
                fontSize: "1.2rem",
                borderRadius: "10px",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35)",
                transition: "all 0.3s ease",
                fontWeight: "600",
                letterSpacing: "0.02em",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.4)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.35)";
              }}
            >
              {ctaText} <FaArrowRight className="ms-2" />
            </Button>
          </Col>
          <Col lg={5} className="d-none d-lg-block">
            <img 
              src="/HERO.png" 
              alt="Code Quest interactive code editor interface" 
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--border-color)"
              }}
            />
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <div style={{ background: "var(--hover-bg)", paddingTop: "5rem", paddingBottom: "5rem" }}>
        <Container>
          <h2 className="text-center mb-5 fw-bold">
            <span style={{ color: "var(--accent-color)" }}>Everything</span> you need to level up
          </h2>
          <Row className="text-center g-4 justify-content-center">
            <Col md={4}>
              <Card className="mb-4 h-100" style={{ 
                background: "var(--secondary-bg)", 
                color: "var(--text-color)", 
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.25)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
              }}
              >
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <div style={{ 
                    background: "rgba(13, 110, 253, 0.15)", 
                    borderRadius: "50%", 
                    width: "70px", 
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <FaCode size={30} style={{ color: "var(--accent-color)" }} />
                  </div>
                  <Card.Title className="mb-3 fw-bold">Interactive Code Editor</Card.Title>
                  <Card.Text style={{ color: "var(--text-muted)" }}>
                    Write and test your code in real-time with our powerful, in-browser editor.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 h-100" style={{ 
                background: "var(--secondary-bg)", 
                color: "var(--text-color)", 
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.25)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
              }}
              >
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <div style={{ 
                    background: "rgba(25, 135, 84, 0.15)", 
                    borderRadius: "50%", 
                    width: "70px", 
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <FaPuzzlePiece size={30} style={{ color: "var(--success-text)" }} />
                  </div>
                  <Card.Title className="mb-3 fw-bold">Challenging Questions</Card.Title>
                  <Card.Text style={{ color: "var(--text-muted)" }}>
                    Solve a variety of coding problems, track your progress, and climb the leaderboard.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 h-100" style={{ 
                background: "var(--secondary-bg)", 
                color: "var(--text-color)", 
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.25)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
              }}
              >
                <Card.Body className="d-flex flex-column align-items-center p-4">
                  <div style={{ 
                    background: "rgba(13, 202, 240, 0.15)", 
                    borderRadius: "50%", 
                    width: "70px", 
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <FaRobot size={30} style={{ color: "var(--md-accent-primary)" }} />
                  </div>
                  <Card.Title className="mb-3 fw-bold">AI Assistance</Card.Title>
                  <Card.Text style={{ color: "var(--text-muted)" }}>
                    Get help and hints from our AI assistant whenever you're stuck or need inspiration.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;
