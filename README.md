# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c271e109-ee83-4ba3-bf2a-f491004daadb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c271e109-ee83-4ba3-bf2a-f491004daadb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

There are two main ways to deploy your project:

1. **Using Lovable (Recommended)**
   - Open [Lovable](https://lovable.dev/projects/c271e109-ee83-4ba3-bf2a-f491004daadb)
   - Click on Share -> Publish
   - Your app will be instantly deployed and you'll get a public URL

2. **Using your own hosting (Advanced)**
   - Deploy to Netlify:
     1. Sign up for a [Netlify](https://www.netlify.com/) account
     2. Connect your GitHub repository
     3. Configure the build settings:
        - Build command: `npm run build`
        - Publish directory: `dist`
   - Deploy to Vercel:
     1. Sign up for a [Vercel](https://vercel.com/) account
     2. Import your GitHub repository
     3. Vercel will automatically detect the correct build settings
   - Deploy to GitHub Pages:
     1. Go to your repository settings
     2. Navigate to Pages
     3. Configure GitHub Actions for deployment

## I want to use a custom domain - is that possible?

We don't support custom domains (yet) in Lovable's built-in deployment. If you want to deploy your project under your own domain then we recommend using Netlify or Vercel. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)