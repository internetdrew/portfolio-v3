---
title: "Build a Fast, Lean Full-Stack Application with React and Express"
description: "Quickly go from 0 to 1 building a lightweight stack that provides speed, great tooling, and eliminates the black-box nature of meta-frameworks."
pubDate: 2025-10-11
ogImageSrc: "001.png"
isDraft: true
---

## Table of Contents

## Why React + Express

I like using React and Express because they let you build bloat-free full-stack applications that stay lightweight and fast.

The biggest value for me is having full control and transparency, without the black-box behavior you often get from meta-frameworks. After spending over a year with Next.js, I went back to this base setup for a few reasons:

1. I ran into several cases where framework abstractions made standard web tasks surprisingly difficult.
2. Those abstractions can hide how things actually work, which slows down learning for newer developers.
3. I find this setup to be dramatically faster to develop with, especially for smaller or early-stage projects.

That doesn’t make meta-frameworks bad. They just do more of the driving for you. Sometimes that’s great. But sometimes it hides too much.

## What You'll Learn

- How to create a simple full-stack application with React (via Vite) and Express
- How to connect your API layer through Vite’s proxy server in a clean, semantically-friendly way

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (at the time of writing this, the Long Term Support(LTS) version of Node.js is v22.20.0)

## Scaffolding the Codebase

To start off, we'll start by scaffolding our directories.

First, let's start by opening your terminal and creating your directory:

```bash
mkdir react-express
```

Now we can change our current directory and make the client and server directories:

```bash
cd react-express && mkdir client server
```

Once we have this, we can create out application with clear separation. First, we'll create the React-based front-end of our application.

## Creating the Client

To build the React front-end, we'll be using a [Vite, a fast, lightweight build tool](https://vite.dev/guide/). If you normally use `create-react-app`, I strongly encourage you to [use something else due to its deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app).

In our client directory:

```bash
npm create vite@latest .
```

Follow the prompt to install and, when prompted to select a framework, choose React then select your variant. Since I work primarily with TypeScript, I usually choose TypeScript + [SWC](https://swc.rs/) (a fast, Rust-based compiler).

At the time of writing this, `rolldown-vite` is experimental, so I'm opting out of that.

When prompted to install npm and start now, choose yes.

Doing so should install everything you need. You should now be able to visit [http://localhost:5173](http://localhost:5173/) to see the current front-end.

## Creating the Server

To build out our server, we will be using a handul of tools:

- [Express.js](https://expressjs.com/) (server framework)
- [nodemon](https://www.npmjs.com/package/nodemon) (for hot refreshes when we make changes to our server code)
- [ts-node](https://github.com/TypeStrong/ts-node) (to execute our TypeScript files)
- [TypeScript](https://www.typescriptlang.org/) (we'll install at the project level)

We'll start by installing Express:

```bash
npm install express --save
```

Then we can install nodemon, ts-node, and TypeScript as dev dependencies:

```bash
npm install -D nodemon ts-node typescript
```

To scaffold our server code, we'll create a `src` directory to house all of our source code and create our main server file:

```bash
mkdir src && touch src/index.ts
```

With that file, we can now write our server code:

```typescript
import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

If you get the `Could not find a declaration file for module 'express'.` error, you just need to install types for Express to get your IDE settled. In your terminal:

```bash
npm i --save-dev @types/express
```

Now that we wrote out our server code, we need a script to run it. Right now, you might have this in your `package.json` file:

```json
{
  "devDependencies": {
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

To run our development server, we need to add `scripts` to the json object. Once we add that dev script, we should have this:

```json
{
  "scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts"
  },
  "devDependencies": {
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

This script in a nutshell:

1. Use nodemon to watch for changes to TypeScript (.ts) files throughout the `src` directory.
2. Whenever changes are made, run `ts-node` to execute the code in `src/index.ts`

By doing this, we make sure our server automatically restarts when we make changes. Without this, every time we make a change to the code, we would have to manually kill the server and bring it back up again.

You don't want those problems.
