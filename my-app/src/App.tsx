import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import backgroundImage from '../../2d-assets/background/background3.png'

function App() {
  const bgStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImage})`,
    height: '100vh',
    width: '200vh',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }

  return (
    <>
      <div>
        <img src={backgroundImage} className="background">
        </img>
      </div>
    </>
  )
}

export default App
