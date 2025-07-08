import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmailEditor, { EditorRef } from '../../../src'; // use react-email-editor instead

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
`;

const Bar = styled.div`
  flex: 1;
  background-color: #61dafb;
  color: #000;
  padding: 10px;
  display: flex;
  max-height: 40px;

  h1 {
    flex: 1;
    font-size: 16px;
    text-align: left;
  }

  button {
    flex: 1;
    padding: 10px;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    background-color: #000;
    color: #fff;
    border: 0px;
    max-width: 150px;
    cursor: pointer;
  }

  a {
    flex: 1;
    padding: 10px;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    border: 0px;
    cursor: pointer;
    text-align: right;
    text-decoration: none;
    line-height: 160%;
  }
`;

// Helper to persist templates per tenant in localStorage.
const getTemplatesKey = (tenant: string) => `templates_${tenant}`;

interface SavedTemplate {
  id: string;
  name: string;
  design: unknown;
}

const DesignEdit = () => {
  const emailEditorRef = useRef<EditorRef | null>(null);

  const navigate = useNavigate();
  const { tenantId, designId } = useParams();

  const effectiveTenant = tenantId || 'default';

  // Load existing design if editing.
  useEffect(() => {
    if (!designId || designId === 'new') return;
    const key = getTemplatesKey(effectiveTenant);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const templates: SavedTemplate[] = JSON.parse(stored);
        const found = templates.find((t) => t.id === designId);
        if (found) {
          // Wait until the editor loads before calling loadDesign.
          emailEditorRef.current?.editor?.loadDesign(found.design);
        }
      }
    } catch (e) {
      console.error('Unable to load template', e);
    }
  }, [designId, effectiveTenant]);

  const saveDesign = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((design) => {
      const name = prompt('Template name:', 'My template') || 'Unnamed';
      const id = designId && designId !== 'new' ? designId : Date.now().toString();

      const key = getTemplatesKey(effectiveTenant);
      let templates: SavedTemplate[] = [];
      try {
        const stored = localStorage.getItem(key);
        if (stored) templates = JSON.parse(stored);
      } catch (_) {}

      const existingIndex = templates.findIndex((t) => t.id === id);
      if (existingIndex >= 0) {
        templates[existingIndex] = { id, name, design };
      } else {
        templates.push({ id, name, design });
      }

      localStorage.setItem(key, JSON.stringify(templates));

      alert('Template saved!');

      // Redirect to list after saving new template.
      if (!designId || designId === 'new') {
        navigate(tenantId ? `/tenant/${tenantId}/dashboard` : `/dashboard`);
      }
    });
  };

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { html } = data;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Container>
      <Bar>
        <h1>React Email Editor (Demo)</h1>

        <Link to={tenantId ? `/tenant/${tenantId}/dashboard` : `/dashboard`}>
          Dashboard
        </Link>
        <button onClick={saveDesign}>Save Design</button>
        <button onClick={exportHtml}>Export HTML</button>
      </Bar>

      <EmailEditor
        ref={emailEditorRef}
        options={{
          version: 'latest',
          appearance: {
            theme: 'modern_light',
          },
        }}
      />
    </Container>
  );
};

export default DesignEdit;
