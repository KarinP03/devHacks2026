import { useEffect } from "react";
import backgroundImage from "../../2d-assets/background/Background3.png";
import walkl1 from "../../2d-assets/sprite/LeftWalk1.png";
import walkl2 from "../../2d-assets/sprite/LeftWalk2.png";
import walkl3 from "../../2d-assets/sprite/LeftWalk3.png";
import walkr1 from "../../2d-assets/sprite/RightWalk1.png";
import walkr2 from "../../2d-assets/sprite/RightWalk2.png";
import walkr3 from "../../2d-assets/sprite/RightWalk3.png";
import { draw } from "./animation";
import "./App.css";

function App() {
  useEffect(() => {
    // React has finished rendering, so the element now exists in the DOM
    draw(walkr1, walkr2, walkr3, walkl1, walkl2, walkl3);
  }, []);
  return (
    <>
      <div className="gallery">
        <img src={backgroundImage} className="background"></img>
      </div>
      <div className="sprite-container">
        <canvas id="sprite"></canvas>
      </div>
      <div className="button-container">
        <button className="button">+</button>
        <button className="button">Save</button>
        <button className="button">Load</button>
      </div>
    </>
  );
}

export default App;
