// import { useState } from 'react'
import './App.scss'
import Shorten from './components/Shorten'

function App() {

  return (
    <div className="body">
      <h1>URL Shortener</h1>
      <Shorten />
      <h2>Retrieve URL</h2>
      <input placeholder="enter url"></input>
    </div>
  )
}

export default App
