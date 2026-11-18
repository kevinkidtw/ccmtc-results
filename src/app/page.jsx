import { prisma } from '@/lib/prisma';
import HomeContent from './components/HomeContent';

export const revalidate = 0; // Disable full page cache so it updates when a new post is added

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    include: {
      photos: { take: 1, orderBy: { id: 'asc' } },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return <HomeContent initialPosts={posts} />;
}
