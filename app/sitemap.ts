import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://growwithowl.com';
  const currentDate = new Date().toISOString();

  const routes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/feed', priority: 0.9, changeFrequency: 'hourly' as const },
    { url: '/question-bank', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/battle', priority: 0.85, changeFrequency: 'always' as const },
    { url: '/planner', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/notebook', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/panic-sheet', priority: 0.75, changeFrequency: 'weekly' as const },
    { url: '/mistakes', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/my-words', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
