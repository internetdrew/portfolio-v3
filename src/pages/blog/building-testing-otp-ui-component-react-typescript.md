---
layout: "../../layouts/BlogLayout.astro"
title: "Building and Testing an OTP UI Component with React and TypeScript"
pubDate: 2024-08-23
description: "Composing, validating, and testing using React Hook Form, Zod, and Vitest."
author: "Andrew Rowley"
image:
  url: "building-testing-otp-ui-component-react-typescript.png"
  alt: "Building and Testing an OTP UI Component with React and TypeScript"
tags: ["react", "testing", "typescript", "mocking"]
---

## Table of Contents

## What We're Building

![otp-screnshot](/src/images/otp-screenshot.png)

In this post, we'll build a One-Time Password UI component with [TailwindCSS](https://tailwindcss.com/), validate user input with [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/), and test user interactivity with your component using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

I will try to be as in-depth as possible regarding the challenging bits of bringing this together (input validation, testing, mocking functions, etc.), but I won't be focusing on things like styling and component composition. If you're building something like this, I think styles are irrelevant.

The overall structure will be visible and, if you're not using Tailwind, you can also refer to the docs to figure out what classes do or just inspect the elements in your browser.

## Getting Started

We'll start with the OTP component composed and styled. You can find the code to start with in [this GitHub repository](https://github.com/internetdrew/otp-react-ts-vitest). If you'd like to fully follow and code-along, be sure to visit the **starter** branch. If you want to just see the final product, you can visit the **final** branch. Instructions for how to access each are in the repo's `README.md`.

In the starter branch, you can see we have our `<OneTimePasswordForm />` component. It contains a title, subtitle, 6 inputs, and a submit button.

We have everything we need to take care of our first task: **managing input focus**.

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

By referencing each input, we can directly control behaviors for each. Now that we have the refs, we can use the `useEffect` hook with an empty dependency array to focus on the first input when the component is mounted:

```typescript
useEffect(() => {
  inputRefs?.current[0].focus();
}, []);
```

Click outside of that first input and reload the page and now, when a user lands on this page, the focus is automatically in the first input and the user can skip the step of manually navigating to it.

### Handling User Input and Progressing Input Focus

Next, we want to do a few things when it comes to user input. Although we are sending a numeric code, we should never assume that the user will always abide by this constraint.

To protect against input that is not a number, we can leverage an `onInput` callback function:

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
- If the value is pushed to be greater than 1 digit in length (perhaps someone goes back and accidentially types a second digit or tries to intentionally enter a 2-digit number), the value is then truncated to the first digit and all subsequent attempts are ignored.
- If there is 1 digit in the input and the index of that input is less than the length of the input - 1 (any input except the last one), trigger focus on the next input element.

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

While the current implementation provides a solid foundation, it lacks robust input validation, particularly regarding the completeness of the 6-digit code. To maintain API integrity, prevent misuse, and provide clear feedback to users, we should implement additional safeguards. This includes verifying that all six digits are entered before submission.

## Handling Overall Input Validation

To handle overall input validation in this form, we will install React Hook Form and Zod:

```sh
npm i react-hook-form zod @hookform/resolvers
```

At the top of `OneTimePasswordForm.tsx`, under the imports, we create a type for the input:

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

We are already using our input refs but React Hook Form also needs them. We need to share the ref of each input to keep our focusing functionality and allow React Hook Form to also leverage them.

```typescript
const { ref, ...rest } = register(`otp.${index}` as const);
```

We're doing two things here:

