import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <SignUp
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}