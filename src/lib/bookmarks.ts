export type Bookmark = {
  title: string;
  url: string;
  description?: string;
};

export const dummyBookmarks: Bookmark[] = [
  {
    title: "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.",
    url: "https://tailwindcss.com/",
    description: "A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup."
  },
  {
    title: "React – A JavaScript library for building user interfaces",
    url: "https://react.dev/",
    description: "React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video."
  },
  {
    title: "Next.js by Vercel - The React Framework",
    url: "https://nextjs.org/",
    description: "Used by some of the world's largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features."
  },
  {
    title: "Genkit: The Go-to Open Source Framework for AI-powered Apps",
    url: "https://firebase.google.com/docs/genkit",
    description: "An open-source framework from Google that helps you build, deploy, and monitor production-ready AI apps."
  },
  {
    title: "Shadcn/ui - Beautifully designed components built with Radix UI and Tailwind CSS.",
    url: "https://ui.shadcn.com/",
    description: "Accessible and customizable components that you can copy and paste into your apps. Free. Open Source. And Next.js 13 Ready."
  },
  {
    title: "Zustand - State management for React",
    url: "https://github.com/pmndrs/zustand",
    description: "A small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, isn't boilerplatey or opinionated."
  },
    {
    title: "Introduction to cooking: The basics",
    url: "https://www.example.com/cooking-basics",
    description: "Learn the fundamental techniques of cooking, including knife skills, temperature control, and seasoning."
  },
  {
    title: "Best travel destinations in Southeast Asia",
    url: "https://www.example.com/travel-sea",
    description: "A comprehensive guide to the top countries and cities to visit in Southeast Asia for backpackers and luxury travelers alike."
  },
  {
    title: "Async/Await in JavaScript: A Deep Dive",
    url: "https://www.example.com/js-async-await",
    description: "A technical article explaining how async/await works under the hood, with examples and comparisons to promises."
  }
];
