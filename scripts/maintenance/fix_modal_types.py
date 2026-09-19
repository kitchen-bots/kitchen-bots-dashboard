content = """import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateModal, EditModal } from './index';
import { Product } from '../../types';
import { ProductSchema } from '../../utils/schemas';
import { z } from 'zod';

// We need a slightly modified schema for the form because specs is an array of strings,
// but the user inputs it as a comma-separated string.
const FormSchema = ProductSchema.omit({ specs: true }).extend({
  specsInput: z.string().optional(),
});

type FormData = {
  name: string;
  category: string;
  price: number;
  image: string;
  tag: string;
  specsInput: string;
  isFeatured: boolean;
  stock: number;
  status: "Active" | "Draft" | "Archived" | "Hidden";
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSubmit, initialData }: ProductModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      image: '',
      tag: '',
      specsInput: '',
      isFeatured: false,
      stock: 0,
      status: 'Draft',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        specsInput: initialData.specs ? initialData.specs.join(', ') : '',
        status: (initialData.status as any) || 'Draft',
      });
    } else {
      reset({
        name: '',
        category: '',
        price: 0,
        image: '',
        tag: '',
        specsInput: '',
        isFeatured: false,
        stock: 0,
        status: 'Draft',
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: FormData) => {
    try {
      const { specsInput, ...rest } = data;
      const dataToSubmit = {
        ...rest,
        specs: specsInput ? specsInput.split(',').map(s => s.trim()).filter(s => s !== '') : []
      };
      await onSubmit(dataToSubmit as Partial<Product>);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const ModalComponent = initialData ? EditModal : CreateModal;
  const title = initialData ? 'Edit Product' : 'Add New Product';

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onFormSubmit)}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input 
            type="text" 
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Commercial Oven"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input 
              type="text" 
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Cooking Equipment"
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input 
              type="number" 
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="0"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input 
            type="url" 
            {...register('image')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag (Optional)</label>
            <input 
              type="text" 
              {...register('tag')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Best Seller"
            />
            {errors.tag && <p className="mt-1 text-sm text-red-600">{errors.tag.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              {...register('stock', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="0"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
              <option value="Archived">Archived</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('isFeatured')}
                className="w-4 h-4 text-emerald-600-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Feature on Homepage</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (Comma separated)</label>
          <input 
            type="text" 
            {...register('specsInput')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Stainless Steel, 220V, 50Hz"
          />
          {errors.specsInput && <p className="mt-1 text-sm text-red-600">{errors.specsInput.message}</p>}
        </div>
      </div>
    </ModalComponent>
  );
}
"""
with open('src/dashboard/components/Modals/ProductModal.tsx', 'w') as f:
    f.write(content)
