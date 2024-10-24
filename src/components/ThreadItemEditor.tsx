import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ThreadItem } from '../types';
import { Avatar } from './Avatar';

interface ThreadItemEditorProps {
  item: ThreadItem;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onEnter: (id: string) => void;
  onBackspace: (id: string) => void;
  onSelectAll: (id: string) => void;
  onDeleteSelected: () => void;
  isSelected: boolean;
  onRegisterEditor: (editor: Editor | null) => void;
}

export const ThreadItemEditor: React.FC<ThreadItemEditorProps> = ({
  item,
  onUpdate,
  onDelete,
  onEnter,
  onBackspace,
  onSelectAll,
  onDeleteSelected,
  isSelected,
  onRegisterEditor,
}) => {
  const lastEnterPress = useRef<number>(0);
  const DOUBLE_ENTER_THRESHOLD = 500; // milliseconds

  const editor = useEditor({
    extensions: [StarterKit],
    content: item.content,
    editable: true,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      onUpdate(item.id, editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full prose prose-sm max-w-none',
      },

      handleKeyDown: (view, event) => {
        // Handle Enter key
        if (event.key === 'Enter' && !event.shiftKey) {
          const currentTime = Date.now();
          const timeSinceLastEnter = currentTime - lastEnterPress.current;
          
          if (timeSinceLastEnter <= DOUBLE_ENTER_THRESHOLD) {
            // Double Enter detected
            event.preventDefault();
            onEnter(item.id);
            lastEnterPress.current = 0;
            return true;
          }
          
          lastEnterPress.current = currentTime;
          return false;
        }

        // Handle Backspace
        if (event.key === 'Backspace' && editor?.isEmpty) {
          event.preventDefault();
          onBackspace(item.id);
          return true;
        }

        // Handle Backspace for selected items
        if (event.key === 'Backspace' && isSelected) {
          event.preventDefault();
          onDeleteSelected();
          return true;
        }

        // Handle Select All (Ctrl/Cmd + A)
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
          event.preventDefault();
          onSelectAll(item.id);
          return true;
        }

        return false;
      },
    },
  });

  // Register editor instance
  useEffect(() => {
    onRegisterEditor(editor);
    return () => onRegisterEditor(null);
  }, [editor, onRegisterEditor]);

  // Update selection state
  useEffect(() => {
    if (editor && isSelected) {
      editor.commands.selectAll();
    }
  }, [editor, isSelected]);

  return (
    <div className='thread-content'>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar url={item.avatarUrl} alt={item.displayName} />
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{item.displayName}</span>
            <span className="text-gray-500">@{item.username}</span>
          </div>

          {/* Editor */}
          <div className={`prose max-w-none ${isSelected ? 'selected' : ''}`}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Thread divider */}
      <div className='thread-divider mt-4' />
    </div>
    
  );
};