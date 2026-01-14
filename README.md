
# NotifyHub - Enterprise Email Inventory

A professional-grade email inventory management and notification system.

## Features
- **Inventory Management:** Full CRUD operations for Application Groups.
- **Email Resolution:** Automatically resolves "To" and "CC" fields based on group roles.
- **Rich Text Support:** Built-in Quill editor for professional announcements.
- **Data Persistence:** Uses browser LocalStorage for client-side persistence.
- **Search:** Global real-time search across all group names and emails.

## Local Development
1. Clone the repository.
2. Run `npx serve .` to start a local server.
3. Open `http://localhost:3000`.

## Deployment
This is a static application. You can deploy it by simply uploading the files to any static host:
- **Vercel:** Connect your GitHub repo and deploy. No build command needed.
- **Netlify:** Drag and drop the folder into the Netlify UI.
- **GitHub Pages:** Enable Pages in your repository settings.

## Security Note
This application currently stores data in `LocalStorage`. For production environments requiring shared data between users, replace `services/db.ts` with a REST/GraphQL API.
