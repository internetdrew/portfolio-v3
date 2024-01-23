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

If you have the coordinates that tell you where the boundaries of your element are, you can easily measure whether an event happens within or outside of those boundaries.

You can [learn more about the getBoundingClientRect here](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).

## How to Use getBoundingClientRect() to Detect Outside Clicks
```javascript
  const menuControl = document.getElementById("menu-control");

  document.addEventListener("click", (e) => {
    const menuControlRect = menuControl?.getBoundingClientRect()!;

    const clickX = e.clientX;
    const clickY = e.clientY;

    const outsideClick =
      clickX < menuControlRect?.left ||
      clickX > menuControlRect?.right ||
      clickY < menuControlRect?.top ||
      clickY > menuControlRect?.bottom;

    if (outsideClick) {
      someFunction()
    }
  });
```
In the above code, we are isolating everything that the menu element consists of. In my use case, that includes not only the menu itself but also the menu button I tap to open and close the menu. This is important because without including that button in the rect, it will detect those button presses as outside and close the menu immediately after opening it.

The click event will have X and Y coordinates attached to it.

Your return value from getBoundingClientRect() will contain the coordinates of the top, right, bottom, and left bounds of the element you want to identify clicks outside of.

Our `if` statement contains conditions that determine if the click event occurs:
- to the left or right of the element's boundaries or 
- above or below the element's top or bottom edges.

If that's the case, we have an ouside click.

Fin.