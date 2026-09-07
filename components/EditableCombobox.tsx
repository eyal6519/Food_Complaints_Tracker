'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

interface EditableComboboxProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export const EditableCombobox: React.FC<EditableComboboxProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select or type new...',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes((inputValue || '').toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400 shadow-sm"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-56 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between transition-colors"
              >
                <span className="truncate">{opt}</span>
                {inputValue.trim().toLowerCase() === opt.toLowerCase() && (
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))
          ) : (
            inputValue.trim() !== '' && (
              <div
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2.5 text-sm text-slate-500 flex items-center gap-2 cursor-pointer hover:bg-slate-50"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Use custom: <strong className="text-slate-800">"{inputValue}"</strong></span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
