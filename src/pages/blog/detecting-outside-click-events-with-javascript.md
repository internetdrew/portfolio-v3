---
layout: "../../layouts/BlogLayout.astro"
title: "Detecting Outside Click Events with JavaScript"
pubDate: 2024-01-23
description: "Leveraging X and Y client coordinates via the getBoundingClientRect() method."
author: "Andrew Rowley"
image:
  url: "src/images/supabase-passwordless-auth-banner.jpg"
  alt: "blog post banner image"
tags: ["supabase", "next.js", "authentication"]
---

## Table of Contents

## What You'll Learn

A simple and easy way to handle click events outside of an element without needing any external libraries/packages.

## Why Use the getBoundingClientRect() Method?

You want to find the clicks that happen outside of an element. Using `getBoundingClientRect()` will give you rectangular coordinates for your element on the client.

If you have the coordinates that tell you where the "walls" of your element are, you can easily measure whether an event happens within or outside of those walls.

## How to Use getBoundingClientRect() to Detect Outside Clicks
```javascript
  const menuControl = document.getElementById("menu-control");

  document.addEventListener("click", (e) => {
    const menuControlRect = menuControl?.getBoundingClientRect()!;

    const clickX = e.clientX;
    const clickY = e.clientY;

    if (
      clickX < menuControlRect?.left ||
      clickX > menuControlRect?.right ||
      clickY < menuControlRect?.top ||
      clickY > menuControlRect?.bottom
    ) {
      if (menu?.classList.contains("opacity-100")) {
        menu.classList.remove("opacity-100");
        menu.classList.add("invisible");
        menu.classList.add("opacity-0");
        rightCarat?.classList.remove("rotate-90");
        return;
      }
    }
  });
```
In the above code, we are isolating everything that the menu action consists of. That means, if you have a drop down menu, this should be the element that is the entire containing element you need to detect an outside click from.

Your click event will have coordinates attached to it. You will be able to pinpoint the X and Y coordinates on the client.

Your return value from getBoundingClientRect() will contain the coordinates of the top, right, bottom, and left sides of the element you want to identify outside clicks from.

X coordinates are numberical values measured from left to right, while Y coordinates are measured from top to bottom. 

Our `if` statement contains conditions that determine if the click event occurs:
- to the left or right of the element's boundaries or 
- above or below the element's top or bottom edges.

If that's the case, we have an ouside click.

Fin.