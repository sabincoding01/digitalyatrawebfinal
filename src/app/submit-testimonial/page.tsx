import { TestimonialForm } from "@/components/TestimonialForm";

export default function SubmitTestimonialPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Submit a Testimonial
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-zinc-500 dark:text-zinc-400 mx-auto">
            Your feedback helps us improve and helps others make informed decisions.
          </p>
        </div>
        
        <TestimonialForm />
      </div>
    </div>
  );
}
