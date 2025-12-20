import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Extension } from '@tiptap/core';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  List,
  ListOrdered,
  RemoveFormatting,
  IndentIncrease,
  IndentDecrease,
} from 'lucide-react';

interface LetterheadEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Custom Tab extension for proper indentation
const TabIndent = Extension.create({
  name: 'tabIndent',

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Insert 4 spaces for indentation
        this.editor.commands.insertContent('    ');
        return true;
      },
      'Shift-Tab': () => {
        // Remove 4 spaces if they exist before cursor
        const { state } = this.editor;
        const { selection } = state;
        const pos = selection.$from.pos;
        const textBefore = state.doc.textBetween(Math.max(0, pos - 4), pos);
        
        if (textBefore === '    ') {
          this.editor.commands.deleteRange({ from: pos - 4, to: pos });
          return true;
        }
        return false;
      },
    };
  },
});

const LetterheadEditor = ({ value, onChange }: LetterheadEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings - not needed for formal letters
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
      TabIndent,
      TextAlign.configure({
        types: ['paragraph', 'listItem'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 bg-white',
        style: 'font-family: Inter, Roboto, "Source Sans Pro", Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5;',
      },
      // Handle paste to strip external formatting
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;
        
        const text = clipboardData.getData('text/plain');
        if (text) {
          event.preventDefault();
          const { state, dispatch } = view;
          const tr = state.tr.insertText(text, state.selection.from, state.selection.to);
          dispatch(tr);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const clearFormatting = useCallback(() => {
    if (editor) {
      editor.chain().focus().clearNodes().unsetAllMarks().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={clearFormatting}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Indentation */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().insertContent('    ').run()}
          title="Increase Indent (Tab)"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const { state } = editor;
            const { selection } = state;
            const pos = selection.$from.pos;
            const textBefore = state.doc.textBetween(Math.max(0, pos - 4), pos);
            if (textBefore === '    ') {
              editor.commands.deleteRange({ from: pos - 4, to: pos });
            }
          }}
          title="Decrease Indent (Shift+Tab)"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="letterhead-editor"
      />

      {/* Editor Styles */}
      <style>{`
        .letterhead-editor .ProseMirror {
          min-height: 300px;
          padding: 16px;
          background: white;
          font-family: 'Inter', 'Roboto', 'Source Sans Pro', Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.5;
        }
        
        .letterhead-editor .ProseMirror:focus {
          outline: none;
        }
        
        .letterhead-editor .ProseMirror p {
          margin-bottom: 12px;
        }
        
        .letterhead-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .letterhead-editor .ProseMirror ul,
        .letterhead-editor .ProseMirror ol {
          margin-left: 24px;
          margin-bottom: 12px;
        }
        
        .letterhead-editor .ProseMirror li {
          margin-bottom: 4px;
        }
        
        .letterhead-editor .ProseMirror li p {
          margin-bottom: 0;
        }
        
        .letterhead-editor .ProseMirror-placeholder {
          color: #9ca3af;
          pointer-events: none;
        }
        
        .letterhead-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: 'Write your letter content here...';
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default LetterheadEditor;
