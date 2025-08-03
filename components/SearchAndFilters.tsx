import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface SearchAndFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  accountsCount: number;
  filteredCount: number;
}

const filterOptions = [
  { value: 'all', label: 'All', color: 'bg-slate-600' },
  { value: 'prize_claimed', label: 'Prize Claimed', color: 'bg-green-600' },
  { value: 'cooldown', label: 'Cooldown', color: 'bg-yellow-600' },
  { value: 'error', label: 'Error', color: 'bg-red-600' },
  { value: 'checking', label: 'Checking', color: 'bg-blue-600' },
  { value: 'idle', label: 'Idle', color: 'bg-gray-600' },
];

export function SearchAndFilters({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  accountsCount,
  filteredCount
}: SearchAndFiltersProps) {
  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={`
                  ${filter === option.value 
                    ? `${option.color} text-white border-transparent` 
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredCount} of {accountsCount} accounts
        </div>
      </CardContent>
    </Card>
  );
}
