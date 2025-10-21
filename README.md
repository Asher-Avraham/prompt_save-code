Prompt Save - Docker Learning AppThis is a minimal MVP application designed to demonstrate a multi-container setup using Docker and Docker Compose.Tech StackFrontend: React (using Vite for a lightweight setup)Backend: Node.js with ExpressDatabase: PostgreSQLOrchestration: Docker ComposeProject Structure.
├── docker-compose.yml
├── backend/
│ ├── Dockerfile
│ ├── package.json
│ └── server.js
└── frontend/
├── Dockerfile
├── index.html
├── package.json
└── src/
└── App.jsx
How to RunPrerequisites: Make sure you have Docker and Docker Compose installed on your machine.Build and Run: Open your terminal in the root directory of this project (where the docker-compose.yml file is located) and run the following command:docker-compose up --build
Access the App:The frontend will be available at http://localhost:3000The backend API will be running on http://localhost:5001The first time you run the command, Docker will download the necessary images and build your application containers. Subsequent runs will be much faster.
How to Run Your Application
Install Docker and Docker Compose: Make sure both are installed on your system.

Create the Directory Structure:

Create a main folder (e.g., docker-test-app).

Inside it, create a frontend folder and a backend folder.

Save the Files:

Place docker-compose.yml in the main folder.

Place the backend files (Dockerfile, server.js, package.json) inside the backend folder.

Place the frontend files (Dockerfile, package.json) inside the frontend folder.

Inside frontend, create a src folder and place App.js inside it.

Build and Run:

Open your terminal and navigate to the main folder (docker-test-app).

Run the command:

Bash

docker-compose up --build \* You will see logs from all three services (database, backend, frontend) as they build and start.
View the App:

Open your web browser and go to http://localhost:3000.

You should see the status "Database Connected" in green.

Test the Disconnected State:

In your terminal, press Ctrl+C to stop the containers.

Open docker-compose.yml and comment out or remove the db service definition.

Run docker-compose up --build again.

Now, when you visit http://localhost:3000, the backend will fail to connect, and the frontend will show "Database Not Connected" in red.
