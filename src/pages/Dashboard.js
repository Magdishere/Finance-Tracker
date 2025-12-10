import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        remainingBudget: 0,
        budgetLimit: 0
    });
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    useEffect(() => {
    const fetchData = async () => {
        try {
            const [year, month] = currentMonth.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0).toISOString();

            const [transactionsRes, budgetsRes] = await Promise.all([
                api.get(`/transactions?startDate=${startDate}&endDate=${endDate}`),
                api.get('/budgets')
            ]);

            const transactions = transactionsRes.data.data;
            const budgets = budgetsRes.data.data;

            const currentMonthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= new Date(startDate) && tDate <= new Date(endDate);
            });

            // Totals
            const totalIncome = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const totalExpenses = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            const currentMonthBudget = budgets.find(b => b.month === currentMonth);
            const budgetLimit = currentMonthBudget ? currentMonthBudget.limitAmount : 0;

            const remainingBudget = budgetLimit > 0 ? budgetLimit - totalExpenses : totalIncome - totalExpenses;

            setStats({ totalIncome, totalExpenses, remainingBudget, budgetLimit });

            // Pie chart data
            const expenseByCategory = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {});
            setCategoryData(Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })));

            // Bar chart data
            const dailyMap = currentMonthTransactions.reduce((acc, t) => {
                const day = new Date(t.date).getDate();
                if (!acc[day]) acc[day] = { name: `Day ${day}`, income: 0, expenses: 0 };
                if (t.type === 'income') acc[day].income += t.amount;
                else acc[day].expenses += t.amount;
                return acc;
            }, {});

            const monthlySummary = Object.values(dailyMap).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
            setMonthlyData(monthlySummary);

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        }
    };

    fetchData();
}, [api, currentMonth]);
// Removed currentMonth from dependencies as it's calculated inside useEffect

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-500">
                            ${stats.totalIncome.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-500">
                            ${stats.totalExpenses.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Remaining Budget ({currentMonth})</CardTitle></CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${stats.remainingBudget >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                            ${stats.remainingBudget.toFixed(2)}
                        </p>
                        {/* Progress relative to total income */}
                        <Progress value={(stats.totalExpenses / (stats.totalIncome || 1)) * 100} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 mt-6 md:grid-cols-2">
                {/* Pie chart: expenses by category */}
                <Card>
                    <CardHeader><CardTitle>Expense by Category</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bar chart: daily activity */}
                <Card>
                    <CardHeader><CardTitle>Monthly Activity ({currentMonth})</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="income" fill="#82ca9d" />
                                <Bar dataKey="expenses" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
