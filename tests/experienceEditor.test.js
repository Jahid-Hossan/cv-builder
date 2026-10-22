import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { plainDescriptionHtml, descriptionHtml } from '../src/utils/richText.js';

test('Experience editing supports bold, italic, underline, bullets and numbered lists', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {pretendToBeVisual:true});
  const saved = new Map();
  for (const name of ['window','document','navigator','Node','HTMLElement','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
    saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));
    const bound = ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(name);
    Object.defineProperty(globalThis,name,{configurable:true,value:bound ? dom.window[name].bind(dom.window) : dom.window[name]});
  }
  let editor;
  try {
    editor = new Editor({element:document.createElement('div'),extensions:[StarterKit.configure({heading:false,blockquote:false,code:false,codeBlock:false,horizontalRule:false,strike:false,link:false,underline:false}),Underline],content:plainDescriptionHtml('Delivered reliable software')});
    editor.commands.setTextSelection({from:1,to:10});
    editor.commands.toggleBold(); editor.commands.toggleItalic(); editor.commands.toggleUnderline();
    assert.match(editor.getHTML(),/<strong><em><u>Delivered<\/u><\/em><\/strong>/);
    editor.commands.toggleBulletList();
    assert.match(editor.getHTML(),/<ul><li><p>/);
    assert.equal(descriptionHtml(editor.getHTML()),editor.getHTML());
    editor.commands.toggleOrderedList();
    assert.match(editor.getHTML(),/<ol><li><p>/);
    editor.commands.setContent(plainDescriptionHtml('Old text\nSecond line'));
    assert.equal(editor.getText({blockSeparator:'\n'}),'Old text\nSecond line');
  } finally {
    editor?.destroy(); dom.window.close();
    for (const [name,descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
    }
  }
});
