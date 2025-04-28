import { useToast } from "@/components/toast/useToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction } from "@remix-run/node";
import { Form, redirect, useNavigate } from "@remix-run/react";
import { toast as showToast } from "sonner";
import { useState } from "react";
export const loader: LoaderFunction = async (request) => {
  const { userId } = await getAuth(request);
  if (userId) {
    return redirect("/");
  }
  return null;
};

export default function Login() {
  const { signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    // This will trigger HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent showClose={false}>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Please login to your Deal Fuze account.
          </DialogDescription>
        </DialogHeader>
        <Form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="hello@dealfuze.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              required
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
