---
layout: "../../layouts/BlogLayout.astro"
title: "Building and Testing an OTP UI Component with React and TypeScript"
pubDate: 2024-08-20
description: "Learning how to validate and test using React Hook Form, Zod, and Jest."
author: "Andrew Rowley"
image:
  url: "detecting-outside-clicks-banner.jpg"
  alt: "Detecting Outside Click Events with JavaScript"
tags: ["supabase", "next.js", "authentication"]
---

## Table of Contents

## What You'll Learn

In this post, you'll learn how to build a One-Time Password UI component with [TailwindCSS](https://tailwindcss.com/), how to validate user input with [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/), and how to test user interactivity with your component using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

I will try to be as in-depth as possible regarding the challenging bits of bringing this together (input validation, testing, mocking functions, etc.), but I won't be focusing on things like styling. If you're building something like this, I feel it safe to make a few assumptions. These assumptions are listed below.

## Assumptions I've Made

- You are not exactly a beginner.
- You are familiar with React.
- You may not have written a test before or are very new to testing.
- My styles are irrelevant because you may need completely different styles.

## Getting Started
