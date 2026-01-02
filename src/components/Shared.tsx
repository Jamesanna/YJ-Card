
import React, { useState } from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const baseStyle = "rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed std-content";
  const sizes = { sm: "px-3 py-1.5", md: "px-4 py-2", lg: "px-6 py-3" };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-white text-black border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-sm",
    ghost: "bg-transparent text-black hover:bg-slate-100 hover:text-black"
  };
  return <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full text-left">
    {label && <label className="std-label text-black">{label}</label>}
    <input className={`border border-slate-200 bg-white text-black placeholder:text-slate-500 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all std-content ${className}`} {...props} />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: {value: string, label: string}[] }> = ({ label, options, className = '', ...props }) => (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && <label className="std-label text-black">{label}</label>}
      <select className={`border border-slate-200 bg-white text-black rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all std-content ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: React.ReactNode, actions?: React.ReactNode, bgColor?: string, onClick?: () => void }> = ({ children, className = '', title, actions, bgColor = 'bg-white', onClick }) => (
  <div onClick={onClick} className={`${bgColor} rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all ${className}`}>
    {(title || actions) && (
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        {title && <h3 className="std-label text-black">{title}</h3>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-4 std-content">{children}</div>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-white flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="std-label text-black text-center">{title}</h3>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

interface DraggableListProps<T> { items: T[]; onReorder: (items: T[]) => void; renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode; keyExtractor: (item: T) => string; className?: string; }
export const DraggableList = <T,>({ items, onReorder, renderItem, keyExtractor, className = "space-y-3" }: DraggableListProps<T>) => {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const handleDragStart = (e: React.DragEvent, index: number) => { setDraggingIndex(index); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); if (draggingIndex === null || dragOverIndex === null) return; const newItems = [...items]; const [removed] = newItems.splice(draggingIndex, 1); newItems.splice(dragOverIndex, 0, removed); onReorder(newItems); setDraggingIndex(null); setDragOverIndex(null); };
    const handleDragEnd = () => { setDraggingIndex(null); setDragOverIndex(null); };
    return (<div className={className}>{items.map((item, index) => (<div key={keyExtractor(item)} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={handleDrop} onDragEnd={handleDragEnd} className={`transition-all duration-200 cursor-move ${draggingIndex === index ? 'opacity-30' : ''} ${dragOverIndex === index && draggingIndex !== index ? 'ring-2 ring-blue-300 ring-offset-2 rounded-xl scale-95' : ''}`}>{renderItem(item, index, draggingIndex === index)}</div>))}</div>);
};
