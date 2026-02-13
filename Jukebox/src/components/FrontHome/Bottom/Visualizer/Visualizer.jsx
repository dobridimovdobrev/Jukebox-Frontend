import { useRef, useEffect } from "react";
import "@/components/FrontHome/Bottom/Visualizer/Visualizer.scss";
import Lottie from "lottie-react";
import equalizerAnimation from "@/components/FrontHome/Bottom/Visualizer/equalizer.json";

// Cambia questo valore per provare stili diversi: "pulse" | "lottie"
const VISUALIZER_STYLE = "lottie";

const Visualizer = ({ isPlaying }) => {
  const lottieRef = useRef(null);

  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className={`visualizer visualizer--${VISUALIZER_STYLE} ${isPlaying ? 'visualizer--active' : ''}`}>

      {/* Style 1: Pulse Circles */}
      {VISUALIZER_STYLE === "pulse" && (
        <div className="visualizer__pulse">
          <div className="visualizer__pulse-ring visualizer__pulse-ring--1"></div>
          <div className="visualizer__pulse-ring visualizer__pulse-ring--2"></div>
          <div className="visualizer__pulse-ring visualizer__pulse-ring--3"></div>
          <div className="visualizer__pulse-center"></div>
        </div>
      )}

      {/* Style 2: Lottie Animation */}
      {VISUALIZER_STYLE === "lottie" && (
        <div className="visualizer__lottie">
          <Lottie
            lottieRef={lottieRef}
            animationData={equalizerAnimation}
            loop={true}
            autoplay={false}
            style={{ width: '100%', height: '100%' }}
            rendererSettings={{
              preserveAspectRatio: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Visualizer;
