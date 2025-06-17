import "./App.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllAnimalsPage from './AllAnimalsPage.jsx';
import HomePage from './HomePage';

function App() { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/animals" element={<AllAnimalsPage />} />
      </Routes>    
    </Router>
  )
}

export default App
