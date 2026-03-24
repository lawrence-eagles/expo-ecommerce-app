import { Show, UserButton, SignInButton } from "@clerk/react";

const LoginPage = () => {
  return (
    <header className="h-screen flex justify-center items-center">
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton />
      </Show>
    </header>
  );
};

export default LoginPage;
