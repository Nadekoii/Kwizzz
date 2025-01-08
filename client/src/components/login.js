import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';

function LoginComponent(props) {
    {/* State Variables */}
    const [radioValue, setRadioValue] = useState('1');
    const radios = [
        { name: 'Player', value: '1' },
        { name: 'Watcher', value: '2' },
      ];

    // Login function
    const handleLogin = () => {
        if (props.username !== '') {
            console.log(`User ${props.username} logged in`);
            props.socket.emit('login', props.username);
        }
    };

    // Logout function
    const handleLogout = () => {
        console.log(`User ${props.username} logged out`);
        props.socket.emit('logout', props.username);
    };

    // Role switch function
    const handleRoleSwitch = () => {
        props.socket.emit('roleswitch');
    }

    // Game start function
    const handleGameStart = () => {
        props.socket.emit('gamestart');
    }

    // Offcanvas Userlist functions
    const handleCloseUserlist = () => props.setShowUserlist(false);
    const handleShowUserlist = () => {
        props.setShowUserlist(true);
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center">
            {/* Login part*/}
            {props.isLoggedIn ? (
                /* If user is logged in */
                <Container >
                    <Row>
                        {/* Display username */}
                        <h2 style={{ fontWeight: 'bold' }}>Welcome, {props.username}!</h2>
                        {/* Logout button */}
                        <p>
                            You are now <strong>logged in</strong>.{' '}
                            <span onClick={handleLogout} style={{ color: 'blue', cursor: 'pointer' }} disabled={props.gameStarted}>
                                Logout
                            </span>
                        </p>
                    </Row>
                    {/* Display lobby information and buttons*/}
                    <Row>
                        <Col>
                            <Row>
                                <h2 style={{ fontWeight: 'bold' }}>Lobby:</h2>
                            </Row>
                            <Row>
                                <Col>
                                    {/* Display player count */}
                                    <Row>
                                        <h3 id="player_count"> {props.playerCount} / {props.watcherCount}</h3>
                                    </Row>
                                    {/* Display role switch buttons */}
                                    <Row>   
                                        <ButtonGroup className="me-3">
                                            {radios.map((radio, idx) => (
                                            <ToggleButton
                                                key={idx}
                                                id={`radio-${idx}`}
                                                type="radio"
                                                variant={idx % 2 ? 'outline-primary' : 'outline-danger'}
                                                name="radio"
                                                value={radio.value}
                                                checked={radioValue === radio.value}
                                                disabled={props.gameStarted}
                                                onChange={(e) => { 
                                                    handleRoleSwitch(); 
                                                    setRadioValue(e.currentTarget.value)
                                                }}
                                            >
                                                {radio.name}
                                            </ToggleButton>
                                            ))}
                                        </ButtonGroup>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            {/* Display connected clients count */}
                            <Row>
                                <h2 style={{ fontWeight: 'bold' }}>Connected:</h2>
                            </Row>
                            <Row>
                                <h3> {props.clientCount}</h3>
                            </Row>
                            <Row>
                                {/* Display start game and user list buttons */}
                                <Col>
                                    <Button variant="warning" className="me-3" onClick={handleGameStart} disabled={props.gameStarted} >Start game</Button>
                                    <Button variant="info" onClick={props.showUserlist ? handleCloseUserlist : handleShowUserlist}>User list</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            ) : (
                /* If user is not logged in */
                <Container>
                    <Row className="mb-4">
                        <h1 style={{ fontWeight: 'bold' }}>Join the game</h1>
                    </Row>
                    <Row>
                        {/* Display login form */}
                        <Col xs={9} md={8} lg={9} xl={10}>
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={props.username}
                                onChange={(e) => props.setUsername(e.target.value)}
                            />
                        </Col>
                        <Col xs={3} md={2} lg={1} xxl={2}>
                            <Button variant="primary" type="submit" onClick={handleLogin}>
                                Login
                            </Button>
                        </Col>
                    </Row>
                </Container>
            )}
        </div>
    );
}
export default LoginComponent;