
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: string[] | Option[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({ options, selectedValues, onChange, placeholder = "Select options..." }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize options to Option format
  const normalizedOptions: Option[] = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(s => s !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(selectedValues.filter(s => s !== value));
  };

  const getSelectedLabels = () => {
    return selectedValues.map(value => normalizedOptions.find(opt => opt.value === value)?.label || value);
  };

  return (
    <div className="space-y-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-auto min-h-[40px] p-2",
              selectedValues.length === 0 && "text-muted-foreground"
            )}
          >
            <div className="flex flex-wrap gap-1">
              {selectedValues.length === 0 ? (
                placeholder
              ) : (
                selectedValues.slice(0, 3).map(value => {
                  const label = normalizedOptions.find(opt => opt.value === value)?.label || value;
                  return (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  );
                })
              )}
              {selectedValues.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedValues.length - 3} more
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-popover border">
          {normalizedOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center",
                  selectedValues.includes(option.value) && "bg-primary border-primary"
                )}>
                  {selectedValues.includes(option.value) && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Selected items display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getSelectedLabels().map((label, index) => (
            <Badge key={selectedValues[index]} variant="default" className="flex items-center gap-1">
              {label}
              <button
                type="button"
                onClick={() => removeOption(selectedValues[index])}
                className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
