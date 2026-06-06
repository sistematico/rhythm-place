import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">Rhythm Place</h1>
        <LoginForm />
      </div>
    </main>
  );
}
