'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './ProfileForm';
import { EmailChangeForm } from './EmailChangeForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: 'EMAIL' | 'GOOGLE';
}

function ProfileHeader({ isTenant }: { isTenant?: boolean }) {
  return (
    <div className="space-y-4">
      <Link href={isTenant ? '/tenant/properties' : '/'} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Kembali ke {isTenant ? 'Dashboard' : 'Beranda'}
      </Link>
      <div><h1 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h1><p className="text-muted-foreground">Kelola profil, email, dan keamanan akun Anda di sini.</p></div>
    </div>
  );
}

function ProfileTabContents({ user }: { user: UserProfile }) {
  return (
    <div className="mt-6">
      <TabsContent value="profile" className="mt-0"><ProfileForm user={user} /></TabsContent>
      <TabsContent value="email" className="mt-0"><EmailChangeForm /></TabsContent>
      <TabsContent value="password" className="mt-0"><ChangePasswordForm isSocialLogin={user.provider === 'GOOGLE'} /></TabsContent>
    </div>
  );
}

function ProfileTabs({ user }: { user: UserProfile }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="flex h-auto flex-wrap w-full sm:grid sm:grid-cols-3">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <ProfileTabContents user={user} />
    </Tabs>
  );
}

export function ProfileView({ user, isTenant }: { user: UserProfile; isTenant?: boolean }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <ProfileHeader isTenant={isTenant} />
      <ProfileTabs user={user} />
    </div>
  );
}
