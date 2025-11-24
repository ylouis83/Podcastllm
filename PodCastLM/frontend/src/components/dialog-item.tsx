import React from 'react';

interface DialogueItemProps {
  speaker: string;
  content: string;
  isUser: boolean;
}

const DialogueItem: React.FC<DialogueItemProps> = ({ speaker, content, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[70%]`}>
        <div className={`mx-3 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className="text-sm text-gray-600 mb-1 font-bold">{speaker}</div>
          <div 
            className={`p-3 rounded-2xl ${
              isUser 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueItem;
