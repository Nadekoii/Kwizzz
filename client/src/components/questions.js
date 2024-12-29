import Container from 'react-bootstrap/Container';

function QuestionsComponent(props) {

    const handleClick = (q, opt) => {
        console.log("Question : " + q.id);
        console.log("Réponse : " + opt.text);
    };

    return (
        <Container className="questions rounded-4 pt-2 pb-2 mt-2 mb-4">
            <h2 style={{ fontWeight: 'bold' }}>Questions</h2>
            {props.questions.map(q =>
                <div key={q.id} className="question-block rounded-4 pt-5">
                    <div className="question">
                        <h3 id="question_title">{q.id} : {q.question}</h3><br />
                        {q.options.map((opt, index) =>
                            <div key={q.id + "_" + index}>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name={q.id} id={q.id + "_" + index} onClick={() => handleClick(q, opt)} />
                                    <label className="form-check-label" htmlFor={q.id + "_" + index}>
                                        {opt.text}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Container>
    );
}

export default QuestionsComponent;