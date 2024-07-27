import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "./styles.css";

type Inputs = {
  name: string;
  email: string;
  message: string;
};

const ContactFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Please enter a name to send your message." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    message: z.string().min(2, { message: "Please add a message to send." }),
  })
  .required();

const Contact = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(ContactFormSchema),
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { name, email, message } = data;
    const emailData = {
      service_id: import.meta.env.EMAIL_SERVICE_ID,
      template_id: import.meta.env.EMAIL_TEMPLATE_ID,
      user_id: import.meta.env.EMAIL_USER_ID,
      template_params: {
        email,
        name,
        message,
      },
    };

    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        body: JSON.stringify(emailData),
      });
      const data = await res.json();
    } catch (error) {}

    console.log(data);
  };

  return (
    <section className="my-10">
      <h3 className="font-semibold text-lg">Let's Connect!</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 border border-slate-800 rounded-lg p-4 mx-auto lg:max-w-md"
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
