import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Typography Scale Usage Rules:
 * - Display: Marketing / Hero (Huge, impactful statements)
 * - H1: Page Title (Primary heading per page)
 * - H2: Section Title (Major sections within a page)
 * - H3: Subsection Title (Nested sections)
 * - H4/H5/H6: Minor headings (Card titles, modal titles, etc.)
 * - Body-Large: Emphasized standard text (Lead paragraphs)
 * - Body: Standard Text (Default reading text)
 * - Small: Secondary Text (Minor details, hints)
 * - Caption: Supporting Information (Metadata, timestamps, extremely small hints)
 * - Label: Form Labels (Input descriptors, table headers)
 */

type TypographyVariant = 
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-lg'
  | 'body'
  | 'small'
  | 'caption'
  | 'label';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
}

const variantStyles: Record<TypographyVariant, string> = {
  display: 'text-display font-heading text-neutral-heading',
  h1: 'text-h1 font-heading text-neutral-heading',
  h2: 'text-h2 font-heading text-neutral-heading',
  h3: 'text-h3 font-heading text-neutral-heading',
  h4: 'text-h4 font-heading text-neutral-heading',
  h5: 'text-h5 font-heading text-neutral-heading',
  h6: 'text-h6 font-heading text-neutral-heading',
  'body-lg': 'text-body-lg text-neutral-body',
  body: 'text-body text-neutral-body',
  small: 'text-small text-muted-foreground',
  caption: 'text-caption text-muted-foreground',
  label: 'text-label text-neutral-heading uppercase tracking-wider', // specific to labels if they need uppercase, but keeping standard is fine. Let's just use the defined text-label
};

const defaultElementMapping: Record<TypographyVariant, React.ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  'body-lg': 'p',
  body: 'p',
  small: 'span',
  caption: 'span',
  label: 'label',
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', as, className, children, ...props }, ref) => {
    const Component = as || defaultElementMapping[variant];
    const baseStyle = variantStyles[variant];

    // Ensure we don't accidentally apply 'text-label' if we just want 'label' variant from tailwind 
    // Actually, tailwind config maps `text-label` automatically since we added `label` to `fontSize`.

    return (
      <Component
        ref={ref}
        className={cn(baseStyle, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6 | '1' | '2' | '3' | '4' | '5' | '6' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  ({ level = 1, ...props }, ref) => {
    const variant = (String(level).startsWith('h') ? level : `h${level}`) as TypographyVariant;
    return <Typography ref={ref} variant={variant} {...props} />;
  }
);
Heading.displayName = 'Heading';

export interface TextProps extends Omit<TypographyProps, 'variant'> {
  variant?: TypographyVariant | 'muted';
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body', className, ...props }, ref) => {
    const isMuted = variant === 'muted';
    const actualVariant = isMuted ? 'body' : variant;
    const finalClassName = cn(className, isMuted && 'text-muted-foreground');
    
    return <Typography ref={ref} variant={actualVariant} className={finalClassName} {...props} />;
  }
);
Text.displayName = 'Text';
