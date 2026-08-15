import React, { useState, useEffect } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain?: string;
}

const previewCache = new Map<string, LinkPreviewData | null>();

export function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>'"]+/i);
  return match ? match[0] : null;
}

export const LinkPreviewCard: React.FC<{ url: string }> = ({ url }) => {
  const [data, setData] = useState<LinkPreviewData | null>(previewCache.get(url) || null);
  const [loading, setLoading] = useState(!previewCache.has(url));

  useEffect(() => {
    if (!url || previewCache.has(url)) {
      setData(previewCache.get(url) || null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted) {
          previewCache.set(url, resData);
          setData(resData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          previewCache.set(url, null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading || !data || (!data.title && !data.image)) {
    return null;
  }

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        marginTop: '8px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        textDecoration: 'none',
        color: '#ffffff',
        maxWidth: '360px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
    >
      {data.image && (
        <div style={{ width: '100%', height: '140px', overflow: 'hidden', background: '#0a0f1d' }}>
          <img
            src={data.image}
            alt={data.title || 'Preview'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Globe style={{ width: '12px', height: '12px', color: '#10b981' }} />
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
            {data.siteName || data.domain || 'Link'}
          </span>
          <ExternalLink style={{ width: '10px', height: '10px', color: '#94a3b8', marginLeft: 'auto' }} />
        </div>

        {data.title && (
          <div
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              marginBottom: '3px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {data.title}
          </div>
        )}

        {data.description && (
          <div
            style={{
              fontSize: '0.74rem',
              color: '#94a3b8',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {data.description}
          </div>
        )}
      </div>
    </a>
  );
};
