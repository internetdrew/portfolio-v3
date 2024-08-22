---
layout: "../../layouts/BlogLayout.astro"
title: "Building and Testing an OTP UI Component with React and TypeScript"
pubDate: 2024-08-22
description: "Composing, validating, and testing using React Hook Form, Zod, and Jest."
author: "Andrew Rowley"
image:
  url: "detecting-outside-clicks-banner.jpg"
  alt: "Building and Testing an OTP UI Component with React and TypeScript"
tags: ["supabase", "next.js", "authentication"]
---

## Table of Contents

## What You'll Learn

In this post, you'll learn how to build a One-Time Password UI component with [TailwindCSS](https://tailwindcss.com/), how to validate user input with [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/), and how to test user interactivity with your component using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

I will try to be as in-depth as possible regarding the challenging bits of bringing this together (input validation, testing, mocking functions, etc.), but I won't be focusing on things like styling. If you're building something like this, I feel it safe to make a few assumptions. These assumptions are listed below.

## Assumptions I've Made

- You are not exactly a beginner.
- You are familiar with React.
- You have a basic understanding of TypeScript.
- You may not have written a test before or are very new to testing.
- My styles are irrelevant because you may need completely different styles.

## Getting Started

Because of the aforementioned assumptions, we'll start with the OTP component assembled and styled. You can find the code to start with in [this GitHub repository](https://github.com/internetdrew/otp-react-ts-jest). If you'd like to fully follow and code-along, be sure to visit the **starter** branch. If you want to just see the final product, you can visit the **final** branch. Instructions for how to access each are in the repo's `README.md`.

In the starter branch, you can see we have our `<OneTimePasswordForm />` component. It contains a title, subtitle, 6 inputs, and a submit button.

We have everything we need to take care of our first task: managing input focus.

## Managing Input Focus

For the input focus states, we want two things to happen:

1.  We want focus to be on the first input when the page loads.
2.  We want the focus to switch to the following input when a user inputs a number.

### Input Focus on Page Load

To focus the input on page load, I leveraged refs here.

At the top of the `<OneTimePasswordForm />` component code, we can add the input refs:

```typescript
const inputRefs = useRef<HTMLInputElement[]>([]);
```

And reference each element to create the array of refs:

```typescript
ref={el => (inputRefs.current[index] = el!)}
```

By referencing each input, we can directly control behaviors for each. Now that we have the refs, we can use a the `useEffect` hook with an empty dependency array to focus on the first input when the component is mounted:

```typescript
useEffect(() => {
  inputRefs?.current[0].focus();
}, []);
```

Click outside of that first input and reload the page and now, when a user lands on this page, the focus is automatically in the first input and the user can skip the step of manually navigating to it.

### Handling User Input and Progressing Input Focus

Next, we want to do a few things when it comes to user input. Although we are sending a numeric code, we should never assume that the user will always abide by this constaint.

To protect against input that is not a number, we can leverage an onInput callback function:

```typescript
const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
  const value = e.currentTarget.value;
  if (isNaN(Number(value))) {
    e.currentTarget.value = "";
    return;
  }

  if (value.length > 1) {
    e.currentTarget.value = value.slice(0, 1);
  }
  if (value.length === 1 && index < inputRefs.current.length - 1) {
    inputRefs.current[index + 1].focus();
  }
};
```

In the callback, we cover a few cases:

- In the event that the input value is not a number, we disregard it and keep the value of the input as an empty string.
- If the value is pushed to be greater than 1 digit in length (perhaps someone goes back and accidentially types a second digit or tries to break the form), the value is then truncated to the first digit and all subsequent attempts are ignored.
- If there is 1 digit in the input and the index of that input is less than the length of the input - 1 (any input except the last one, at index 5), trigger focus on the input element at the following index.

By implementing this functionality, we ensure that inputs are numbers and not letters or special characters and also help the user get to the next input without needing to use their mouse or tab over to the next input element, offering a seamless user experience.

