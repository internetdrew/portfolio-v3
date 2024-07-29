import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";

import "./styles.css";

type Inputs = {
  name: string;
  email: string;
  message: string;
};

const ContactFormSchema = z
  .object({
    name: z.string().min(2, { message: "But... how will I know who you are?" }),
    email: z.string().email({ message: "I'll need this to reply to you." }),
    message: z.string().min(2, {
      message: "Can you really send a message without... a message?",
    }),
  })
  .required();

const Contact = () => {
  const [messageSuccessfullySent, setMessageSuccessfullySent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Inputs>({
    resolver: zodResolver(ContactFormSchema),
  });

  const showSuccessStatus = () => {
    toast.success("Your message has been sent. Thank you!");
    setMessageSuccessfullySent(true);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const res = await fetch("/api/contact.json", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const dataSend = await res.json();
    dataSend.success
      ? showSuccessStatus()
      : toast.error("Oops. Something went wrong. I'm so embarrased!");
  };

  useEffect(() => {
    messageSuccessfullySent && reset();
  }, [isSubmitSuccessful]);

  return (
    <section className="my-10">
      <h3 id="lets-connect" className="font-semibold text-lg">
        Let's Connect!
      </h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="my-4 border border-slate-800 rounded-lg p-4 mx-auto lg:max-w-md"
      >
        <h4 className="text-center">Contact Me</h4>
        <div className="my-4 flex flex-col gap-1">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="p-2 border border-slate-400 rounded-md"
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name")}
          />
          {errors.name && (
            <span role="alert" className="text-sm text-red-600">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="my-4 flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            className="p-2 border border-slate-400 rounded-md"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && (
            <span role="alert" className="text-sm text-red-600">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="my-4 flex flex-col gap-1">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            className="p-2 border border-slate-400 rounded-md min-h-24"
            aria-invalid={errors.message ? "true" : "false"}
            {...register("message")}
          />
          {errors.message && (
            <span role="alert" className="text-sm text-red-600">
              {errors.message.message}
            </span>
          )}
        </div>
        <button className="bg-slate-400 w-full p-2 rounded-md duration-300 hover:bg-slate-800 hover:text-slate-50">
          Send Message
        </button>
      </form>
    </section>
  );
};

export default Contact;
