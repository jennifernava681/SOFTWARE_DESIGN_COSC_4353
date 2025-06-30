import "./css/home.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';

import HomePage from './HomePage.jsx';
import ProfilePage from './portals/staff/volunteer/ProfilePage.jsx';

// USER PAGES
import BrowseAnimals from './portals/public/BrowseAnimals.jsx';
import DonatePage from './portals/public/DonatePage.jsx';
import MyEvents from './portals/public/MyEvents.jsx';
import SubmitAdoptionRequest from './portals/public/SubmitAdoptionRequest.jsx';
import SurrenderAnimal from './portals/public/SurrenderAnimal.jsx';
import LoginUSER from './portals/public/LoginUSER.jsx';
import RegisterPage from './portals/public/RegisterPage.jsx';

// STAFF LOGIN PAGE
import StaffLogin from './portals/staff/StaffLogin.jsx';

// STAFF/MANAGER PAGES
import AssignTasks from './portals/staff/manager/AssignTasks.jsx';
import DonationReports from './portals/staff/manager/DonationReports.jsx';
import EventManager from './portals/staff/manager/EventManager.jsx';
import EventReports from './portals/staff/manager/EventReports.jsx';
import ManageAnimals from './portals/staff/manager/ManageAnimals.jsx';
import ManagerDash from './portals/staff/manager/ManagerDash.jsx';
import RemoveVolunteer from './portals/staff/manager/RemoveVolunteer.jsx';
import ReviewSurrenderRequests from './portals/staff/manager/ReviewSurrenderRequests.jsx';
import ReviewVolunteersApps from './portals/staff/manager/ReviewVolunteersApps.jsx';
import VolunteerPerformance from './portals/staff/manager/VolunteerPerformance.jsx';

// STAFF/VET PAGES
import AnimalMedicalForm from './portals/staff/vet/AnimalMedicalForm.jsx';
import ReadyStatusForm from './portals/staff/vet/ReadyStatusForm.jsx';
import VetDashboard from './portals/staff/vet/VetDashboard.jsx';

// STAFF/VOLUNTEER PAGES
import ActivityHistory from './portals/staff/volunteer/ActivityHistory.jsx';
import ApplyVolunteer from './portals/staff/volunteer/ApplyVolunteer.jsx';
import MyTasks from './portals/staff/volunteer/MyTasks.jsx';
import VolunteerDash from './portals/staff/volunteer/VolunteerDash.jsx';
import VolunteerMatchPage from './portals/staff/volunteer/VolunteerMatchPage.jsx';

// Layout Component
const Layout = ({ children, userType }) => (
  <>
    <Header userType={userType} />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages without header */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginUSER />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/stafflogin" element={<StaffLogin />} />

        {/* Profile page (shared by all staff) */}
        <Route path="/profilePage" element={<Layout userType="staff"><ProfilePage /></Layout>} />

        {/* Public User routes with header */}
        <Route path="/animals" element={<Layout userType="public"><BrowseAnimals /></Layout>} />
        <Route path="/donate" element={<Layout userType="public"><DonatePage /></Layout>} />
        <Route path="/my-events" element={<Layout userType="public"><MyEvents /></Layout>} />
        <Route path="/submit-adoption" element={<Layout userType="public"><SubmitAdoptionRequest /></Layout>} />
        <Route path="/surrender" element={<Layout userType="public"><SurrenderAnimal /></Layout>} />

        {/* Manager routes with header */}
        <Route path="/assigntasks" element={<Layout userType="manager"><AssignTasks /></Layout>} />
        <Route path="/donatereports" element={<Layout userType="manager"><DonationReports /></Layout>} />
        <Route path="/eventmanager" element={<Layout userType="manager"><EventManager /></Layout>} />
        <Route path="/eventreports" element={<Layout userType="manager"><EventReports /></Layout>} />
        <Route path="/manageanimals" element={<Layout userType="manager"><ManageAnimals /></Layout>} />
        <Route path="/managerdash" element={<Layout userType="manager"><ManagerDash /></Layout>} />
        <Route path="/removevolunteer" element={<Layout userType="manager"><RemoveVolunteer /></Layout>} />
        <Route path="/reviewSurrenderRequest" element={<Layout userType="manager"><ReviewSurrenderRequests /></Layout>} />
        <Route path="/reviewVolunteersApps" element={<Layout userType="manager"><ReviewVolunteersApps /></Layout>} />
        <Route path="/volunteerPerformance" element={<Layout userType="manager"><VolunteerPerformance /></Layout>} />

        {/* Vet routes with header */}
        <Route path="/animalMedicalForm" element={<Layout userType="vet"><AnimalMedicalForm /></Layout>} />
        <Route path="/readyStatusForm" element={<Layout userType="vet"><ReadyStatusForm /></Layout>} />
        <Route path="/vetdashboard" element={<Layout userType="vet"><VetDashboard /></Layout>} />

        {/* Volunteer routes with header */}
        <Route path="/activityHistory" element={<Layout userType="volunteer"><ActivityHistory /></Layout>} />
        <Route path="/applyVolunteer" element={<Layout userType="volunteer"><ApplyVolunteer /></Layout>} />
        <Route path="/mytasks" element={<Layout userType="volunteer"><MyTasks /></Layout>} />
        <Route path="/volunteerDash" element={<Layout userType="volunteer"><VolunteerDash /></Layout>} />
        <Route path="/volunteerMatchPage" element={<Layout userType="volunteer"><VolunteerMatchPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;