import React from 'react';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ value, onChange }) => {
  return (
    <textarea
      className="flex-grow w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter structured JSON here..."
      rows={10} // Default rows, flex-grow will override height
    />
  );
};

export default JsonInput;