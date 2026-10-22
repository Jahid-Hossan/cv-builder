"use client";
import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { descriptionHtml, descriptionLength, experienceHtml, DESCRIPTION_LIMIT } from '../utils/richText';

export default function ExperienceDescription({ id, item, onChange }) {
  const [tooLong, setTooLong] = useState(false);
  const content = experienceHtml(item);
  const accepted = useRef(content);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({
      heading: false, blockquote: false, code: false, codeBlock: false,
      horizontalRule: false, strike: false, link: false, underline: false,
    }), Underline],
    content,
    editorProps: { attributes: {
      id, role: 'textbox', 'aria-multiline': 'true',
      'aria-label': 'Experience description', 'aria-describedby': `${id}-help`,
      class: 'rich-editor-content',
    } },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (descriptionLength(html) > DESCRIPTION_LIMIT || html.length > 64000) {
        editor.commands.setContent(accepted.current, { emitUpdate: false });
        setTooLong(true);
        return;
      }
      setTooLong(false);
      accepted.current = descriptionHtml(html);
      onChange(accepted.current);
    },
  });
  const active = useEditorState({ editor, selector: ({ editor }) => editor ? {
    bold: editor.isActive('bold'), italic: editor.isActive('italic'),
    underline: editor.isActive('underline'), bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
  } : {} });
  useEffect(() => {
    accepted.current = content;
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);
  const controls = [
    ['bold', 'Bold', 'toggleBold'], ['italic', 'Italic', 'toggleItalic'],
    ['underline', 'Underline', 'toggleUnderline'],
    ['bulletList', 'Bullet list', 'toggleBulletList'],
    ['orderedList', 'Numbered list', 'toggleOrderedList'],
  ];
  return <div className="rich-editor">
    <div role="group" aria-label="Experience formatting" className="rich-editor-toolbar">
      {controls.map(([mark, label, command]) => <button key={mark} type="button"
        disabled={!editor} aria-pressed={Boolean(active?.[mark])}
        onClick={() => editor.chain().focus()[command]().run()}>{label}</button>)}
    </div>
    <EditorContent editor={editor} />
    <p id={`${id}-help`} className={tooLong ? 'field-error' : 'help'} role="status">
      {tooLong ? 'Description must be 2000 characters or fewer. The last edit was not saved.'
        : `${descriptionLength(content)}/2000 characters`}
    </p>
  </div>;
}
