import './App.css';
import QuestionsComponent from './components/questions';
import LoginComponent from './components/login';
import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ENDPOINT = "http://localhost:8080";
const socket = openSocket(ENDPOINT, { transports: ['websocket'] });

const sampleQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: [
      { text: "Berlin", isCorrect: false },
      { text: "Madrid", isCorrect: false },
      { text: "Paris", isCorrect: true },
      { text: "Rome", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: [
      { text: "Earth", isCorrect: false },
      { text: "Mars", isCorrect: true },
      { text: "Jupiter", isCorrect: false },
      { text: "Saturn", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: [
      { text: "Harper Lee", isCorrect: true },
      { text: "Mark Twain", isCorrect: false },
      { text: "Ernest Hemingway", isCorrect: false },
      { text: "F. Scott Fitzgerald", isCorrect: false }
    ]
  }
];

function App() {

  const [questions, setQuestions] = useState(sampleQuestions);

  useEffect(() => {
    socket.on("quiz", data => {
      setQuestions(data.quiz);
    });
  }, []);

  return ( 
    <div className="App pt-4">
      <Container>
        <Row>
          <Col md={7} className="header rounded-4 mb-3">
              <h1 className="display-1 fw-bold align-items-center text-center">Kwizzz</h1>
              <p className="display-5 align-items-center text-center"> Interactive and Multi-User Quizz.</p>
          </Col>
          <LoginComponent/>
        </Row>
      </Container>

      <QuestionsComponent questions={questions} socket={socket}></QuestionsComponent>
          
      <Container>
        <Row>
          <footer id="site-footer">
            <p>Copyright &copy;KWIZZZ 2024</p>
          </footer>
        </Row>
      </Container>
    </div>
  );
}

export default App;
