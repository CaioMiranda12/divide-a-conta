import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { HomePageContent } from '@/components/home/HomePageContent';

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  const isLoggedOut = !currentUser;

  if (isLoggedOut) redirect('/login');

  return <HomePageContent userName={currentUser.name} />;
}