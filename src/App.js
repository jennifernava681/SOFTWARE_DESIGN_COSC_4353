import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllAnimalsPage from './AllAnimalsPage.jsx';
import HomePage from './HomePage';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import EventFormPage from './EventFormPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import VolunteerHistoryPage from './VolunteerHistoryPage.jsx';
import VolunteerMatchPage from './VolunteerMatchPage.jsx';

function App() { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/animals" element={<AllAnimalsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-event" element={<EventFormPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<VolunteerHistoryPage />} />
        <Route path="/match-volunteers" element={<VolunteerMatchPage />} />
      </Routes>    
    </Router>
  );
}

export default App;
