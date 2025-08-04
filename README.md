# SOFTWARE_DESIGN_COSC_4353
Group 4 CLASS_COSC 4353

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Real-time Notification System

### Overview
The Real-time Notification System provides automatic notification checking and display from the database. Users receive notifications for various events such as task assignments, event updates, reminders, and system messages.

### Features
- **Automatic Database Polling**: Checks for new notifications every 30 seconds
- **Real-time Display**: Shows notifications as they arrive
- **Read/Unread Management**: Tracks notification status
- **Type-based Styling**: Different colors and icons for notification types
- **Responsive Design**: Works on desktop and mobile devices
- **Floating Notifications**: Auto-display new notifications as overlays
- **Notification Center**: Comprehensive notification management interface

### Components

#### Core Components
- `useNotifications.js` - Custom React hook for notification management
- `NotificationCenter.jsx` - Main notification display and management component
- `NotificationBell.jsx` - Notification bell with badge count
- `NotificationBanner.jsx` - Individual notification display component

#### Styling
- `NotificationCenter.css` - Styles for the notification center
- `NotificationBell.css` - Styles for the notification bell

### API Endpoints
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/new` - Create new notification
- `POST /api/notifications/event-assignment` - Send event assignment notification
- `POST /api/notifications/event-reminder/:eventId` - Send event reminders
- `POST /api/notifications/event-update/:eventId` - Send event updates

### Notification Types
- `event_assignment` - New event or task assignments
- `event_reminder` - Event reminders and scheduling
- `event_update` - Event changes and updates
- `task_assignment` - New task assignments
- `adoption_update` - Adoption request updates
- `donation_received` - Donation confirmations
- `general` - General system notifications

### Database Schema
The notification system uses the `notifications` table:
```sql
CREATE TABLE notifications (
  notifications_id INT PRIMARY KEY AUTO_INCREMENT,
  USERS_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (USERS_id) REFERENCES users(id_user)
);
```

### Usage Instructions
1. **For Users**: 
   - Click the notification bell in the header to view notifications
   - New notifications appear automatically as floating overlays
   - Click on notifications to mark them as read
   - Use the notification center to manage all notifications

2. **For Developers**:
   - Use the `useNotifications` hook in any component
   - Import `NotificationBell` for header integration
   - Use `NotificationCenter` for full notification management

### Integration Examples

#### Adding to Header
```jsx
import NotificationBell from './components/NotificationBell';

// In header component
<NotificationBell position="top-right" />
```

#### Using in Components
```jsx
import { useNotifications } from './hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  // Component logic
}
```

### Technical Implementation
- **Polling**: Automatic database checks every 30 seconds
- **State Management**: React hooks for notification state
- **Real-time Updates**: Immediate UI updates when notifications change
- **Performance**: Optimized queries and minimal data transfer
- **Accessibility**: ARIA labels and keyboard navigation support

### Security Features
- User-specific notifications (filtered by user ID)
- Authentication required for all endpoints
- Role-based access control for notification creation
- Secure token-based authentication

### Testing
Run the test script to add sample notifications:
```bash
cd server
node test-notifications.js
```

### Future Enhancements
- WebSocket support for real-time updates
- Push notifications for mobile devices
- Email integration for important notifications
- Notification preferences and filtering
- Bulk notification management
- Notification templates and customization
