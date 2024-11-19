---
title: "Bringing Lost & Found HQ to Life"
pubDate: 2024-10-22
description: "That time I lost my wallet and built an app to help others recover their lost items."
author: "Andrew Rowley"
image:
  url: "lost-and-found.png"
  alt: "Bringing Lost & Found HQ to Life"
tags: ["react", "typescript"]
---

## Table of Contents

## That Time I Lost My Wallet

It seems as though everyone loses their wallet at least once in their lifetime. I hope this is my one and only time.

When I realized I lost my wallet, I went to Google Maps and started looking up every store in the vicinity of where I went, called some multiple times before getting an answer, gave a description several times and had to wait for some places to call me back and, in one instance, had to wait until the next morning to see if I could speak to someone who would know.

This was a bit of a headache. And I'm sure people lose things in or around businesses all the time, in which case there are people doing exactly what I'm doing, which takes staff away from core tasks to then ask around for a lost item.

What if I could make this process easier?

## Enter Lost & Found HQ

The goal of [**Lost & Found HQ**](https://www.lostandfoundhq.com/) is to help businesses reunite their customers with their lost belongings with ease.

It would be great if when an item is lost within a business:

- Staff could log the item and allow customers to see what's been lost via a public portal for the location.
- Customers can search for their lost items on the public-facing portal.
- To claim an item, customers fill out a form describing the lost item in detail.
- Staff can review claims and approve them or request more information.
- When a claim is approved, the system generates a unique code for the customer.
- The customer presents this code when picking up the item.
- Staff can easily mark items as returned in the system.

## What Happens Here?

I want to use this space as a pseudo-changelog. I'm sure I'll run into some headaches along the way, but here's where you can visit and see what aspect of this I am currently working on and challenges faced along the way.

## Source Code and Live App

You can find the source code for Lost & Found HQ on [GitHub](https://github.com/internetdrew/lost-and-found-hq). The live application is available at [lostandfoundhq.com](https://www.lostandfoundhq.com/).

## Mission Log

### Oct. 22, 2024: Initial Setup and UI

- Starting work on the home page.
- Building with [Vite-based React](https://vite.dev/), leveraging [shadcn for UI components](https://ui.shadcn.com/).
- Add initial front-end validation for login/signup flows using [Zod](https://zod.dev/).
- Render a special message for users on successful criteria.
<div style="position: relative; padding-bottom: 53.78486055776893%; height: 0;"><iframe src="https://www.loom.com/embed/1104fbe532a246e0883b094788bade69?sid=4f45018b-b222-4b57-9f57-d30bce000242" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

### Oct. 23, 2024: Integrate Initial Express Server

- Added the Express-based server to the repo.
- Added server proxy to connect the frontend and backend ports for seamless integration.
- Created a [Vite, Express, Vercel starter kit to help other developers save time attempting a similar setup](https://github.com/internetdrew/vite-express-vercel).

### Oct. 27, 2024: Implement Authentication Flows and Added Functionality for Adding Items

- Added full functionality for signup, login, and logout leveraging [Supabase for auth](https://supabase.com/auth).
- When logged in, users are re-routed to the dashboard from the home page to avoid interaction with the then-unnecessary signup and login forms.
- I protected the dashboard page, sent non-authenticated visits to the home page, and replaced the route so they couldn't backtrack.
- Adds a new modal-based form to add new items to the list.
- Adds front-end validation of form inputs.
- Improves notifying users of auth errors via [React Hot Toast](https://react-hot-toast.com/).

### Oct. 31, 2024: Fixing Protected and Guest-Only Reroutes - From Client to Server

- Added a dynamic wrapper to discern between guest-only public and user-only authenticated routes.
  - This helps move authed users back to the dashboard (no need for them to see sign-in/login forms) and redirects unauthenticated guests back to those forms if they attempt to access the dashboard.
  - This also eliminated the flicker issue when re-directing users.
- Adds middleware to add the user object to requests to protect authenticated API endpoints.
- Added versioning to the API for better maintainability.
- Improved API error handling and user feedback via toast notifications.
- Adds the ability for users to create a new location, which enables them to add new items for that location.
- Adds new endpoints for data handling and CRUD operations.
- Disables the add item button when the user has no locations.
- Adds a tooltip to hint towards location creation before creating new item tickets.
<div style="position: relative; padding-bottom: 53.94605394605395%; height: 0;"><iframe src="https://www.loom.com/embed/1c864e0a47e64755842f793359da8058?sid=04c9a743-e34b-4694-91d0-cf5d604ff2a1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

### Nov 19, 2024: Take Lost & Found HQ For a Test Drive

- Users now have access to a test user account via Test Drive
- Users can now create, update, and delete items on the dashboard
- Visitors can now sign up to get future updates on launch status
<div style="position: relative; padding-bottom: 53.89221556886228%; height: 0;"><iframe src="https://www.loom.com/embed/46da7fb882e34378a05d7cf7442b5aed?sid=846ab969-cee0-40cf-894c-8dc7c7f34516" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