Now, as they enter one digit, as long as the input is valid, they will automatically focus on the next input for the following digit in the sequence.

Here's what our code looks like thus far:

```typescript
import { useEffect, useRef } from 'react';

const OneTimePasswordForm = () => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const value = e.currentTarget.value;
    if (isNaN(Number(value))) {
      e.currentTarget.value = '';
      return;
    }

    if (value.length > 1) {
      e.currentTarget.value = value.slice(0, 1);
    }
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    inputRefs?.current[0].focus();
  }, []);

  return (
    <form className='max-w-md bg-slate-200 flex flex-col gap-4 p-6 rounded-md'>
      <div>
        <h1 className='font-semibold text-xl'>Verify your email address</h1>
        <p>Please enter the 6-digit code we sent to your email address.</p>
      </div>
      <div className='flex justify-between gap-4'>
        {Array.from({ length: 6 }, (_, index: number) => {
          return (
            <input
              key={`otp.${index}`}
              inputMode='numeric'
              maxLength={1}
              className='p-2 flex-1 w-1/6 rounded-md no-spinner text-slate-900 text-center text-xl'
              ref={el => (inputRefs.current[index] = el!)}
              onInput={e => handleInput(e, index)}
            />
          );
        })}
      </div>
      <button className='bg-neutral-950 w-full p-2 rounded-md font-semibold text-slate-50'>
        Confirm
      </button>
    </form>
  );
};

export default OneTimePasswordForm;
```

While the current implementation provides a solid foundation, it lacks robust input validation beyond individual digit checks. To ensure API integrity and prevent misuse, we need to implement additional safeguards. For instance, we should verify that the user inputs all six digits before submission.

## Handling Overall Input Validation

To handle overall input validation in this form, we will install React Hook Form and Zod:

```sh
npm i react-hook-form zod @hookform/resolvers
```

At the top of the file, under the imports, we create a type for the input:

```typescript
type OtpFormInputs = {
  otp: string[];
};
```

Then we import Zod and use it to create an input schema:

```typescript
import { z } from "zod";

const schema = z.object({
  otp: z.array(z.string().length(1)).length(6),
});
```

Here, we're saying that our schema is expecting an otp (we can name this whatever we want) that is an array of exactly 6 strings, and each of which should only be 1 character long.

Now it's time to introduce React Hook Form:

```sh
npm i react-hook-form @hookform/resolvers
```

Once installed, we can set things up with a few imports and leverage the `useForm` hook in our component:

```typescript
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<OtpFormInputs>({
  resolver: zodResolver(schema),
});
```

This hook allows us to:

- Register an input so that React Hook Form can recognize it.
- Handle submit with custom functionality.
- Monitor errors associated with input values.

### Sharing Input Ref Usage

Because React Hook Form encompasses all input properties, but remember we are already referencing the refs for each input. React Hook Form also needs those refs, so we need to share the refs to keep our focus functionality and allow React Hook Form to leverage the refs.

```typescript
const { ref, ...rest } = register(`otp.${index}` as const);
```

We're doing two things here:

1. We destructure the reference to the input element to into the `ref` variable and capture any additional properties returned by the register function into the `rest` variable using the rest operator.

2. We use `as const` so that TypeScript knows that `otp.${index}` is one of the specific literals ('otp.0', 'otp.1', 'otp.2'), so it matches the expected type.

Now, we just need to pass the element to the ref callback and pass the rest of the properties from register to the input itself.

```jsx
<input
  key={`otp.${index}`}
  inputMode='numeric'
  maxLength={1}
  className='p-2 flex-1 w-1/6 rounded-md no-spinner text-slate-900 text-center text-xl'
  onInput={e => handleInput(e, index)}
  onKeyDown={inspectInputValidity}
  ref={el => {
  ref(el);
  inputRefs.current[index] = el!;
  }}
  {...rest}
/>
```

