import { ProfileCard } from "@/components/profile-card";

export default function TestProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <ProfileCard
        profile={{
          id: "1",
          username: "testuser",
          full_name: "Test User",
          avatar_url: null,
        }}
        
      />
    </div>
  );
}