1. We destructure the from the register function and [use spread syntax to pass everything else into the `rest` variable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

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
  const code = data.otp.join("");
  console.log(code);
};
```

And we add this functionality to the form element's `onSubmit` property:

```typescript
onSubmit={handleSubmit(onSubmit)}
```

To render a message for our overall form, we can leverage a [Logical AND](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) so that when React Hook Form receives an error from a form submission attempt with incomplete data, it will halt the submission and add a UI element to notify the user.

```typescript
{errors.otp && (
    <span className='text-red-500 text-sm'>
      All fields are required to proceed.
    </span>
)}
```

With this, you will notice that if the input is incomplete in any way and the user attempts to submit the form, React Hook Form will receive the error, the UI element will now be displayed, and the submit function never fires. Only when the input is correct will React Hook Form allow the function to run.

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

  const onSubmit: SubmitHandler<OtpFormInputs> = (data) => {
    const code = data.otp.join('');
    console.log(code);
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

And with that we've now:

- Created an OTP UI component
- Protected the component from invalid input
- Handled error messaging with ease
- Protected the API (you're sending this data somewhere, right?) from submissions with incomplete data

## Adding a Success Toast and Resetting the Form

Let's add one of my favorite libraries for toast notifications — [React Hot Toast](https://react-hot-toast.com/).

Let's install it:

```sh
npm install react-hot-toast
```

In App.tsx, let's import and add our Toaster:

```typescript
import OneTimePasswordForm from './components/OneTimePasswordForm';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className='h-screen flex items-center justify-center bg-neutral-950'>
      <OneTimePasswordForm />
      <Toaster />
    </div>
  );
}

export default App;
```

Then in our `<OneTimePasswordForm />`, we can add a success toast when our `onSubmit` function successfully fires:

```typescript
import toast from "react-hot-toast";

