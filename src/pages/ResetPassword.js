import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const { data } = await axios.post("/auth/reset-password", {
        token,
        password,
      });

      if (!data.success) return setError(data.message);

      setMessage("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError("Invalid or expired reset link");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">

      <Card className="w-full max-w-sm">

        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Create your new login password.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">

            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}

            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

          </CardContent>

          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">
              Reset Password
            </Button>

            {message && (
              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="underline">
                  Sign in
                </Link>
              </div>
            )}
          </CardFooter>
        </form>

      </Card>

    </div>
  );
}
