---
layout: "../../layouts/BlogLayout.astro"
title: "Supabase Password-less Authentication with the Next.js Pages Router"
pubDate: 2024-01-21
description: "How to leverage Supabase's Magic Link authentication using Next.js' Pages router."
author: "Andrew Rowley"
image:
  url: "public/supabase-passwordless-auth-banner.jpg"
  alt: "Supabase Password-less Authentication with the Next.js Pages Router"
tags: ["supabase", "next.js", "authentication"]
---

## Table of Contents

## What You'll Learn

You'll learn how to set up password-less signup and login flows. We’ll set things up so that:

- Users can signup for accounts with other necessary profile creation data (username, etc.) for your profiles table.
- Users can login with just their email address.
- Users cannot sign up at login.
- We automate a new user signup to create a new profile for us to access in our database in the public schema.

## Assumptions Made Before Proceeding

To make this as direct as possible, I assume you:

- Have Next.js installed and have already installed packages based on the Supabase authentication docs.
- Have a set up a public schema to handle your user/profile data.
- You’re using TypeScript.

## Initial Packages Needed

```javascript
npm install @supabase/ssr @supabase/supabase-js
```

In this tutorial, I’m using [the recommended supabase/ssr package instead of Auth Helpers](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers).

In order to make this work properly, you need to already have your database set up. This matters because in order to verify the user, the server client relies on the typing of your database. I am not sure if this matters as much if you you’re using JS instead of TS. This is just how I got it to work after much trial and error.

## Setting Up the Database
Let’s say our profiles table looks something like this in our database:

```javascript
profiles: {
  Row: {
    avatar_url: string | null;
    created_at: string;
    display_name: string;
    email: string;
    id: string;
    username: string;
  }
}
```

Here’s the SQL definition for greater clarity:

```sql
create table
  public.profiles (
    id uuid not null,
    created_at timestamp with time zone not null default now(),
    username character varying not null,
    display_name character varying not null,
    avatar_url character varying null,
    email text not null,
    constraint profiles_pkey primary key (id),
    constraint profiles_email_key unique (email),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

## Triggering New Profile Creation from `auth.users`
Supabase’s auth table is read-only. You will want to manage app-relevant user data in your own tables. To make that process easy, we will create a trigger connected to auth.

This is a trigger and function combination I wrote (feel free to break away from this) so that a new profile row is only created when the row in auth.users updates it’s default null value for last_sign_in_at (signifying an un-verified user) to a value that is not null (successful verification).

```sql
create function public.handle_new_user()
returns trigger as $$
begin
IF NEW.last_sign_in_at IS NOT NULL AND OLD.last_sign_in_at IS NULL THEN
  insert into public.profiles (id, username, display_name, email)
  values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'email');
  END IF;
  return new;
end;
```

```sql
create trigger on_confirmed_auth
after
update on auth.users for each row
execute function public.handle_new_user ();
```
Now, once our authentication process is successful, a new user will be added to `auth.users`, which will trigger the function to create a new row in the profiles table for our new user, but only when their `last_sign_in_at` is no longer `null`, which happens on a successful signup.

## Generating the Database Interface
Without this piece, I believe the very last step of verification failed repeatedly. So, I guess we can say this is necessary in some situations.

First, create a `types` directory at the root of the project directory and create a `supabase.ts` file. Next, run these in your CLI:

```
npm i supabase@">=1.8.1" --save-dev
```
```
npx supabase login
```
```
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > types/supabase.ts
```

Here, replace that `$PROJECT_REF` with your actual project ID (no need for quotes around it). To find it, open your project **dashboard**, head to **Settings**, look for **General Settings**, and find your **Reference ID**.

Once you run the commands, you should see the interface for your database in the file. And it’s an exported interface, which we will need when we create the server client.

## Setting Up User Signup
When we sign up a user, we want them to be able to include other information in their profile. That might look like this in our database:

```javascript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../types/supabase.ts';

const signUpNewUser = async (signUpData) => {
          const supabaseClient = createBrowserClient<Database>(
	       process.env.NEXT_PUBLIC_SUPABASE_URL!,
	       process.env.NEXT_PUBLIC_SUPABASE_KEY!
	);

  const { data, error } = await supabase.auth.signInWithOtp({
      email: signUpData.email,
      options: {
        data: {
          email: signUpData.email,
          username: signUpData.username,
          display_name: signUpData.displayName,
        },
	// Wherever you want the user to go once they click the link.
	// You can add this url at 
	// dashboard -> authentication -> URL configuration under 
	// Redirect URLs.
        emailRedirectTo: 'http://localhost:3000/login',
      },
    if(error){
       // Logic to handle it...
      };
  };
```

So, while avatar urls are optional, everything else is required to create a profile in the profiles table.