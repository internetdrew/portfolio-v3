import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { name, email, message } = data;

  const emailData = {
    service_id: import.meta.env.EMAIL_SERVICE_ID,
    template_id: import.meta.env.EMAIL_TEMPLATE_ID,
    user_id: import.meta.env.EMAIL_USER_ID,
    accessToken: import.meta.env.EMAIL_PRIVATE_KEY,
    template_params: {
      email,
      name,
      message,
    },
  };

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    body: JSON.stringify(emailData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return new Response(JSON.stringify({ success: res.ok }));
};
