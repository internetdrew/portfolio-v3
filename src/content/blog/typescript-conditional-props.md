---
title: "Building Flexible React Components with TypeScript: Conditional Props in Action"
pubDate: 2024-03-20
description: "Creating conditional props in TypeScript for versatile React components."
author: "Andrew Rowley"
image:
  url: "typescript-conditional-props.jpg"
  alt: "Building Flexible React Components with TypeScript: Conditional Props in Action"
tags: ["react", "typescript", "conditional props"]
---

## Table of Contents

## What You'll Learn

- How to create flexible, type-safe components that intuitively indicate required and conflicting props based on variant usage.
- How to extend interfaces to create specialized props for different component variants.
- How conditional props improve component clarity and usability.

## Where You Can Find the Code

If you'd like to follow along with a live example on your local machine, you can check out [the repo I created for this walkthrough](https://github.com/internetdrew/ts-conditional-props?tab=readme-ov-file).

## Why Conditional Props Matter

Conditional props can help you create flexible components maintaining strict adherence to usage guidelines.

With conditional props, we ensure clarity for fellow developers utilizing our components so they know which props are required based on the intended variant, enhancing component usability and developer experience.

## What We're Building for Demonstration

We're building a controlled input component with two distinct variations.

One variation includes a character counter for user feedback on input length, while the other presents a static message string. These variants are mutually exclusive, ensuring developers understand the specific requirements for each use case.

When implementing the character counter variant, developers are prompted to set a maximum character count but cannot include a message string. Conversely, when incorporating the message string variant, developers should not include a character counter or specify a maximum character count for the input.

## Creating Flexible Types from Interface Variants

```typescript
import { ChangeEventHandler, useState } from "react";

interface CommonProps {
  inputId: string;
  labelText: string;
  placeholderText: string;
  inputValue: string;
  onValueChange: ChangeEventHandler<HTMLInputElement>;
}

interface InputWithCharacterCounterProps extends CommonProps {
  characterCounter: true;
  maxLength: number;
  inputMessage?: never;
}

interface InputWithMessageProps extends CommonProps {
  inputMessage: string;
  characterCounter?: never;
  maxLength?: never;
}

type InputProps = InputWithCharacterCounterProps | InputWithMessageProps;
```

Above, we are defining what the most common props are for every use case of this component, as well as the types that are required or conflicting based on the variant of the component.

This essentially means that every time you use this component, it must have and `inputId`, `labelText`, `placeholderText`, `inputValue`, and `onValueChange`.

But because the `CommonProps` are not included in the `InputProps` options, you can't complete the component with only these props.

To utilize the `InputWithCharacterCounterProps` interface, you must declare it with either a `characterCounter`, which mandates the inclusion of a `maxLength`, or with an `inputMessage`.

One thing that you might notice is that both of the extended interfaces include the same props with different types. This is because if we don't include them, when we try to use those prop values within the component, certain props will not be present on certain types, giving you the added work of defining props on a case by case basis instead of all at once (you'll see what I mean soon).

### A Closer Look at the Extended Interfaces

```typescript
interface InputWithCharacterCounterProps extends CommonProps {
  characterCounter: true;
  maxLength: number;
  inputMessage?: never;
}
```

The `InputWithCharacterCounterProps` interface defines the properties necessary for an input component featuring a character counter.

If `characterCounter` is specified, it signifies the intention to include a character count, necessitating the presence of `maxLength` to set the maximum character limit.

Conversely, if `maxLength` is provided, it implies the presence of a character counter. So both `characterCounter` and `maxLength` become required when either one is present. The `inputMessage` property is made optional and set to `never` to alleviate the burden of assigning an arbitrary value.

```typescript
interface InputWithMessageProps extends CommonProps {
  inputMessage: string;
  characterCounter?: never;
  maxLength?: never;
}
```

Here `InputWithMessageProps` defines the single property necessary for an input with a message. If there is an `inputMessage` prop, `characterCounter` and `maxLength` are never to be present. Again, these two props are optional so that developers don't need to assign an arbitrary value when using it.

## The Input Component Structure

```typescript
const Input = (props: InputProps) => {
  const {
    inputId,
    labelText,
    placeholderText,
    maxLength,
    inputValue,
    characterCounter,
    inputMessage,
    onValueChange,
  } = props;

  return (
    <div className='input'>
      <label htmlFor={inputId}>{labelText}</label>
      <input
        type='text'
        id={inputId}
        placeholder={placeholderText}
        maxLength={maxLength}
        onChange={onValueChange}
      />
      <span>
        {characterCounter
          ? `${inputValue.length}/${maxLength} characters`
          : inputMessage}
      </span>
    </div>
  );
};
```

## Ensuring Proper Component Instantiation

```typescript
function App() {
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');

  return (
    <div className='flex'>
      <Input
        inputId='input-1'
        labelText='I am Input 1'
        placeholderText='Enter something'
        inputValue={inputValue1}
        onValueChange={e => setInputValue1(e.target.value)}
        inputMessage='hello there'
      />
      <Input
        inputId='input-2'
        labelText='I am Input 2'
        placeholderText='Enter something'
        inputValue={inputValue2}
        onValueChange={e => setInputValue2(e.target.value)}
        characterCounter
        maxLength={100}
      />
    </div>
  );
}

export default App;
```

Here we have two successful instances of the `Input` component.

If we attempt to remove `inputMessage` in the first instance or `characterCounter` or `maxLength` from the second, we instantly get feedback on incomplete implementation.

This immediate feedback helps fellow developers easily identify missing or conflicting props, ensuring adherence to the component's expected usage and preventing potential errors in implementation. And everyone loves an improved development experience.

I hope this helps. Thanks for reading!
