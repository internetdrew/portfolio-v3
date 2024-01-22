---
layout: "../../layouts/BlogLayout.astro"
title: "Supabase Password-less Authentication with the Next.js Pages Router"
pubDate: 2024-01-21
description: "How to leverage Supabase's Magic Link authentication using Next.js' Pages router."
author: "Andrew Rowley"
image:
  url: "https://docs.astro.build/assets/full-logo-light.png"
  alt: "The full Astro logo."
tags: ["supabase", "next.js", "authentication"]
---

## What You'll Learn

You'll learn how to set up password-less signup and login flows. We’ll set things up so that:

- Users can signup for accounts with other necessary profile creation data (username, etc.) for your profiles table.
- Users can login with just their email address.
- Users cannot sign up at login.
- We automate a new user signup to create a new profile for us to access in our database in the public schema.
