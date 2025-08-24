# Setup Guide

This guide will walk you through setting up the Next.js Responsive Template for your project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)

- **pnpm** (v8.0.0 or higher) - Recommended
  - Install: `npm install -g pnpm`
  - Check version: `pnpm --version`

- **Git**
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

## Step 1: Create Your Project

### Option A: Use as GitHub Template (Recommended)

1. Go to [github.com/johankaito/nextjs-responsive-template](https://github.com/johankaito/nextjs-responsive-template)
2. Click "Use this template" button
3. Create a new repository
4. Clone your new repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

### Option B: Clone Directly

```bash
# Clone the template
git clone https://github.com/johankaito/nextjs-responsive-template.git my-app
cd my-app

# Remove git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit from template"
```

## Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

## Step 3: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the project details:
   - **Project name**: Your app name
   - **Database password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Click "Create Project" and wait for setup to complete

### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **Anon/Public Key**: A long string starting with `eyJ...`
   - **Service Role Key** (optional): For server-side operations

### Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: Toggle based on your needs
   - **Enable double opt-in**: For production apps

### Set Up Database Tables (Optional)

If you want to use the example schema:

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Run this SQL to create the example tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table (example)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view published posts" 
  ON posts FOR SELECT 
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users can create own posts" 
  ON posts FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" 
  ON posts FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" 
  ON posts FOR DELETE 
  USING (user_id = auth.uid());

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   # Required
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Optional (for server-side operations)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Optional (for production)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## Step 5: Run the Development Server

```bash
# Start the development server
pnpm dev

# Or with npm
npm run dev

# Or with yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Setup

1. **Home Page**: Should display the landing page
2. **Sign Up**: Create a test account
3. **Email Confirmation**: Check your email for confirmation (if enabled)
4. **Login**: Sign in with your credentials
5. **Dashboard**: Access the protected dashboard

## Common Issues & Solutions

### Issue: "Invalid API key" error
**Solution**: Double-check your Supabase keys in `.env.local`. Make sure there are no extra spaces or quotes.

### Issue: "Failed to fetch" errors
**Solution**: Ensure your Supabase project is active and the URL is correct.

### Issue: Email confirmation not received
**Solution**: 
- Check spam folder
- In Supabase: Authentication → Settings → Disable email confirmations for development

### Issue: Build errors with TypeScript
**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

### Issue: Database connection errors
**Solution**: 
- Ensure your Supabase project is not paused (free tier pauses after 1 week of inactivity)
- Check if RLS policies are correctly set up

## Next Steps

1. **Customize Theme**: Edit `src/lib/theme-config.ts`
2. **Add Components**: Use shadcn/ui CLI to add more components
3. **Modify Schema**: Update `src/types/drizzle.ts` with your tables
4. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## Getting Help

- **Documentation**: Check the [docs](https://github.com/johankaito/nextjs-responsive-template/tree/main/docs) folder
- **Issues**: Open an issue on [GitHub](https://github.com/johankaito/nextjs-responsive-template/issues)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
