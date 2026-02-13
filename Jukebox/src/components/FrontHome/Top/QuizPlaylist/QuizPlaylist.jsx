
const QuizPlaylist = ({ onStartWizard }) => {

    return (

        <div className="quiz-playlist d-flex flex-column align-items-center justify-content-center">
            <div className="quiz-playlist__title-box">
                <h2 className="quiz-playlist__title d-flex fs-4 justify-content-center text-uppercase">My Playlists</h2>
            </div>
            <div className="quiz-playlist__descritpion-box">
                <p className="quiz-playlist__description text-center">Answer the quiz to generate playlist!</p>
            </div>
            <div className="quiz-playlist__button-box">
            <button className="quiz-playlist__button  border-2  bg-info text-uppercase px-4 py-1" onClick={onStartWizard}> Create Playlist</button>
            </div>
        </div>
    );
}

export default QuizPlaylist;
