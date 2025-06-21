import "./css/home.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profilePage" element={<ProfilePage />} />

        {/* Start of User routes */}
        <Route path="/animals" element={<BrowseAnimals />} /> 
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/submit-adoption" element={<SubmitAdoptionRequest />} />
        <Route path="/surrender" element={<SurrenderAnimal />} />
        <Route path="/login" element={<LoginUSER />} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/stafflogin" element={<StaffLogin />} />

        {/* Start of Manager routes */}
        <Route path="/assigntasks" element={<AssignTasks />} />
        <Route path="/donatereports" element={<DonationReports />} />
        <Route path="/eventmanager" element={<EventManager />} />
        <Route path="/eventreports" element={<EventReports />} />
        <Route path="/manageanimals" element={<ManageAnimals />} />
        <Route path="/managerdash" element={<ManagerDash />} />
        <Route path="/removevolunteer" element={<RemoveVolunteer />} />
        <Route path="/reviewSurrenderRequest" element={<ReviewSurrenderRequests />} />
        <Route path="/reviewVolunteersApps" element={<ReviewVolunteersApps />} />
        <Route path="/volunteerPerformance" element={<VolunteerPerformance />} />

        {/* Start of Vet routes */}
        <Route path="/animalMedicalForm" element={<AnimalMedicalForm />} />
        <Route path="/readyStatusForm" element={<ReadyStatusForm />} />
        <Route path="/vetdashboard" element={<VetDashboard />} />

        {/*Start of Volunteer routes */}
        <Route path="/activityHistory" element={<ActivityHistory />} />
        <Route path="/applyVolunteer" element={<ApplyVolunteer />} />
        <Route path="/mytasks" element={<MyTasks />} />
        <Route path="/volunteerDash" element={<VolunteerDash />} />
        <Route path="/volunteerMatchPage" element={<VolunteerMatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
