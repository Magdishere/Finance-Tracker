import React from 'react';
import { useTheme } from '../context/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sun, Moon } from "lucide-react"; // import icons

const Settings = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Theme</h3>
                            <p className="text-sm text-muted-foreground">
                                Select between light and dark mode.
                            </p>
                        </div>
                        <Button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="flex items-center space-x-2"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
