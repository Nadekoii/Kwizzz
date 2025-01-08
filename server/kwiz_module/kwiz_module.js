/**
 * Created by jgarcia on 26/11/2018.
 * Modified 26/11/2020
 * This modules contains function to process the questions and answers from clients
 */

// load questions file
const e = require('express');
let data = require('./questions.json');
let clients_data =  {};
let playersCount = 0;
let watchersCount = 0;
let gameStarted = false;

// returns the list of questions and answers
let questions = function(){
    return data;
};

// returns the number of questions in the quiz
let questions_count = function(){
    return data.quiz.length;
};

// returns the number of players
let players_count = function(){
    return playersCount;
};

// returns the number of watchers
let watchers_count = function(){
    return watchersCount;
};

// returns the role of a player
let player_role = function(id){
    return clients_data[id].isPlayer;
};

// starts the game
let start_game = function(){
    gameStarted = true;
};

// returns the state of the game
let game_state = function(){
    return gameStarted;
};

// returns the scoreboard sorted by score
let scoreboard = function() {
    let reply = [];
    for (let clientKey in clients_data) {
        let client = clients_data[clientKey];
        if (client.isPlayer) {
            reply.push({ player: clients_data[clientKey].username, score: client.score });
        }
        reply.sort((a, b) => b.score - a.score);
    }
    return reply;
};

// returns if an username is already taken or not
let username_taken = function(username){
    let keys = Object.keys(clients_data);
    let length = keys.length;
    let i;
    for(i = 0; i<length; i++) {
        let clientID = keys[i];
        if (clients_data[clientID].username === username) {
            return true;
        }
    }
    return false;
}

//add a new client defined by its id (from socket.io)
let add_client = function(id){
    clients_data[id] = {};
};

//remove a client with its id (from socket.io)
let remove_client = function(id){
    remove_player(id);
    delete clients_data[id];
};

// add a name to the client's data when the client logs in
let add_player = function(id, username){
    if (clients_data[id].username === undefined) {
        clients_data[id].username = username;
        clients_data[id].isPlayer = true;
        clients_data[id].score = 0;
        playersCount++;
    }
};

// remove a player from the list when they log out
let remove_player = function(id){
    if (clients_data[id].username !== undefined) {
        clients_data[id].isPlayer ? playersCount-- : watchersCount--;
        delete clients_data[id].username;
        delete clients_data[id].isPlayer;
        delete clients_data[id].score;
    }
}

// switch the role of a player
let switch_role = function(id){
    if (clients_data[id] !== undefined) {
        if (clients_data[id].isPlayer) {
            clients_data[id].isPlayer = false;
            playersCount--;
            watchersCount++;
        } else {
            clients_data[id].isPlayer = true;
            playersCount++;
            watchersCount--;
        }
    }
};

// calculate the score of each player
let calculate_score = function() {
    for (let clientKey in clients_data) {
        let client = clients_data[clientKey];
        if (client.isPlayer) {
            let score = 0;
            for (let j = 0; j < questions_count(); j++) {
                let question = data.quiz[j];
                let id = question.id;
                let answer = question.answer;
                let answered = client[id];
                if (answered === answer) {
                    score++;
                }
            }
            client.score = score;
        }
    }
};

// check if the game has ended
let end_game_check = function () {
    for (let answers of Object.values(get_answers_counts())) {
        if (answers.reduce((sum, value) => sum + value, 0) !== players_count()) {
            return false;
        }
    }
    game_started = false;
    calculate_score();
    return true;
};

/*
//set the name of a client defined by its id (from socket.io)
let set_client_name = function (id, name){
    if(clients_data.hasOwnProperty(id)){
        clients_data[id].name = name;
    }else{
        console.error('client id ' + id, ' does not exists');
    }
};
*/

// returns an array of clients names for each role
let get_clients_names = function() {
    let reply = {
        players: [],
        watchers: [],
        guests: []
    };

    let keys = Object.keys(clients_data);
    let length = keys.length;

    for (let i = 0; i < length; i++) {
        let clientID = keys[i];
        let username = clients_data[clientID].username;
        if (username !== undefined) {
            if (clients_data[clientID].isPlayer) {
                reply.players.push(username);
            } else {
                reply.watchers.push(username);
            }
        } else {
            reply.guests.push(clientID);
        }
    } 
    return reply;
};

// returns the number of connected clients (even those without a name)
let clients_count = function (){
    return Object.keys(clients_data).length;
};

// updates the data structure containing client options for each question.
// question must be 'q1', 'q2' or 'q3'
// option must be the complete text e.g. "Allemande" or "une couleur"
let update_client_answer = function(id, question, option){
    clients_data[id][question] = option;
};

let find_option_index = function(options, option) {
    let i;
    for (i = 0; i< options.length; i++){
        if(options[i] === option){
            return i;
        }
    }
    return undefined;
};

// returns an object with counts for each answer of each question
// example: { q1: [ 1, 2, 0 ], q2: [ 2, 0, 1 ], q3: [ 1, 0, 0 ] }
let get_answers_counts = function (){
    //Create the default reply
    let reply = {};
    let question_iter;
    for (question_iter = 0; question_iter < questions_count(); question_iter++){
        reply[data.quiz[question_iter].id] = [0,0,0];
    }

    let keys = Object.keys(clients_data);
    let length = keys.length;
    let client_iter;

    for(client_iter = 0; client_iter<length; client_iter++){
        let clientID = keys[client_iter];
        let answers = clients_data[clientID];

        for (question_iter = 0; question_iter < questions_count(); question_iter++){

            let question = data.quiz[question_iter];
            let id = question.id;
            if (answers.hasOwnProperty(id)){
                //find option id in the list of options and update the counter
                let option = answers[id];
                let option_index = find_option_index(question.options, option);
                if(option_index !== undefined){
                    reply[id][option_index]++;
                }
            }
        }
    }
    return reply;
};

// reset the server's side data
let reset = function(){
    for (let clientKey in clients_data) {
        let client = clients_data[clientKey];
        if (client.isPlayer) {
            delete client.score;
            for (let j = 0; j < questions_count(); j++) {
                let question = data.quiz[j];
                let id = question.id;
                delete client[id];
                gameStarted = false;
            }
        }
    }
}

// export the functions
exports.questions = questions;
exports.find_option_index = find_option_index;
exports.add_client = add_client;
exports.remove_client = remove_client;
exports.add_player = add_player;
exports.remove_player = remove_player;
exports.players_count = players_count;
exports.watchers_count = watchers_count;
exports.player_role = player_role;
exports.username_taken = username_taken;
exports.switch_role = switch_role;
exports.questions_count = questions_count;
exports.start_game = start_game;
exports.scoreboard = scoreboard;
exports.end_game_check = end_game_check;
exports.game_state = game_state;
exports.get_clients_names = get_clients_names;
exports.update_client_answer = update_client_answer;
exports.clients_count = clients_count;
exports.get_answers_counts = get_answers_counts;
exports.reset = reset;