---
layout: "../../layouts/BlogLayout.astro"
title: "Sending Files to Cloudinary Over Rest API with Next.js"
pubDate: 2023-05-17
description: "A simple approach to sending files from user input for upload to your cloud service without exposing your cloud service API."
author: "Andrew Rowley"
image:
  url: "https://docs.astro.build/assets/full-logo-light.png"
  alt: "The full Astro logo."
tags: ["supabase", "next.js", "authentication"]
---

## Table of Contents

## Why This Matters

You've probably seen documentation and tutorials using Cloudinary directly in the client, either with an SDK or directly to the API. The problem with doing so is that every time you run the operation of sending the file over to Cloudinary, your endpoint is visible in the Network tab of your browser, making the endpoint vulnerable to malicious behavior.

By handling this as a restful API, we can do all of the work on the server and hide any secure URLs, only exposing our endpoint in the browser, which will be `/api/upload`.

This post largely addresses getting access to the file itself on the server side. So if you are not using Cloudinary, you can still follow along and deviate where I start diving into the Cloudinary SDK.

## Creating and Managing Our Form Data

I will also be a bit opinionated here because of how difficult form data can be in React. For everything I bring in, I'll explain how it saves you headaches.

First, we start with our Form component:

```javascript
export default function Form() {
  return (
    <main>
      <form>
        <input type="file" />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
```

The first thing I will bring in to easily manage the form data is [React Hook Form](https://react-hook-form.com/). Managing this one input doesn't warrant this package, but since most forms have multiple inputs of varied types, I strongly suggest you install this to make managing your data simple.

```
npm install react-hook-form
```

Once you have this installed, you can bring a few things in we will need:

```javascript
import { useForm } from "react-hook-form";

export default function Form() {
  const { register, handleSubmit } = useForm();

  return (
    <main>
      <form>
        <input type="file" />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
```

We'll use `register` and `handleSubmit` to take a closer look at our data. We use `register` to register our input data. In this instance, we'll register our file input as 'file'. This will be attached to the data object we get upon submission. To see that data object, we also need to use `handleSubmit`, which handles a submit function, which we can make here as `onSubmit`.

```javascript
import { useForm } from "react-hook-form";

const onSubmit = async (data) => {
  const { file } = data;
  console.log(file);
};

export default function Form() {
  const { register, handleSubmit } = useForm();

  return (
    <main>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register("file")} />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
```

When we submit, we get our data object, as seen in `onSubmit`. From there, we can de-structure the `file`. If we had another input and registered it as 'name', for instance, we could also de-structure the `{name}` from it, as the `data` object would have both `name` and `file` properties because of register.

```javascript
FFileList {0: File, length: 1}
 0: File
      lastModified: 1684160876984
      lastModifiedDate: Mon May 15 2023 10:27:56 GMT-0400 (Eastern Daylight Time) {}
      name: "filename.pdf"
      size: 69759
      type: "application/pdf"
      webkitRelativePath: ""
       [[Prototype]]: File
      length: 1
```
What you'll see when you `console.log(file)` is a `FileList`. At index `0` will be our `file`.

Now that we have our file, we can push it over to our API where we want to safely post to Cloudinary.

```
npm i axios
```

You could use the Fetch API for this, but I found there were issues with headers when using fetch. So... use Axios and save headaches on this one (or figure it out by digging around, if you truly want fetch).

```javascript
const onSubmit = async (data) => {
  const { file } = data;

  const res = await axios.post('/api/upload', file);
  console.log(res)
};
```
With the `POST` method, we push our file over to the other side, which is most likely where you started wanting to rip your hair out in confusion if you've attempted this before.

## Accessing the File Object on the Server
Depending on how you started your Next app, you'll either want to go to `/src/pages/api` or `/pages/api`. Next.js API Routes allow you to build your own API using Next.js, so there's no need to bring in Express (unless you just want to). You can [learn more about Next.js API Routes here](https://nextjs.org/docs/pages/building-your-application/routing/api-routes).

Within the API directory, you can see a `hello.js` file. You can take a look at that to see how things work and change the endpoint, but it's pretty straight-forward, so also feel free to just rename that or create a new `upload.js` file. That's what enables us to send that `POST` request over to `/api/upload`.

In `upload.js`, we need to export the handler function.

```javascript
export default async function handler(req, res) {
  console.log(req.body);
  return res.status(200).json('you made it.');
}
```

If you look at the request body, you'll see the string `'[object FileList]'`. But you don't need a string. You need a file! To get that file, we're going to use [Formidable](https://www.npmjs.com/package/formidable).

```javascript
npm install formidable
```
To use Formidable, we'll use a `Promise` as an efficient way to actually get the file .

Since we want Formidable to do all of the handling of the request, we'll want to stop automatic body parsing or we won't be able to access the file. So be sure to include the config export in the server so it turns off automatic request body parsing.

```javascript
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const file = await new Promise((resolve, reject) => {
    const form = formidable();
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
    });
    form.on('file', (formName, file) => {
      resolve(file);
    });
  });

  console.log(file);
  return res.status(200).json('you have the file.');
}
```

Here's what's happening above. First, we make sure that our handler is async. Within there, we define the `file` variable for when we resolve/reject the promise. We create an instance of formidable (`form`).

The first thing formidable will do is parse the request, and with a callback function that takes in `error`, `fields`, and `files` we can do some management and gain visibility. We don't actually get the file from here, but we can see if a file has made it successfully and is being detected if we `console.log(files)`. Since we don't access files directly from there, we just return the rejection of the promise along with the error if one occurs.

With `form.on`, however, we can tell formidable what we want to do when it detects a file. Here, we're telling formidable that when it does detect a file, we want it to resolve the promise with that file. We now have access to the `file` object we sent over from the front end! You should now see it logged as a `PersistentFile`.

## Uploading Your File to Cloudinary
While you can use the API endpoint directly, I used the SDK for a little simplicity (and easy clues on how to use it).

```
npm i cloudinary
```

And in `/api/upload`:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

In your Next app, you should see a file named `.env.local`. Those are your environment variables. You can store sensitive strings there. This file will not be added to your git repo, so things will be safe. To access those values on the server, you just add `process.env.WHATEVER_YOU_NAMED_IT` server side. You can [learn more about Next.js environment variables here](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

Before you can push the files to Cloudinary, you may need to change some settings. For example, in my use case, there is a strong likelihood that files will be PDFs, which Cloudinary does not allow you to upload by default. You might see that one page that says in order to unlock this capability you need to contact them, but that might just be old collateral. You can actually just [make some changes in your settings here](https://cloudinary.com/documentation/upload_images#unsigned_upload).

Now, with access to our file object, we can call on Cloudinary's uploader for `unsigned_upload` (again, you might not need to change settings depending on what you're doing). The SDK then expects two things. One is the `file`, which is the type of `string`, so what you really need is the `filepath` from within the `file` object. The other is the name of the preset from the settings I mentioned before.

```javascript
try {
    const data = await cloudinary.uploader.unsigned_upload(
      file.filepath,
      'preset-name'
    );
    return res.status(200).json(data.secure_url);
  } catch (error) {
    console.error(error);
  }
```

Once you do that, you can come back to the front end where your API call will now be met with the response from Cloudinary. I made the API call to just get back the `secure_url` for the uploaded file, which is why I sent back `data.secure_url`.

And that's it. A simple way to access your files with a restful API in Next.js!