const onSubmit: SubmitHandler<OtpFormInputs> = (data) => {
  const code = data.otp.join("");
  toast.success(`Entered code: ${code}`);
};
```

I added this because it also forces us to dive into another aspect of testing called mocking. In order to test for success, we will need to mock the implementation of the `<Toaster />` component and spy on the functionality of the `toast` itself for different statuses (in this case, only success).

We'll also add one more thing for good UX — we need the form to reset on successful submission. To do that, we need both `reset` and `isSubmitSuccessful` from React Hook Form:

```typescript
const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitSuccessful },
} = useForm<OtpFormInputs>({
  resolver: zodResolver(schema),
});
```

And we create a `useEffect` so that when a send is successful, the form resets to its initial state:

```typescript
useEffect(() => {
  reset();
}, [reset, isSubmitSuccessful]);
```

## Integration Testing for the OTP Component

When working on a production team, it's essential to test your components. Integration testing is my primary focus, as it allows for rapid development while maintaining reliability and preventing unintended side effects.

Since this React app was built with [Vite](https://vitejs.dev/), we will be leveraging [Vitest](https://vitest.dev/) for testing, as well as [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). In the event that you're more familiar with Jest and want to use that instead of Vitest, I would urge you to [reconsider that decision based on the headache of integration isues and redundancies between Vite and Jest](https://vitest.dev/guide/why.html).

This will likely make your life considerably easier for the rest of this post.

### Setting Up the Testing Environment

Let's start by installing Vitest, React Testing Library, and supporting types since we're using TypeScript:

```sh
npm install -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @types/react @types/react-dom
```

And adding our test script in our `package.json` file in the `scripts` object:

```json
"test": "vitest"
```

At the root of the app, create a `vitest.setup.ts` file:

```sh
touch vitest.setup.ts
```

Update `vitest.setup.ts` to cleanup after each test is run and give us access to jest-dom:

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

Then update `vite.config.ts` to reference these changes. Note that the first line's _reference_ is **necessary** for access to test. Without it, your IDE will likely throw warnings your way on the test object:

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

Now include the setup file in `tsconfig.app.json`:

```json
"include": ["src", "./vitest.setup.ts"]
```

This should be all we need to get our initial test going. Now we can create our test file:

```sh
touch src/App.test.tsx
```

### Testing for Successful Integration

In the test file, we import our `<App />` component to test our integration of the `<OneTimePasswordForm />` in it:

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

### Our Final Integration Tests

With these, we should have a great user-experience and enough context to build out good tests.

Earlier, I mentioned that we would have to mock some implementation and functionality from React Hot Toast. To get a better understanding of my approach to mocking the toast implementation and functionality, you can [see the Vitest docs on mocking](https://vitest.dev/guide/mocking.html).

To not drag you through each test, I just added them all here to give you a good idea of ways in which you can test the integration:

```typescript
import userEvent from '@testing-library/user-event';
import { expect, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import toast from 'react-hot-toast';

type ToastType = typeof import('react-hot-toast');

vi.mock('react-hot-toast', async importOriginal => {
  const actual: ToastType = await importOriginal();
  return {
    ...actual,
    Toaster: vi.fn().mockImplementation(() => {
      return <div>Mocked Toaster</div>;
    }),
  };
});
const toastSuccess = vi.spyOn(toast, 'success');

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
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('Renders an error message when no inputs have been filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(
      screen.getByText('All fields are required for submission.')
    ).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('Disregards inputs that are not numbers', async () => {
    const user = userEvent.setup();
    render(<App />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'e');
    await user.type(inputs[1], '#');
    await user.type(inputs[2], 'g');
    expect(inputs[0]).toBeEmptyDOMElement();
    expect(inputs[1]).toBeEmptyDOMElement();
    expect(inputs[2]).toBeEmptyDOMElement();
    await user.type(inputs[0], '9');
    expect(inputs[0]).toHaveValue('9');
  });

  it('Renders an error message when inputs are only partially filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '3');
    await user.type(inputs[1], '6');
    await user.type(inputs[2], '9');
    expect(inputs[0]).toHaveValue('3');
    expect(inputs[1]).toHaveValue('6');
    expect(inputs[2]).toHaveValue('9');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(
      screen.getByText('All fields are required for submission.')
    ).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('Automatically resolves the error message when the inputs are completely filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '3');
    await user.type(inputs[1], '6');
    await user.type(inputs[2], '9');
    expect(inputs[0]).toHaveValue('3');
    expect(inputs[1]).toHaveValue('6');
    expect(inputs[2]).toHaveValue('9');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(
      screen.getByText('All fields are required for submission.')
    ).toBeInTheDocument();
    await user.type(inputs[3], '2');
    await user.type(inputs[4], '4');
    await user.type(inputs[5], '6');
    expect(inputs[3]).toHaveValue('2');
    expect(inputs[4]).toHaveValue('4');
    expect(inputs[5]).toHaveValue('6');
    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
  });
  it('Successfully triggers onSubmit function with valid input', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');

    await user.type(inputs[0], '3');
    await user.type(inputs[1], '6');
    await user.type(inputs[2], '9');
    await user.type(inputs[3], '2');
    await user.type(inputs[4], '4');
    await user.type(inputs[5], '6');
    expect(inputs[0]).toHaveValue('3');
    expect(inputs[1]).toHaveValue('6');
    expect(inputs[2]).toHaveValue('9');
    expect(inputs[3]).toHaveValue('2');
    expect(inputs[4]).toHaveValue('4');
    expect(inputs[5]).toHaveValue('6');

    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(
      screen.queryByText('All fields are required for submission.')
    ).not.toBeInTheDocument();
    expect(toastSuccess).toBeCalledWith('Entered code: 369246');
    expect(inputs[0]).toBeEmptyDOMElement();
    expect(inputs[1]).toBeEmptyDOMElement();
    expect(inputs[2]).toBeEmptyDOMElement();
    expect(inputs[3]).toBeEmptyDOMElement();
    expect(inputs[4]).toBeEmptyDOMElement();
    expect(inputs[5]).toBeEmptyDOMElement();
  });
});
```

If you made it this far, thank you for reading! I hope you learned a lot and are excited to build and test more! If you want to chat, you can always [find me on Twitter](https://x.com/_internetdrew), [connect with me on LinkedIn](https://www.linkedin.com/in/internetdrew/), or just [send me a message](/#connect).
