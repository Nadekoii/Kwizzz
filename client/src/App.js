import './App.css';
import QuestionsComponent from './components/questions';
import LoginComponent from './components/login';
import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import {Container,Row,Col,Offcanvas} from 'react-bootstrap';
import WatcherComponent from './components/watcher';

const ENDPOINT = "http://localhost:8080";
const socket = openSocket(ENDPOINT, { transports: ['websocket'] });

function App() {

  /* Constants and Variables */ 

  // Message constants 
  const QUIZ_MESSAGE = "quiz";
  const CLIENT_NUMBER_MESSAGE = "num_of_clients";
  const CLIENT_ANSWERS_MESSAGE = "clients_answers";
  const CLIENT_NAMES_MESSAGE = "clients_names";
  const PLAYER_WATCHER_NUMBER_MESSAGE = "player_watcher_number";
  const LOGIN_SUCCESS_MESSAGE = "login_success";
  const LOGIN_ERROR_MESSAGE = "login_error";
  const LOGOUT_SUCCESS_MESSAGE = "logout_success";
  const ROLE_SWITCH_MESSAGE = "role_switch";
  const GAME_STATE_MESSAGE = "game_state";
  const END_GAME_MESSAGE = "end_game";

  // State variables
  const [questions, setQuestions] = useState([]);
  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isPlayer, setIsPlayer] = useState(undefined);
  const [clientCount, setClientCount] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [watcherCount, setWatcherCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [answers, setAnswers] = useState({});
  const [scoreboard, setScoreboard] = useState([]);
  const [userlist,setUserlist] = useState({players: [], watchers: [], guests: []});
  const [gifData, setGifData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Offcanvas for the list of players
  const [showUserlist, setShowUserlist] = useState(false);
  const handleCloseUserlist = () => setShowUserlist(false);
  const handleShowUserlist = () => setShowUserlist(true);

  // Offcanvas for the winners list
  const [showWinners, setShowWinners] = useState(false);
  const handleCloseWinners = () => setShowWinners(false);
  const handleShowWinners = () => setShowWinners(true);

  /* GIPHY API */
  const API_KEY = 'Khw1JVIeduois77g9g90utA9TDo6FpUj';
  // Function to fetch GIFs data
  const gif = async (id) => {
    try {
        const response = await fetch(`https://api.giphy.com/v1/gifs/${id}?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching GIF:', error);
        throw error;
    }
  };

  /* UseEffect to listen to socket events */
  useEffect(() => { 
    // Receiving quiz message
    socket.on(QUIZ_MESSAGE, data => {
      setQuestions(data.quiz);
      console.log(data);
    });

    // Receiving the number of clients
    socket.on(CLIENT_NUMBER_MESSAGE, data => {
      setClientCount(data);
    });
    
    // Receiving the number of players and watchers
    socket.on(PLAYER_WATCHER_NUMBER_MESSAGE, data => {
      setPlayerCount(data.players_count);
      setWatcherCount(data.watchers_count);
      console.log(data);
    });

    // Receiving the list of clients
    socket.on(CLIENT_NAMES_MESSAGE, data => {
      setUserlist(data);
    });

    // Login cases
    socket.on(LOGIN_ERROR_MESSAGE, data => {
      setIsLoggedIn(false);
      alert('Username already taken. Please choose another one.');
    });
    socket.on(LOGIN_SUCCESS_MESSAGE, () => {
      setIsLoggedIn(true);
      setIsPlayer(true);
    });

    // On logout
    socket.on(LOGOUT_SUCCESS_MESSAGE, () => {
      setIsLoggedIn(false);
      setUsername('');
    });

    // Role switch received
    socket.on(ROLE_SWITCH_MESSAGE, data => {
      setIsPlayer(data);
    });

    // Game state received
    socket.on(GAME_STATE_MESSAGE, data => {
      setGameStarted(data);
    });

    // Answers received
    socket.on(CLIENT_ANSWERS_MESSAGE, data => {
      console.log(data);
      setAnswers(data);
    });

    // End game received
    socket.on(END_GAME_MESSAGE, data => {
      setScoreboard(data);
      if (data.length > 0) {
        handleShowWinners();
      }
      setAnswers({})
      setGameStarted(false);
    });

    // GIF fetch
    const fetchGif = async () => {
      try {
          const data = await gif('a6OnFHzHgCU1O');
          setGifData(data);
      } catch (error) {
          setError(error);
      } finally {
          setLoading(false);
      }
    };
    fetchGif();
  }, []);

  // Return the App component
  return ( 
    <div className="App">
      {/* Header */}
      <Container>
        <Row>
          {/* Title card */}
          <Col md={6} className="header rounded-4 mt-3 mb-3 p-3">
              <h1 className="display-1 fw-bold align-items-center text-center">Kwizzz</h1>
              <p className="display-5 align-items-center text-center"> Interactive Multi-User Quiz</p>
          </Col>
          {/* Login component */}
          <Col md={{ span: 5, offset: 1 }} className="login rounded-4 mt-3 mb-3 p-3 d-flex flex-column justify-content-center">
            <LoginComponent socket={socket} username={username} setUsername={setUsername} clientCount={clientCount} playerCount={playerCount} watcherCount={watcherCount} isLoggedIn={isLoggedIn} gameStarted={gameStarted} showUserlist={showUserlist} setShowUserlist={setShowUserlist}/>
          </Col>
        </Row>
      </Container>

      <Container className="questions rounded-4 mb-3 p-3">
        {/* Questions component */}
        {isLoggedIn ? (
          gameStarted ? (
            isPlayer ? (
              /* Player's view */
              <QuestionsComponent questions={questions} answers={answers} socket={socket} isLoggedIn={isLoggedIn} playerCount={playerCount} gameStarted={gameStarted}></QuestionsComponent>
            ) : (
              /* Watcher's view */
              <WatcherComponent questions={questions} answers={answers} socket={socket} playerCount={playerCount}></WatcherComponent>
            )
          ) : (
            /* Game lobby */
            <Container className="d-flex justify-content-center align-items-center" style={{ textAlign: 'center', height: '45vh' }}>
              <h1 style={{ fontWeight: 'bold' }}> Waiting for the game to start...</h1>
            </Container>
          )
        ) : (
          /* Not logged in */
          <Container className="d-flex justify-content-center align-items-center" style={{ textAlign: 'center', height: '45vh' }}>
            <h1 style={{ fontWeight: 'bold' }}> Please login to join and watch the game</h1>
          </Container>
        )}
      </Container>

      {/* Offcanvas for the list of players */}
      <Offcanvas show={showUserlist} onHide={handleCloseUserlist} style={{ backgroundColor: '#f8f9fa' }}>
        <Offcanvas.Header closeButton closeVariant='white' style={{ backgroundColor: '#343a40', color: '#fff' }}>
          <Offcanvas.Title>
            <h1>Users</h1>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Row>
            {/* Display the list of players, watchers and guests */}
            <Col>
              <h4 style={{ color: '#dc3545' }}>Players</h4>
              <ul>
                  {userlist.players.map((player, index) => {
                      return <li key={index}>{player}</li>
                })}
              </ul>
              <h4 style={{ color: '#007bff' }}>Watchers</h4>
              <ul>
                  {userlist.watchers.map((watcher, index) => (
                      <li key={index}>{watcher}</li>
                  ))}
              </ul>
              <h4 style={{ color: '#28a745' }}>Guests</h4>
              <ul>
                  {userlist.guests.map((guest, index) => (
                      <li key={index}>{guest}</li>
                  ))}
              </ul>
            </Col>
            {/* Display the scores of the players if they participated to the last game*/}
            <Col>
              <Row>
                <Col>
                  <h4 style={{ color: '#dc3545' }}>Scores</h4>
                  <ul>
                  {userlist.players.map((player, i) => {
                      const playerScore = scoreboard.find(player_score => player_score.player === player);
                      return (
                          <li key={i}>
                            {playerScore ? `${playerScore.score}` : ''}
                          </li>
                      );
                  })}
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Offcanvas for announcing winners */}
      <Offcanvas show={showWinners} onHide={handleCloseWinners} placement='end'>
        <Offcanvas.Header closeButton closeVariant='white' style={{ backgroundColor: '#FFD700'}}>
          <Offcanvas.Title>
            <h1>Winner winner chicken dinner</h1>
          </Offcanvas.Title>
        </Offcanvas.Header >
        <Offcanvas.Body className="d-flex flex-column align-items-center">
          {/* Display the top 3 players */}
          <Row className="w-100 text-center mb-5">
              {scoreboard.length > 0 && (
                <Col>
                  <h2>1st Place</h2>
                  <h5>{scoreboard[0].player} : {scoreboard[0].score}</h5>
                </Col>
              )} 
              {scoreboard.length > 1 && (
                <Col className="w-100 text-center mt-1">
                  <h3>2nd Place</h3>
                  <h5>{scoreboard[1].player} : {scoreboard[1].score}</h5>
                </Col>
              )}   
              {scoreboard.length > 2 && (
                <Col className="w-100 text-center mt-2">
                  <h4>3rd Place</h4>
                  <h5>{scoreboard[2].player} : {scoreboard[2].score}</h5>
                </Col>
              )}
          </Row>
          {/* Display the Giphy's GIF */}
          <Row className='mt-5'>
              {loading ? (
                  <p>Loading GIF...</p>
              ) : error ? (
                  <p>Error fetching GIF: {error.message}</p>
              ) : (
                  gifData && <img src={gifData.images.original.url} alt={gifData.title} />
              )}
          </Row>
        </Offcanvas.Body>
      </Offcanvas>          
      
      {/* Footer */}
      <Container>
        <Row>
          <footer id="site-footer" className="rounded-4 mt-3 mb-3">
            <p>Copyright &copy;KWIZZZ 2024</p>
          </footer>
        </Row>
      </Container>
    </div>
  );
}

export default App;
