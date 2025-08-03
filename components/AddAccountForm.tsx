'use client';

import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useAccountManagement } from '@/lib/hooks';

interface AddAccountFormProps {
  onAccountAdded: () => void;
}

export function AddAccountForm({ onAccountAdded }: AddAccountFormProps) {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [note, setNote] = useState('');
  const { isLoading, addAccount } = useAccountManagement(onAccountAdded);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await addAccount({ phone, token, note });
    
    if (success) {
      setPhone('');
      setToken('');
      setNote('');
    }
  };

  return (
    <Card className="glass-effect border-slate-700/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-primary/20">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          Add New Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-200">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123-456-7890"
              required
              disabled={isLoading}
              className="bg-slate-800/50 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-white placeholder:text-slate-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token" className="text-sm font-medium text-slate-200">
              Session Token
            </Label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ef58e850c4379eb0"
              required
              disabled={isLoading}
              className="bg-slate-800/50 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono text-sm text-white placeholder:text-slate-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium text-slate-200">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Main account, test, etc."
              rows={2}
              disabled={isLoading}
              className="bg-slate-800/50 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-white placeholder:text-slate-400"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Account...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
