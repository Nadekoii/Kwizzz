import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function LoginComponent(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [playerCount, setPlayerCount] = useState(1);
    const [isReady, setReady] = useState(false);

    const handleLogin = () => {
        if (username !== '') {
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
    };

        return (
            <Col md={{ span: 4, offset: 1 }} className="login rounded-4 mb-3">
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ height: '100%' }}>
                    {isLoggedIn ? (
                        <>
                            <h2>Welcome, {username}!</h2>
                            <p>
                                You are now <strong>logged in</strong>.{' '}
                                <span onClick={handleLogout} style={{ color: 'blue', cursor: 'pointer' }}>
                                    Logout
                                </span>
                            </p>
                        </>
                    ) : (
                        <Form>
                            <Row>
                                <h2 style={{ fontWeight: 'bold' }}>Username:</h2>
                            </Row>
                            <Row>
                                <Col xs="auto">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </Col>
                                <Col xs="auto">
                                    <Button variant="primary" type="submit" onClick={handleLogin}>
                                        Login
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    )}
                    <h2 style={{ fontWeight: 'bold' }}>Lobby:</h2>
                    {isLoggedIn ? (
                        <h3 id="player_count">0 / {playerCount}</h3>
                    ) : (
                        <Row>
                            <Col xs="7">
                                <Button variant="success" className="me-2">
                                    Ready
                                </Button>
                                <Button variant="danger" className="me-2">
                                    Leave
                                </Button>
                            </Col>
                            <Col xs="5">
                                <h3 id="player_count">0 / {playerCount}</h3>
                            </Col>
                        </Row>
                    )}
                </div>
            </Col>
        );
}
export default LoginComponent;