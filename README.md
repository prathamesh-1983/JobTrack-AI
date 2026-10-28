# JobTrack AI 🚀

### Your Smart Job Search Command Center

JobTrack AI is a job application tracking dashboard built with **React, Vite, and Appwrite TablesDB**. It helps job seekers organize job applications, monitor application progress, manage interview dates, analyze job-search activity, and compare resume skills with job descriptions in one place.

This project is being developed for the **Appwrite Databases Hackathon 2026**.

> **Project status:** Hackathon project in development. Features, database connectivity, and deployment should be verified before marking the project as complete.

## 🎯 Problem Statement

Job seekers often apply to multiple companies through different platforms, making it difficult to track application statuses, remember interview dates, and follow up with recruiters.

JobTrack AI addresses this problem by providing a centralized dashboard where users can organize applications, track progress, and manage their job search more efficiently.

## ✨ Features

- **Dashboard Analytics:** View total applications, interviews, offers, and response-rate metrics.
- **Application Management:** Add, view, edit, and delete job application records.
- **Status Tracking:** Organize applications by Applied, Shortlisted, Interview, Offer, and Rejected.
- **Search and Filters:** Find applications by company, role, location, or source and filter by status.
- **Interview Planner:** Track upcoming interviews using saved interview dates.
- **Application Pipeline:** Visualize job-search progress using charts.
- **CSV Export:** Export filtered application records for reporting and analysis.
- **Skill Match Lab:** Compare resume skills against a job description using local keyword matching.
- **Responsive Interface:** Use the dashboard on desktop and mobile screens.
- **Demo Mode:** Explore the interface with sample data before configuring Appwrite.
- **Database Persistence:** Store and retrieve applications through Appwrite TablesDB when configured correctly.

*Note: Demo-mode data is temporary. The Skill Match Lab uses keyword matching, not a generative AI model.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tooling |
| Appwrite TablesDB | Database and persistent application records |
| Appwrite Web SDK | Frontend database integration |
| Recharts | Dashboard visualizations |
| Lucide React | Icons |
| CSS | Styling and responsive layout |
| Git and GitHub | Version control and source hosting |
| Vercel | Optional frontend deployment |

## 🏗️ Architecture

```text
JobTrack AI
    |
    v
React + Vite Frontend
    |
    +-- Dashboard and Analytics
    +-- Application Management
    +-- Search and Filters
    +-- Interview Planner
    +-- Skill Match Lab
    |
    v
Appwrite Web SDK
    |
    v
Appwrite TablesDB
    |
    +-- Database: jobtrack_db
    +-- Table: applications
```

The frontend communicates with Appwrite through its Web SDK. When Appwrite is configured, application records are stored in the database and can be retrieved after refreshing the page.

## 🗄️ Database Schema

**Database:** `jobtrack_db`

**Table:** `applications`

| Column | Type | Description |
|---|---|---|
| `company` | Varchar | Company name |
| `role` | Varchar | Job title |
| `location` | Varchar | Job location |
| `status` | Varchar | Application status |
| `jobType` | Varchar | Employment type |
| `salary` | Varchar | Salary or salary range |
| `appliedDate` | Varchar | Application date in YYYY-MM-DD format |
| `interviewDate` | Varchar | Scheduled interview date |
| `source` | Varchar | Application source |
| `jobUrl` | Varchar | Job posting URL |
| `notes` | String or long text | Follow-up notes |
| `description` | String or long text | Job description and requirements |

Configure the column types and lengths in Appwrite Console to match the application code. Appwrite's system-generated row ID identifies each application record.

## ⚙️ Getting Started

### Prerequisites

Install the following:

