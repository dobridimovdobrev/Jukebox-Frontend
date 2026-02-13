
const Lights = ({turnOn}) => {
  return (
    <div className="lights">
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
      <div className={`lights__bulb ${turnOn ? "lights__bulb--on" : ""}`}></div>
    </div>
  );
};

export default Lights;
