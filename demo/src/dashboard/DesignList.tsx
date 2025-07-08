import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface SavedTemplateMeta {
  id: string;
  name: string;
}

const DesignList = () => {
  const { tenantId } = useParams();

  const [templates, setTemplates] = useState<SavedTemplateMeta[]>([]);

  useEffect(() => {
    // Fallback tenant id when parameter is missing (single-tenant mode).
    const effectiveTenant = tenantId || 'default';
    const key = `templates_${effectiveTenant}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to read templates', e);
    }
  }, [tenantId]);

  return (
    <div>
      <h1>My Designs {tenantId ? `(Tenant: ${tenantId})` : ''}</h1>

      <p>
        <Link to={tenantId ? `/tenant/${tenantId}/dashboard/design/new` : `/dashboard/design/new`}>
          New Design
        </Link>
      </p>

      {templates.length === 0 && <p>No saved templates.</p>}

      <ul>
        {templates.map((tpl) => (
          <li key={tpl.id}>
            <Link
              to={tenantId ? `/tenant/${tenantId}/dashboard/design/edit/${tpl.id}` : `/dashboard/design/edit/${tpl.id}`}
            >
              {tpl.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DesignList;
