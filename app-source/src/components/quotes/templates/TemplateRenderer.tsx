import React from 'react';
import { CompanyProfile, PDFTheme, Quote } from '../../../types';
import { ModernTemplate } from './ModernTemplate';
import { CorporateTemplate } from './CorporateTemplate';
import { EmeraldTemplate } from './EmeraldTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { CompactTemplate } from './CompactTemplate';

interface TemplateRendererProps {
  quote: Quote;
  company: CompanyProfile;
  pixQrCodeUrl?: string;
  pixPayload?: string;
  forcedTheme?: PDFTheme;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  quote,
  company,
  pixQrCodeUrl,
  pixPayload,
  forcedTheme,
}) => {
  const activeTheme = forcedTheme || quote.theme || 'modern';

  switch (activeTheme) {
    case 'corporate':
      return (
        <CorporateTemplate
          quote={quote}
          company={company}
          pixQrCodeUrl={pixQrCodeUrl}
          pixPayload={pixPayload}
        />
      );
    case 'emerald':
      return (
        <EmeraldTemplate
          quote={quote}
          company={company}
          pixQrCodeUrl={pixQrCodeUrl}
          pixPayload={pixPayload}
        />
      );
    case 'classic':
      return (
        <ClassicTemplate
          quote={quote}
          company={company}
          pixQrCodeUrl={pixQrCodeUrl}
          pixPayload={pixPayload}
        />
      );
    case 'compact':
      return (
        <CompactTemplate
          quote={quote}
          company={company}
          pixQrCodeUrl={pixQrCodeUrl}
          pixPayload={pixPayload}
        />
      );
    case 'modern':
    default:
      return (
        <ModernTemplate
          quote={quote}
          company={company}
          pixQrCodeUrl={pixQrCodeUrl}
          pixPayload={pixPayload}
        />
      );
  }
};