- [Node.js and npm](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- An [Appwrite Cloud](https://cloud.appwrite.io/) account for database functionality
- Git for version control

### 1. Clone the repository

After publishing the project to GitHub, run:

```bash
git clone https://github.com/YOUR_USERNAME/jobtrack-ai.git
cd jobtrack-ai
```

Replace `YOUR_USERNAME` with your GitHub username.

Alternatively, download the repository ZIP and extract it.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

The application should now be available in your browser.

## 🔌 Appwrite Configuration

### Step 1: Create an Appwrite project

1. Sign in to Appwrite Console.
2. Create a project named `JobTrack AI`.
3. Add a Web platform with `localhost` as the development hostname.
4. Copy your Project ID and the regional API endpoint.

### Step 2: Create the database and table

1. Open the project's Databases section.
2. Create a database named `jobtrack_db`.
3. Create a table named `applications`.
4. Add the columns specified in the database schema above.
5. Copy the database ID and table ID.

### Step 3: Configure environment variables

Copy `.env.example` to `.env.local` in the project root and add your configuration:

```env
VITE_APPWRITE_ENDPOINT=https://YOUR-REGION.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
VITE_APPWRITE_DATABASE_ID=YOUR_DATABASE_ID
VITE_APPWRITE_TABLE_ID=YOUR_TABLE_ID
```

Replace all placeholders with the actual values from Appwrite Console.

Restart the development server after changing environment variables.

### Step 4: Configure permissions

Ensure the Appwrite table permits the operations required by the application.

For a personal or multi-user production deployment, implement authentication and owner-specific permissions. Do not make private job application records publicly readable or writable.

**Security note:** Never place an Appwrite server API key in frontend code or commit secrets to GitHub. Variables prefixed with `VITE_` are exposed to the client.

### Step 5: Verify database connectivity

1. Start the application.
2. Add a test application.
3. Check whether the record appears in Appwrite TablesDB.
4. Refresh the browser and confirm the record remains.
5. Edit and delete the test record and verify the changes in Appwrite.

## 🧪 Testing

Before publishing the final project, verify the following:

- [ ] Application launches using `npm run dev`.
- [ ] Dashboard and analytics render correctly.
- [ ] New job applications can be created.
- [ ] Existing applications can be edited.
- [ ] Applications can be deleted.
- [ ] Search and status filters work.
- [ ] Interview dates are displayed correctly.
- [ ] CSV export generates a valid file.
- [ ] Skill Match Lab updates when input changes.
- [ ] Appwrite records persist across browser refreshes.
- [ ] The responsive layout works on mobile.
- [ ] Production build succeeds using `npm run build`.

### Production build

```bash
npm run build
npm run preview
```

Vite generates the production files in the `dist` directory.

## 🚀 Deployment

JobTrack AI can be deployed to Vercel.

1. Push the project to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Select Vite as the framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure the four Appwrite environment variables in the Vercel project settings.
7. Add your production domain to the Appwrite Web platform settings.
8. Deploy the project.
9. Test application creation, editing, deletion, and database persistence on the live site.

Only publish the deployment after verifying that the production environment works correctly.

## 💡 Future Enhancements

Potential improvements include:

- Appwrite Authentication and personalized dashboards.
- Automated follow-up reminders.
- Resume parsing and structured skill extraction.
- AI-powered job description analysis using a server-side AI integration.
- Application deadline notifications.
- Advanced analytics and job-search reports.
- Secure multi-user data isolation.
- Recruiter contact and follow-up management.

These are planned enhancements, not claims about currently implemented functionality.

## 🏆 Hackathon Submission

**Event:** Appwrite Databases Hackathon 2026

**Project:** JobTrack AI

**Database technology:** Appwrite TablesDB

**Repository:** `https://github.com/YOUR_USERNAME/jobtrack-ai`

**Demo video:** `ADD_YOUR_DEMO_VIDEO_URL`

The submission should include a public repository, a short demo video, and any other materials required by the official event dashboard.

Before submission, ensure the implementation follows the official hackathon rules, including the requirement that project code be newly created during the permitted hackathon period.

Official website: https://hackathon.appwrite.io/

## 📄 License

Choose and add an appropriate open-source license before publishing. The MIT License is one option if you want others to use, modify, and distribute the project under its terms.

---

**Built with React, Vite, and Appwrite TablesDB for the Appwrite Databases Hackathon 2026.**
