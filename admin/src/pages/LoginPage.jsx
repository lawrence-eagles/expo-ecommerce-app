import { Show, UserButton, SignIn } from "@clerk/react";

const LoginPage = () => {
  return (
    <header className="h-screen flex justify-center items-center">
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignIn />
      </Show>
    </header>
  );
};

export default LoginPage;
