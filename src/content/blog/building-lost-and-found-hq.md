---
title: "Bringing Lost & Found HQ to Life"
pubDate: 2024-10-22
description: "That Time I Lost My Wallet and Built an App Around the Experience"
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

The goal of [**Lost & Found HQ**](https://www.lostandfoundhq.com/) is to help businesses reconnect people with their lost belongings with as little phone tag as possible.

It would be great if when an item is lost within a business:

- Staff could log the item and allow customers to see what's been lost via a public portal for the business.
- Customers can search for their lost items on the public-facing portal.
- They can filter by business, location, date, and item type.
- To claim an item, customers fill out a form describing the lost item in detail.
- Staff review claims and can approve or request more information.
- When a claim is approved, the system generates a unique code for the customer.
- The customer presents this code when picking up the item.
- Staff can easily mark items as returned in the system.

## What Happens Here?

I want to use this space as a pseudo-changelog. I'm sure I'll run into some headaches along the way, but here's where you can visit and see what aspect of this I am currently working on and challenges faced along the way.

## Mission Log

### 2024-10-22: Initial Setup and UI

- Starting work on the home page.
- Building with [Vite-based React](https://vite.dev/), leveraging [shadcn for UI components](https://ui.shadcn.com/).
- Add initial front-end validation for login/signup flows using [Zod](https://zod.dev/).
- Render a special message for users on successful criteria.
<div style="position: relative; padding-bottom: 53.78486055776893%; height: 0;"><iframe src="https://www.loom.com/embed/1104fbe532a246e0883b094788bade69?sid=4f45018b-b222-4b57-9f57-d30bce000242" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
