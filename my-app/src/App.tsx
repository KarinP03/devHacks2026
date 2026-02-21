import { Link } from "react-router-dom";
import backgroundImage from "../../2d-assets/background/Background3.png";
import sprite from "../../2d-assets/sprite/walk2.png";
import "./App.css";

function App() {
  return (
    <>
      <div className="gallery">
        <img src={backgroundImage} className="background"></img>
      </div>
      <div>
        <img src={sprite} className="sprite"></img>
      </div>
      <div className="button-container">
        <Link to="/addEntry">
          <button className="button">+</button>
        </Link>
        <button className="button">Save</button>
        <button className="button">Load</button>
      </div>
    </>
  );
}

export default App;
