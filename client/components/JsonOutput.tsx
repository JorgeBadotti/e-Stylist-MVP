import React from 'react';

interface JsonOutputProps {
  value: string;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ value }) => {
  return (
    <pre className="flex-grow w-full p-4 border border-gray-300 bg-gray-50 rounded-lg overflow-auto font-mono text-sm text-gray-800">
      {value}
    </pre>
  );
};

export default JsonOutput;