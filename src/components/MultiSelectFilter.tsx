"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface MultiSelectFilterProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  labelMap?: Record<string, string>;
  placeholder?: string;
}

export default function MultiSelectFilter({
  label,
  values,
  onChange,
  options,
  labelMap,
  placeholder = "선택...",
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const displayLabel = labelMap ? labelMap[option] ?? option : option;
    return displayLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleOption = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="relative flex flex-col min-w-[140px]" ref={dropdownRef}>
      <label className="text-[10px] text-text-muted block mb-1 font-medium">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-1.5 text-xs text-text-primary hover:border-mint/50 transition-colors"
      >
        <span className="truncate">
          {values.length === 0
            ? "전체"
            : values.length === 1
            ? labelMap ? labelMap[values[0]] ?? values[0] : values[0]
            : `${values.length}개 선택됨`}
        </span>
        <ChevronDown size={14} className="text-text-muted ml-2 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] max-w-[300px] bg-vault-surface border border-vault-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-vault-border flex items-center gap-2 bg-vault-bg">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder={`${label} 검색...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-text-primary focus:outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-text-muted text-center">결과가 없습니다.</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option);
                const displayLabel = labelMap ? labelMap[option] ?? option : option;
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded hover:bg-vault-surface-light transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-mint border-mint text-vault-bg"
                          : "border-vault-border bg-vault-bg"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </div>
                    <span className={`truncate ${isSelected ? "text-text-primary font-bold" : "text-text-secondary"}`}>
                      {displayLabel}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {values.length > 0 && (
            <div className="p-2 border-t border-vault-border bg-vault-bg">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-coral hover:bg-coral/10 py-1 rounded transition-colors"
              >
                선택 초기화
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
