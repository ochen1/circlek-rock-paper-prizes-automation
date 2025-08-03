import { useState, FormEvent, useEffect } from 'react';
import { AccountState } from '@/lib/types';
import { useAccountManagement } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

interface EditAccountModalProps {
  account: AccountState;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAccountModal({ account, isOpen, onClose, onSuccess }: EditAccountModalProps) {
  const [phone, setPhone] = useState(account.phone);
  const [token, setToken] = useState(account.token);
  const [note, setNote] = useState(account.note || '');
  const { updateAccount, isUpdating } = useAccountManagement();

  useEffect(() => {
    if (isOpen) {
      setPhone(account.phone);
      setToken(account.token);
      setNote(account.note || '');
    }
  }, [isOpen, account]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateAccount({ oldPhone: account.phone, newAccountData: { phone, token, note } });
      onSuccess();
      onClose();
    } catch (error) {
      // error is handled by the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md m-4 relative glass-effect">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-sm font-medium text-slate-200">Phone Number</Label>
            <Input
              id="edit-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-slate-900/70 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-token" className="text-sm font-medium text-slate-200">Session Token</Label>
            <Input
              id="edit-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="bg-slate-900/70 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-note" className="text-sm font-medium text-slate-200">Note (optional)</Label>
            <Textarea
              id="edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-slate-900/70 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-white"
            />
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
