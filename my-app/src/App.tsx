import { useEffect } from "react";
import backgroundImage from "../../2d-assets/background/Background3.png";
import walk1 from "../../2d-assets/sprite/walk1.png";
import walk2 from "../../2d-assets/sprite/walk2.png";
import walk3 from "../../2d-assets/sprite/walk3.png";
import { draw } from "./animation";
import "./App.css";

function App() {
  useEffect(() => {
    // React has finished rendering, so the element now exists in the DOM
    draw(walk1, walk2, walk3);
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
