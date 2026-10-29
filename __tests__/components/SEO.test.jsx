// @vitest-environment node
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SEO from '../../components/SEO';

describe('structured data serialization', () => {
  it.each([undefined, null, []].map(value => [value]))('renders no scripts without schema data: %j', (schema) => {
    expect(renderToStaticMarkup(<SEO schema={schema} />)).toBe('');
  });

  it('renders one JSON-LD script for one schema', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Macenza' };
    expect(renderToStaticMarkup(<SEO schema={schema} />)).toBe(
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    );
  });

  it('renders separate, ordered scripts for multiple schemas', () => {
    const schemas = [{ '@type': 'Organization' }, { '@type': 'BlogPosting' }];
    const markup = renderToStaticMarkup(<SEO schema={schemas} />);
    expect(markup).toBe(schemas.map(schema =>
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    ).join(''));
  });

  it('prevents nested content from closing a script while preserving valid JSON', () => {
    const schema = {
      '@type': 'BlogPosting',
      headline: '</script><script>alert("test")</script>',
      nested: { description: '<!-- <img src=x onerror=alert(1)> & "quotes"' },
    };
    const markup = renderToStaticMarkup(<SEO schema={schema} />);
    const json = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('</script>'));
    expect(json).not.toContain('<');
    expect(json).toContain('\\u003c/script>');
    expect(JSON.parse(json)).toEqual(schema);
    expect(markup.match(/<script\b/g)).toHaveLength(1);
    expect(markup.match(/<\/script>/g)).toHaveLength(1);
  });
});
