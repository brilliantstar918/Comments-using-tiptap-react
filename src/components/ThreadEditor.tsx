import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ThreadItem } from '../types';
import { ThreadItemEditor } from './ThreadItemEditor';

const createThreadItem = (): ThreadItem => ({
  id: uuidv4(),
  content: '',
  displayName: 'BEE!RL',
  username: 'b33irl',
  avatarUrl: '/assets/avatar.png', // Replace with actual avatar URL
});

export const ThreadEditor: React.FC = () => {
  const [threadItems, setThreadItems] = useState<ThreadItem[]>([
    createThreadItem(),
  ]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleUpdate = (id: string, content: string) => {
    setThreadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  const handleDelete = (id: string) => {
    if (threadItems.length > 1) {
      setThreadItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleEnter = (id: string) => {
    // Create a new thread item
    const newItem = createThreadItem();

    setThreadItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      
      // Insert new item after the current one
      const newItems = [...prev];
      newItems.splice(index + 1, 0, newItem);
      return newItems;
    });
  };

  const handleBackspace = (id: string) => {
    if (threadItems.length > 1) {
      handleDelete(id);
    }
  };

  const handleSelectAll = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // If already selected, select all items
        threadItems.forEach((item) => next.add(item.id));
      } else {
        // Otherwise, select just this item
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {threadItems.map((item, index) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-5"
        >
          <ThreadItemEditor
            item={item}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEnter={handleEnter}
            onBackspace={handleBackspace}
            onSelectAll={handleSelectAll}
            isSelected={selectedItems.has(item.id)}
          />
        </div>
        
      ))}
    </div>
  );
};