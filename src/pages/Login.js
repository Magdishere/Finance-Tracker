import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Changed from @/hooks/useAuth
import { Button } from "../components/ui/button" // Changed from @/components/ui/button
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card" // Changed from @/components/ui/card
import { Input } from "../components/ui/input" // Changed from @/components/ui/input
import { Label } from "../components/ui/label" // Changed from @/components/ui/label

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth(); // Get loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            // Check if err.response and err.response.data exist for custom backend errors
            setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
            console.error(err);
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
                {error && <p className="text-red-500">{error}</p>}
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading} // Disable input during loading
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} // Disable input during loading
                />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign in'}
                </Button>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="underline">
                        Sign up
                    </Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link to="/forgot-password"className="underline">
                        Forgot your password?
                    </Link>
                </div>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;