> **Note**: Your Implementation might be slightly different. If so, you can [learn more about sharing ref usage here](https://react-hook-form.com/faqs#Howtosharerefusage).

Here's what our code looks like thus far:

```typescript
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type OtpFormInputs = {
  otp: string[];
};

const schema = z.object({
  otp: z.array(z.string().length(1)).length(6),
});

const OneTimePasswordForm = () => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormInputs>({
    resolver: zodResolver(schema),
  });

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const value = e.currentTarget.value;
    if (isNaN(Number(value))) {
      e.currentTarget.value = '';
      return;
    }
    if (value.length > 1) {
      e.currentTarget.value = value.slice(0, 1);
    }
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    inputRefs?.current[0].focus();
  }, []);

  return (
    <form className='max-w-md bg-slate-200 flex flex-col gap-4 p-6 rounded-md'>
      <div>
        <h1 className='font-semibold text-xl'>Verify your email address</h1>
        <p>Please enter the 6-digit code we sent to your email address.</p>
      </div>
      <div className='flex justify-between gap-4'>
        {Array.from({ length: 6 }, (_, index: number) => {
          const { ref, ...rest } = register(`otp.${index}` as const);
          return (
            <input
              key={`otp.${index}`}
              inputMode='numeric'
              maxLength={1}
              className='p-2 flex-1 w-1/6 rounded-md no-spinner text-slate-900 text-center text-xl'
              ref={el => {
                ref(el);
                inputRefs.current[index] = el!;
              }}
              onInput={e => handleInput(e, index)}
              {...rest}
            />
          );
        })}
      </div>
      <button className='bg-neutral-950 w-full p-2 rounded-md font-semibold text-slate-50'>
        Confirm
      </button>
    </form>
  );
};

export default OneTimePasswordForm;
```

Now that we've registered our inputs, it's time to truly validate the completion of what we need before a user can proceed.

### Validating All Input Values are Present

Now that we have our inputs registered, we can leverage the schema we created earlier. Because we added our schema to the Zod resolver, React Hook Form can handle our error state for us.

Before we get to error messages, we need to break the default behavior of the form submission. If you submit the form right now, you will see the default behavior in your search bar:

```
http://localhost:5173/?otp.0=&otp.1=&otp.2=&otp.3=&otp.4=&otp.5=
```

We want React Hook Form to handle our error state for us based on the schema we gave it earlier. To do that, we need to create our own handler and pass it to `handleSubmit` function we destructured from the `useForm` hook.

For starters, we create a simple function just to see the data we get back on submission:

```typescript
const onSubmit: SubmitHandler<OtpFormInputs> = (data) => {
  console.log(data.otp);
};
```

And we add this functionality to the form element's onSubmit property:

```typescript
onSubmit={handleSubmit(onSubmit)}
```

To render a message for our overall form, we can leverage a Logical AND Operator so that when React Hook Form receives an error from a form submission attempt with incomplete data, it will halt the submission and add a UI element to notify the user.

```typescript
{errors.otp && (
    <span className='text-red-500 text-sm'>
      All fields are required to proceed.
    </span>
)}
```

With this, you will notice that if the input is incomplete in any way, React Hook Form will trigger the error and your submit function never fires. Only when the input is correct will React Hook Form allow the function to run.

And because you have errors indexed, you could even control more granular pieces by changing the border or outline color of any incomplete inputs, but that is a bit beyond the scope of this post.

With those changes, here's our updated code:

```typescript
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type OtpFormInputs = {
  otp: string[];
};

const schema = z.object({
  otp: z.array(z.string().length(1)).length(6),
});

const OneTimePasswordForm = () => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormInputs>({
    resolver: zodResolver(schema),
  });

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const value = e.currentTarget.value;
    if (isNaN(Number(value))) {
      e.currentTarget.value = '';
      return;
    }
    if (value.length > 1) {
      e.currentTarget.value = value.slice(0, 1);
    }
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const onSubmit: SubmitHandler<OtpFormInputs> = data => {
    console.log(data);
    const code = data.otp.join('');
    console.log('Send this code to your API: ', code);
  };

  useEffect(() => {
    inputRefs?.current[0].focus();
  }, []);

  return (
    <form
      className='max-w-md bg-slate-200 flex flex-col gap-4 p-6 rounded-md'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h1 className='font-semibold text-xl'>Verify your email address</h1>
        <p>Please enter the 6-digit code we sent to your email address.</p>
      </div>
      <div className='flex justify-between gap-4'>
        {Array.from({ length: 6 }, (_, index: number) => {
          const { ref, ...rest } = register(`otp.${index}` as const);
          return (
            <input
              key={`otp.${index}`}
              inputMode='numeric'
              maxLength={1}
              className='p-2 flex-1 w-1/6 rounded-md no-spinner text-slate-900 text-center text-xl'
              ref={el => {
                ref(el);
                inputRefs.current[index] = el!;
              }}
              onInput={e => handleInput(e, index)}
              {...rest}
            />
          );
        })}
      </div>
      {errors.otp && (
        <span className='text-red-500 text-sm'>
          All fields are required for submission.
        </span>
      )}
      <button className='bg-neutral-950 w-full p-2 rounded-md font-semibold text-slate-50'>
        Confirm
      </button>
    </form>
  );
};

export default OneTimePasswordForm;
```

And with that you've now:

- Created an OTP UI component
- Protected your component from invalid input
- Handled error messaging with ease
- Protected your API from submissions with incomplete data

## Integration Testing for the OTP Component

When working on a production team, it's essential to test your components. Integration testing is my primary focus, as it allows for rapid development while maintaining reliability and preventing unintended side effects.

Since this React app was built with [Vite](https://vitejs.dev/), we will be leveraging Vitest for testing along with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). In the event that you've built this and are more familiar with Jest and want to use it instead of Vitest, I would urge you to [reconsider that decision based on the headache of integration isues and redundancies between Vite and Jest](https://vitest.dev/guide/why.html).

This will likely make your life considerably easier for the rest of this post.

### Setting Up the Testing Environment

Let's start by installing Vitest, React Testing Library, and supporting types since we're using TypeScript:

```sh
npm install -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @types/react @types/react-dom
```

And adding our test script in our package.json file:

```json
"test": "vitest"
```

At the root of the app, create a `vitest.setup.ts` file:

```sh
touch vitest.setup.ts
```

Update `vitest.setup.ts` to cleanup after each test is run:

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

Then update `vite.config.ts` to reference these changes:

```typescript
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  plugins: [react()],
});
```

And include it in `tsconfig.app.json`:

```json
"include": ["src", "./vitest.setup.ts"]
```

This should be all we need to get our initial test going. Now we can create our test file:

```sh
touch src/App.test.tsx
```

### Testing for Successful Integration

And in the test file, we import our `<App />` component to test our integration of the `<OneTimePasswordForm />` in it:

```typescript
import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('Renders our OTP component in our app', () => {
    render(<App />);
    expect(screen.getByText('Verify your email address')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please enter the 6-digit code we sent to your email address.'
      )
    ).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
    expect(screen.getByRole('button', { name: /confirm/i }));
  });
});
```

Now we can run our test with `npm run test` and we should see a pass!

If you're unsure what's in here, I would suggest you [go through the docs on queries](https://testing-library.com/docs/queries/about).

### Testing User Interactivity

Now let's test for some user interactivity. The first thing we will test is what happens when the user tries to submit the form with incomplete inputs.

Let's install [user-event](https://testing-library.com/docs/user-event/intro):

```sh
npm i @testing-library/user-event
```

Then import it at the top of our test file:

```typescript
import userEvent from "@testing-library/user-event";
```

We need to do a few things for successful user interactivity testing:

1. Ensure that the callback for this test is an async function and
2. Setup the user variable above the render

```typescript
  it('Renders an error message when inputs are incomplete', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    screen.debug();
    expect(
      screen.getByText('All fields are required for submission.')
    ).toBeInTheDocument();
  });
```
