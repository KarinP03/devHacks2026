import backgroundImage from "../../2d-assets/background/background3.png";
import sprite from "../../2d-assets/sprite/walk2.png";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <img src={sprite} className="sprite"></img>
        <button className="button">+</button>
      </div>
    </>
  );
}

export default App;
