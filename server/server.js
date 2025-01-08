/**
 * Created by Jérémie on 01/12/2017.
 * Updated by Jérémie Garcia on  07/12/2021 - added documentation and functions
 * Updated by Jérémie Garcia on  04/12/2022 - more docs
 */

// Load the fs and path modules
const fs = require('fs');
const path = require('path');
const express = require('express');
const kwiz = require('./kwiz_module/kwiz_module');

// Make the server and the socketsio
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");
const { on } = require('events');
const io = new Server(server);

// Server static file in the public directory
app.use(express.static(path.join(__dirname, '../client/build')));

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

// On connection, we:
io.on('connection', function (socket) {

    // on disconnect, remove the client from the list
    socket.on('disconnect', () => {
        console.log('client déconnecté',socket.id);
        let clientID = socket.id;
        kwiz.remove_client(clientID);
        updatePlayersWatchersCounter();
        updateClientsCounter();
    });

    // add the client to the list
    console.log('client connecté',socket.id);
    let clientID = socket.id;
    kwiz.add_client(clientID);

    // update the number of clients to all clients
    updateClientsCounter();

    // send the necessary data to the client on connection
    onConnect(socket);

    /*
    //Create a random user name and define it
    let rand = Math.random();
    let name = 'name_' + rand;
    kwiz.set_client_name(clientID, name);
    */

    // on login, add the client to the list of players
    socket.on('login', (username) => {
        let playerID = socket.id;
        if (kwiz.username_taken(username)) {
            socket.emit(LOGIN_ERROR_MESSAGE, 'Username already taken');
        } else {
            kwiz.add_player(playerID, username);
            socket.emit(LOGIN_SUCCESS_MESSAGE, username);
            updatePlayersWatchersCounter();
            sendNamesToClients()
        }
    });

    // on logout, remove the client from the list of players
    socket.on('logout', () => {
        let playerID = socket.id;
        kwiz.remove_player(playerID);
        socket.emit(LOGOUT_SUCCESS_MESSAGE);
        updatePlayersWatchersCounter();
        sendNamesToClients()
    });

    // on role switch, set the player as the new role
    socket.on('roleswitch', () => {
        let playerID = socket.id;
        kwiz.switch_role(playerID);
        socket.emit(ROLE_SWITCH_MESSAGE, kwiz.player_role(playerID));
        updatePlayersWatchersCounter();
        sendNamesToClients()
    });

    // on game start, notify all clients
    socket.on('gamestart', () => {
        kwiz.start_game();
        io.emit(QUIZ_MESSAGE, kwiz.questions());
        io.emit(GAME_STATE_MESSAGE, kwiz.game_state());
    });
    
    // on answer, add the answer to the list of answers and check if the game is over
    socket.on('answer', (data) => {
        let playerID = socket.id;
        kwiz.update_client_answer(playerID, data.question, data.answer);
        sendAnswersToClients();
        if (kwiz.end_game_check()){
            console.log(kwiz.scoreboard());
            io.emit(END_GAME_MESSAGE, kwiz.scoreboard());
            kwiz.reset();
        }
    });
});

// Send the necessary data to the client on connection
function onConnect(socket){
    socket.emit(CLIENT_NUMBER_MESSAGE, kwiz.clients_count());
    socket.emit(PLAYER_WATCHER_NUMBER_MESSAGE, {players_count: kwiz.players_count(), watchers_count: kwiz.watchers_count()});
    socket.emit(GAME_STATE_MESSAGE, kwiz.game_state());
    sendNamesToClients()
}

//send to all clients the current number of connected clients
function updateClientsCounter (){
    console.log(`Client count: `, kwiz.clients_count());
    let nb = kwiz.clients_count();
    io.emit(CLIENT_NUMBER_MESSAGE, nb);
}

//send to all client the current number of players
function updatePlayersWatchersCounter(){
    io.emit(PLAYER_WATCHER_NUMBER_MESSAGE, {players_count: kwiz.players_count(), watchers_count: kwiz.watchers_count()});
}

//send to all client the current answers
function sendAnswersToClients(){
    let reply = kwiz.get_answers_counts();
    io.emit(CLIENT_ANSWERS_MESSAGE, reply);
}

//send to all client the current clients Names
function sendNamesToClients(){
    let reply = kwiz.get_clients_names();
    io.emit(CLIENT_NAMES_MESSAGE, reply);
}

server.listen(8080);