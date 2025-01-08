import { Container, Col, Row } from "react-bootstrap";
import { useState } from "react";

function QuestionsComponent(props) {

    {/* State Variables */}
    const [answered, setAnswered] = useState({});

    {/* Function to handle click event on radio buttons */}
    const handleClick = (q, opt) => {
        console.log("Question : " + q.id);
        console.log("Réponse : " + opt)
        setAnswered({ ...answered, [q.id]: opt });
        props.socket.emit('answer', { question: q.id,  answer: opt });
    };

    {/* Function to get the sum of players choosing each answer */}
    const getSumOfAnswers = (answersArray) => {
        if (!answersArray) return 0;
        return answersArray.reduce((sum, value) => sum + value, 0);
    };

    {/* Render the questions component */}
    return (
        <Container>
            <h2 style={{ fontWeight: 'bold' }}> Questions</h2>
            {/* Map each of the the questions and render them */}
            {props.questions.map(q =>
                <div key={q.id} className="question-block rounded-4 mt-3 mb-3 p-3">
                    <div className="question">
                        <h3 id="question_title">{q.id} : {q.question}</h3><br />
                        {q.options.map((opt, index) =>
                            <Row>
                                 {/* Display the number of players who chose this answer only when player already chose his answer */}
                                <Col sm={1}>
                                    { (q.id in answered && props.answers && props.answers[q.id] && props.answers[q.id][index] !== undefined) ? (
                                        <label>{props.answers[q.id][index]}/{props.playerCount}</label>
                                    ) : (
                                        <label>?/{props.playerCount}</label>
                                    )}
                                </Col>
                                {/* Display the radio buttons for each answer */}
                                <Col>
                                <div key={q.id + "_" + opt}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name={q.id} id={opt} onClick={() => handleClick(q, opt)} disabled={props.answers && props.answers[q.id] && getSumOfAnswers(props.answers[q.id]) === props.playerCount}/>
                                        {/* Change the color of the answer based on the correctness when blocked */}
                                        <label className="form-check-label" htmlFor={opt} 
                                            style={{ color: props.answers && props.answers[q.id] && getSumOfAnswers(props.answers[q.id]) === props.playerCount && q.answer !== opt ? 'red' 
                                                          : props.answers && props.answers[q.id] && getSumOfAnswers(props.answers[q.id]) === props.playerCount && q.answer === opt ? 'green' 
                                                          : 'black'}} 
                                            >
                                            {opt}
                                        </label>
                                    </div>
                                </div>
                                 </Col>
                            </Row>
                        )}
                    </div>
                </div>)}
        </Container>
    );
}
export default QuestionsComponent;