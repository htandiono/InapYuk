'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './ProfileForm';
import { EmailChangeForm } from './EmailChangeForm';
import { ChangePasswordForm } from './ChangePasswordForm';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: 'EMAIL' | 'GOOGLE';
}

interface ProfileViewProps {
  user: UserProfile;
}

export function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h1>
        <p className="text-muted-foreground">
          Kelola profil, email, dan keamanan akun Anda di sini.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="mt-0">
            <ProfileForm user={user} />
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <EmailChangeForm />
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <ChangePasswordForm isSocialLogin={user.provider === 'GOOGLE'} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
