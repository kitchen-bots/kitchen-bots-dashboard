import { FieldValues, UseFieldArrayReturn, ArrayPath } from 'react-hook-form';

/**
 * Form System Advanced Capabilities Architecture
 * 
 * This file defines the contracts and extension points for future Form System 
 * features (Wizards, Arrays). Do not implement runtime code for these until required.
 */

/**
 * FormArray Architecture
 * Contract for handling dynamic lists of inputs (e.g. variations, tags, multi-select objects)
 */
export interface FormArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>
> {
  name: TFieldArrayName;
  // The structure of an empty/new item when adding
  defaultItem: unknown; 
  // Render prop for custom array rendering
  render: (props: {
    fields: UseFieldArrayReturn<TFieldValues, TFieldArrayName>['fields'];
    append: UseFieldArrayReturn<TFieldValues, TFieldArrayName>['append'];
    remove: UseFieldArrayReturn<TFieldValues, TFieldArrayName>['remove'];
    // ... other UseFieldArrayReturn methods
  }) => React.ReactNode;
}

/**
 * Wizard Form Architecture
 * Contract for multi-step forms
 */
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  // Optional validation schema specific to this step
  validationSchema?: unknown; // Typically a Zod schema
  component: React.ComponentType<any>;
}

export interface WizardFormProps<TFieldValues extends FieldValues> {
  steps: WizardStep[];
  defaultValues: Partial<TFieldValues>;
  onSubmit: (values: TFieldValues) => Promise<void>;
  // Renders the progress bar / step indicator
  renderHeader?: (currentStepId: string, steps: WizardStep[]) => React.ReactNode;
  // Renders Prev/Next buttons
  renderFooter?: (
    currentStepId: string,
    onNext: () => void,
    onPrev: () => void,
    isSubmitting: boolean
  ) => React.ReactNode;
}

/**
 * File Upload Architecture
 * Standardized upload field contract
 */
export interface FileUploadFieldProps {
  name: string;
  label: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[]; // e.g., ['image/png', 'application/pdf']
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
}
