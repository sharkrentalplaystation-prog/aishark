import React from 'react';

const baseClasses = "w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, required, id, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input id={id} {...props} className={baseClasses} required={required} />
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ label, required, id, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea id={id} {...props} className={`${baseClasses} min-h-[100px]`} required={required} />
  </div>
);


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label}
    </label>
    <select id={id} {...props} className={baseClasses}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "" ? (label ? `Pilih ${label}`: 'Pilih...') : option}
        </option>
      ))}
    </select>
  </div>
);