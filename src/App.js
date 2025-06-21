import "./css/home.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Main Page
import HomePage from './HomePage.jsx';

// USER Pages
import BrowseAnimals from './USER/BrowseAnimals.jsx';
import DonatePage from './USER/DonatePage.jsx';
import MyEvents from './USER/MyEvents.jsx';
import SubmitAdoptionRequest from './USER/SubmitAdoptionRequest.jsx';
import SurrenderAnimal from './USER/SurrenderAnimal.jsx';
import LoginUSER from './USER/LoginUSER.jsx';
import RegisterPage from './USER/RegisterPage.jsx';

//workers
//import loginw from './workers/Loginw.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public and Animal Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/animals" element={<BrowseAnimals />} />
        <Route path="/submit-adoption" element={<SubmitAdoptionRequest />} />
        <Route path="/surrender" element={<SurrenderAnimal />} />

        {/* Auth Pages */}
        <Route path="/Login" element={<LoginUSER />} />
        <Route path="/register" element={<RegisterPage />} />

        {/*workers*/}
       {/* <Route path="/loginw" element={<Loginw />} />/}

        {/* Events and Donation */}
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/my-events" element={<MyEvents />} />
      </Routes>
    </Router>
  );
}

export default App;
