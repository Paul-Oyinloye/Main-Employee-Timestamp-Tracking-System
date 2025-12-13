Project Overview
Employee Timestamp Tracking System

The Employee Timestamp Tracking System is a full-stack web application designed to manage employee clock-ins, clock-outs, and shift tracking using real-time camera capture. It provides a simple, user-friendly interface for managing attendance while securely storing timestamp data on the backend.

This project demonstrates practical use of frontend–backend separation, RESTful APIs, media device integration, and cloud deployment.

Key Features
1.Employee Management
2.Add new employees with assigned roles
3.Select employees from a dynamic list

Camera-Based Clock In / Out
1.Uses the browser’s camera to capture a selfie during clock-in and clock-out
2.Images are uploaded and stored on the backend

Shift Tracking
1.Records IN and OUT timestamps per employee
2.View full shift history on the same page (single-page interface)

EXTRA: Pay Estimation (Irish Standards)
1.Calculates total hours worked
2.Estimates pay based on an adjustable hourly rate (default is 13 EURO)

Cloud-Deployed Architecture
1.Frontend hosted as a static site
2.Backend API hosted separately

Demonstrates real-world deployment practices

Tech Stack:
Frontend: HTML, React (via CDN), JavaScript, MediaDevices API (camera access)
Backend: Node.js, Express.js, SQLite (via sqlite3), Multer (file uploads)
Deployment: Render, GitHub for version control


Live URLs

Frontend (Static Site)
https://main-employee-timestamp-tracking-system.onrender.com

Backend API (Node + Express)
https://employee-timestamp-backend.onrender.com



Disclaimer: 

some links to where some codes where gotten:

Express server setup: Official Express Docs,https://expressjs.com/

Multer for file uploads: Multer GitHub, https://github.com/expressjs/multer

SQLite usage: SQLite Node Guide, https://www.sqlitetutorial.net/sqlite-nodejs/

React with CDN + Babel: React Official Docs, https://react.dev/

Camera API: MDN getUserMedia, https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

Canvas image capture: MDN Canvas Capture, https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

