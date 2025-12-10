import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";
import { format } from "date-fns";
import { Card } from "../components/ui/card";

const TransactionForm = ({ transaction, onSave, closeDialog }) => {
    const [type, setType] = useState(transaction?.type || 'expense');
    const [category, setCategory] = useState(transaction?.category || '');
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [date, setDate] = useState(transaction?.date ? new Date(transaction.date) : new Date());
    const [description, setDescription] = useState(transaction?.description || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({ ...transaction, type, category, amount: parseFloat(amount), date, description });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Groceries" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="grid gap-2">
                    <Label>Date</Label>
                    <DatePicker date={date} setDate={setDate} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
};

const Transactions = () => {
    const { api } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Fetch transactions from backend on mount
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transactions');
                setTransactions(res.data.data);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            }
        };
        fetchTransactions();
    }, [api]);

    const handleSave = async (transaction) => {
        try {
            if (transaction._id) {
                // Update existing transaction
                const res = await api.put(`/transactions/${transaction._id}`, transaction);
                setTransactions(transactions.map(t => t._id === transaction._id ? res.data.data : t));
            } else {
                // Add new transaction
                const res = await api.post('/transactions', transaction);
                setTransactions([...transactions, res.data.data]);
            }
        } catch (err) {
            console.error('Failed to save transaction:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t._id !== id));
        } catch (err) {
            console.error('Failed to delete transaction:', err);
        }
    };

    const openDialog = (transaction = null) => {
        setSelectedTransaction(transaction);
        setIsDialogOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <Button onClick={() => openDialog()}>Add Transaction</Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t._id}>
                                <TableCell>{format(new Date(t.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell className={t.type === 'income' ? 'text-green-500' : 'text-red-500'}>{t.type}</TableCell>
                                <TableCell>{t.category}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className="text-right">${t.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => openDialog(t)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(t._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedTransaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm 
                        transaction={selectedTransaction} 
                        onSave={handleSave} 
                        closeDialog={() => setIsDialogOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Transactions;
