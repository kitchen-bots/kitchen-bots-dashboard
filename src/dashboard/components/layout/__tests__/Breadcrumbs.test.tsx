import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '../Breadcrumbs';
import { PageContainer } from '../PageContainer';

describe('Breadcrumbs & PageContainer Home Navigation', () => {
  it('links Home button to /admin when rendered on admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Breadcrumbs items={[{ label: 'Orders' }]} />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/admin');
  });

  it('links Home button to /dashboard when rendered on customer routes', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/products']}>
        <Breadcrumbs items={[{ label: 'Products' }]} />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/dashboard');
  });

  it('honors explicitly specified homeHref', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/custom']}>
        <Breadcrumbs items={[{ label: 'Custom' }]} homeHref="/custom-home" />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/custom-home');
  });

  it('PageContainer automatically passes dynamic homeHref to Breadcrumbs', () => {
    render(
      <MemoryRouter initialEntries={['/admin/products']}>
        <PageContainer
          title="Products"
          breadcrumbs={[{ label: 'Catalog' }]}
        >
          <div>Content</div>
        </PageContainer>
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/admin');
  });
});
