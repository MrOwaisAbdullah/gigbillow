'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState, useMemo, Children, cloneElement } from 'react';
import { PlusCircle } from 'lucide-react';

type Item = {
  value: string;
  label: string;
};

type SelectWithCreateProps = {
  items: Item[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  dialogTitle: string;
  dialogDescription: string;
  children: React.ReactElement;
  onCreated: () => void;
  disabled?: boolean;
};

export function SelectWithCreate({
  items,
  value,
  onValueChange,
  placeholder,
  dialogTitle,
  dialogDescription,
  children,
  onCreated,
  disabled = false,
}: SelectWithCreateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'create-new') {
      setIsDialogOpen(true);
    } else {
      onValueChange(newValue);
    }
  };

  const handleSuccess = (newItem: { id: string }) => {
    setIsDialogOpen(false);
    onCreated();
  };

  const enhancedChild = Children.only(children) ? cloneElement(children, {
    onSuccess: handleSuccess,
    onCancel: () => setIsDialogOpen(false),
  } as any) : null;

  return (
    <>
      <Select onValueChange={handleValueChange} value={value} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map(item => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="create-new" className="text-primary focus:text-primary">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create New...</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="pt-4">{enhancedChild}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
