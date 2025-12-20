import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Extension, Node } from '@tiptap/core';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  SeparatorHorizontal,
} from 'lucide-react';

interface LetterheadEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Extend command types for our custom commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
    indent: {
      increaseIndent: () => ReturnType;
      decreaseIndent: () => ReturnType;
    };
  }
}

// Custom Page Break Node
const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  
  parseHTML() {
    return [
      { tag: 'div[data-page-break]' },
      { tag: 'hr.page-break' },
    ];
  },
  
  renderHTML() {
    return ['div', { 
      'data-page-break': 'true', 
      class: 'page-break-marker',
      contenteditable: 'false'
    }, ['hr']];
  },
  
  addCommands() {
    return {
      insertPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    };
  },
});

// Custom Indent Extension - stores indent as paragraph attribute
const IndentExtension = Extension.create({
  name: 'indent',
  
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'listItem'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const style = element.style.marginLeft || element.style.paddingLeft || '';
              const match = style.match(/(\d+)/);
              if (match) {
                return Math.floor(parseInt(match[1]) / 24);
              }
              return parseInt(element.getAttribute('data-indent') || '0', 10);
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }
              return {
                'data-indent': attributes.indent,
                style: `margin-left: ${attributes.indent * 24}px;`
              };
            },
          },
        },
      },
    ];
  },
  
  addCommands() {
    return {
      increaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;
        
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph' || node.type.name === 'listItem') {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < 5) { // Max 5 levels of indentation
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent + 1,
              });
            }
          }
        });
        
        if (dispatch) dispatch(tr);
        return true;
      },
      
      decreaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;
        
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph' || node.type.name === 'listItem') {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > 0) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1,
              });
            }
          }
        });
        
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
  
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.increaseIndent(),
      'Shift-Tab': () => this.editor.commands.decreaseIndent(),
    };
  },
});

const LetterheadEditor = ({ value, onChange }: LetterheadEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
      PageBreak,
      IndentExtension,
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

  const insertPageBreak = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertPageBreak().run();
    }
  }, [editor]);

  const handleIncreaseIndent = useCallback(() => {
    if (editor) {
      editor.chain().focus().increaseIndent().run();
    }
  }, [editor]);

  const handleDecreaseIndent = useCallback(() => {
    if (editor) {
      editor.chain().focus().decreaseIndent().run();
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
          onClick={handleIncreaseIndent}
          title="Increase Indent (Tab)"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecreaseIndent}
          title="Decrease Indent (Shift+Tab)"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Page Break */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
          onClick={insertPageBreak}
          title="Insert Page Break (Ctrl+Enter)"
        >
          <SeparatorHorizontal className="h-4 w-4" />
          <span className="text-xs">Page Break</span>
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
        
        /* Page break marker styling in editor */
        .letterhead-editor .ProseMirror .page-break-marker {
          position: relative;
          display: block;
          margin: 16px 0;
          padding: 8px 0;
          border: none;
          user-select: none;
        }
        
        .letterhead-editor .ProseMirror .page-break-marker hr {
          border: none;
          border-top: 2px dashed #cbd5e1;
        }
        
        .letterhead-editor .ProseMirror .page-break-marker::after {
          content: '— Page Break —';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0 12px;
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
