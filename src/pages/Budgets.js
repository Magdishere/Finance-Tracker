// src/pages/Budgets.js
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';

const BudgetForm = ({ budget, onSave, closeDialog }) => {
  const [month, setMonth] = useState(budget?.month || '');
  const [limitAmount, setLimitAmount] = useState(budget?.limitAmount || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ ...budget, month, limitAmount: parseFloat(limitAmount) });
    closeDialog();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="month">Month (YYYY-MM)</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="limitAmount">Limit Amount</Label>
          <Input
            id="limitAmount"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

const Budgets = () => {
  const { api } = useAuth(); // ✅ Correct way to get api
  const [budgets, setBudgets] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Fetch budgets on mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/budgets');
        setBudgets(res.data.data);
      } catch (err) {
        console.error('Failed to fetch budgets:', err.response?.data || err.message);
      }
    };
    fetchBudgets();
  }, [api]);

  const handleSave = async (budget) => {
    try {
      if (budget._id) {
        // Update
        const res = await api.put(`/budgets/${budget._id}`, { limitAmount: budget.limitAmount });
        setBudgets(budgets.map(b => (b._id === budget._id ? res.data.data : b)));
      } else {
        // Create
        const res = await api.post('/budgets', budget);
        setBudgets([...budgets, res.data.data]);
      }
    } catch (err) {
      console.error('Failed to save budget:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (err) {
      console.error('Failed to delete budget:', err.response?.data || err.message);
    }
  };

  const openDialog = (budget = null) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button onClick={() => openDialog()}>Add Budget</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget._id}>
            <CardHeader>
              <CardTitle>Budget for {budget.month}</CardTitle>
              <CardDescription>
                Limit: ${(budget.limitAmount ?? 0).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Usage: ${(budget.usage ?? 0).toFixed(2)}</p>
              <Progress value={budget.usagePercentage ?? 0} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {(budget.usagePercentage ?? 0).toFixed(2)}% used
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openDialog(budget)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(budget._id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBudget ? 'Edit' : 'Add'} Budget</DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={selectedBudget}
            onSave={handleSave}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
