import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AllAnimalsPage from './AllAnimalsPage.jsx';

// USER PAGES
import BrowseAnimals from './USER/BrowseAnimals.jsx';
import DonatePage from './USER/DonatePage.jsx';
import MyEvents from './USER/MyEvents.jsx';
import SubmitAdoptionRequest from './USER/SubmitAdoptionRequest.jsx';
import SurrenderAnimal from './USER/SurrenderAnimal.jsx';
import LoginUSER from './USER/LoginUSER.jsx';
import RegisterPage from './USER/RegisterPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllAnimalsPage />} />
        <Route path="/animals" element={<BrowseAnimals />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/submit-adoption" element={<SubmitAdoptionRequest />} />
        <Route path="/surrender" element={<SurrenderAnimal />} />
      </Routes>
    </Router>
  );
}

export default App;
