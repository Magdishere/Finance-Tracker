import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { api } = useAuth();
    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setUser(res.data.data);
                setFormData({
                    name: res.data.data.name || '',
                    email: res.data.data.email || '',
                    password: ''
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [api]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/users/profile', formData);
            setUser(res.data.data);
            setFormData(prev => ({ ...prev, password: '' }));
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Password</Label>
                        <Input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Profile;
