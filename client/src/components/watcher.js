import { Container, Col, Row } from "react-bootstrap";

{/* Custom role: Watcher doesn't play, but can see the questions and answers directly from the beginning, aswell as the count of each answers*/}
function WatcherComponent(props) {
    return (
        <Container>
            <h2 style={{ fontWeight: 'bold' }}> Questions</h2>
            {props.questions.map(q =>
                <div key={q.id} className="question-block rounded-4 mt-3 mb-3 p-3">
                    <div className="question">
                        {/* Display the question and its options */}
                        <h3 id="question_title">{q.id} : {q.question}</h3><br />
                        {/* Map each of the options and render them */}
                        {q.options.map((opt, index) =>
                            <Row key={index}>
                                <Col sm={1}>
                                    <label>{props.answers?.[q.id]?.[index] !== undefined ? `${props.answers[q.id][index]}/${props.playerCount}` : `?/${props.playerCount}`}</label>
                                </Col>
                                <Col>
                                    <div key={q.id + "_" + opt}>
                                        <div className="form-check">
                                            <label className="form-check-label" htmlFor={opt} 
                                                style={{ color: q.answer === opt ? 'green' : 'red'}} 
                                            >
                                                {opt}
                                            </label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                </div>
            )}
        </Container>
    );
}

export default WatcherComponent;