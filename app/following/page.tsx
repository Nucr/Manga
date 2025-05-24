import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import FollowingPage from '@/components/FollowingPage';
import LayoutWithNavbar from '@/components/LayoutWithNavbar';
import { authOptions } from '@/lib/auth';

export default async function Following() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <LayoutWithNavbar>
      <div className="container mx-auto px-4 py-8">
        <FollowingPage />
      </div>
    </LayoutWithNavbar>
  );
} 