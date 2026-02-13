
const QuizCoins = ({ isShaking, isStartQuizCoins }) => {

    return (

        <div className={`quiz-coins d-flex flex-column align-items-center justify-content-center ${isShaking ? "shake" : ""}`}>
            <div className="quiz-coins__title-box">
                <h2 className="quiz-coins__title d-flex fs-4 justify-content-center text-uppercase">Quiz Jukebox</h2>
            </div>
            <div className="quiz-coins__descritpion-box">
                <p className="quiz-coins__description text-center">Answer the quiz to increase coins!</p>
            </div>
            <div className="quiz-coins__button-box">
            <button className="quiz-coins__button  border-2  bg-info text-uppercase px-4 py-1" onClick={isStartQuizCoins}> Start quiz</button>
            </div>
        </div>
    );
}

export default QuizCoins;