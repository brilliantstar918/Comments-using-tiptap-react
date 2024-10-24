import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ThreadItem } from '../types';
import { ThreadItemEditor } from './ThreadItemEditor';
import { Editor } from '@tiptap/react';

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

  // Keep track of editor instances
  const editorsRef = useRef<{ [key: string]: Editor | null }>({});
  const lastCtrlATime = useRef<number>(0);
  const CTRL_A_THRESHOLD = 500;

  const handleUpdate = (id: string, content: string) => {
    setThreadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  const handleDelete = (id: string) => {
    if (threadItems.length > 1) {
      const currentIndex = threadItems.findIndex(item => item.id === id);
      const previousIndex = currentIndex - 1;

      // Get the previous item's ID before deletion
      const previousItemId = previousIndex >= 0 ? threadItems[previousIndex].id : null;

      setThreadItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      // Focus the previous editor after state update
      if (previousItemId && editorsRef.current[previousItemId]) {
        setTimeout(() => {
          const editor = editorsRef.current[previousItemId];
          if (editor) {
            editor.commands.focus('end');
          }
        }, 0);
      }
    }
  };

  const registerEditor = (id: string, editor: Editor | null) => {
    editorsRef.current[id] = editor;
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
    const currentTime = Date.now();
    setSelectedItems(new Set(threadItems.map(item => item.id)));

    // If current item is already selected and within threshold, select all
    if (currentTime - lastCtrlATime.current <= CTRL_A_THRESHOLD) {
      setSelectedItems(new Set(threadItems.map(item => item.id)));
    } else {
      // First Ctrl+A: select only current item
      setSelectedItems(new Set([id]));
    }
    
    lastCtrlATime.current = currentTime;
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;

    // Find the first selected item's index
    const firstSelectedIndex = threadItems.findIndex(item => selectedItems.has(item.id));
    
    // Don't delete if it would leave us with no items
    if (selectedItems.size === threadItems.length) {
      setThreadItems([createThreadItem()]);
      setSelectedItems(new Set());
      return;
    }

    // Get previous item's ID before deletion
    const previousItemId = firstSelectedIndex > 0 
      ? threadItems[firstSelectedIndex - 1].id 
      : threadItems.find(item => !selectedItems.has(item.id))?.id;

    // Delete selected items
    setThreadItems(prev => prev.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());

    // Focus the previous editor or the next available one
    if (previousItemId) {
      setTimeout(() => {
        const editorToFocus = editorsRef.current[previousItemId];
        if (editorToFocus) {
          editorToFocus.commands.focus('end');
        }
      }, 0);
    }
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
            onDeleteSelected={handleDeleteSelected}
            isSelected={selectedItems.has(item.id)}
            onRegisterEditor={(editor) => registerEditor(item.id, editor)}
          />
        </div>
        
      ))}
    </div>
  );
};