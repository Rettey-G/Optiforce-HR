# OptiForce HR Dashboard

A comprehensive HR management system with employee, training, and organizational management features.

## Demo

Live Demo: [https://opitiforcepro.netlify.app/](https://opitiforcepro.netlify.app/)

## Features

- **Dashboard**: Overview of HR metrics, recent activities, and quick access to all features
- **Employee Management**: Add, edit, and manage employee profiles
- **Organization Chart**: Visual representation of company structure
- **Training Management**: Schedule and track training programs
- **Leave Management**: Apply for and manage employee leave
- **Time & Attendance**: Track employee attendance and working hours
- **Payroll Management**: Process payroll and generate payslips
- **Reports**: Generate various HR reports

## Demo Credentials

- **Admin User**: 
  - Username: admin
  - Password: admin123

- **Regular User**:
  - Username: user
  - Password: user123

- **Demo Mode**:
  - Any username with password: demo

## Static Deployment Mode

This project is configured to work in two modes:

1. **Full Mode**: With backend API (Node.js/Express) for local development
2. **Static Demo Mode**: For static hosting on Netlify without backend APIs

In static demo mode, all API calls are intercepted by the `api-mock.js` file which provides mock data for all features. This allows the application to be deployed to static hosting platforms like Netlify without requiring a backend server.

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Rettey-G/Optiforce-HR.git
   ```

2. Navigate to the project directory:
   ```
   cd Optiforce-HR
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Netlify Deployment

1. Fork this repository to your GitHub account
2. Sign up for a Netlify account if you don't have one
3. Create a new site from Git in Netlify
4. Connect your GitHub account and select the forked repository
5. Configure the build settings:
   - Build command: `npm run build` (if using a build step) or leave empty for static files
   - Publish directory: `public`
6. Click "Deploy site"

## Project Structure

- `public/`: Static files and frontend code
  - `css/`: Stylesheets
  - `js/`: JavaScript files
    - `api-mock.js`: Mock API for static deployment
  - `images/`: Image assets
  - `components/`: Reusable HTML components
- `server/`: Backend code (for local development only)

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **CSS Framework**: Bootstrap
- **Icons**: Font Awesome
- **Charts**: Chart.js
- **Backend** (local development only): Node.js, Express

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes for Developers

- All API calls use the `fetchApi` function from `api-mock.js` which falls back to mock data if the real API is unavailable
- Authentication is simulated in static mode using `sessionStorage`
- All paths are relative (no leading slashes) for compatibility with static hosting

## License

MIT

## Author

Rettey-G
