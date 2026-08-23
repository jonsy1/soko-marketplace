import { auth } from '@/auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  const name = session?.user?.name || null;

  return <NavbarClient role={role} name={name} isLoggedIn={!!session?.user} />;
}
