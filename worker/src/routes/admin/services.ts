import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const servicesAdminRouter = new Hono();

// GET /v1/admin/services
servicesAdminRouter.get('/', async (c) => {
  const services = await getCollection('serviceTickets', c.env);
  return c.json({ success: true, data: services });
});

// GET /v1/admin/services/:id
servicesAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const service = await getDocument('serviceTickets', id, c.env);
  if (!service) {
    return c.json({ success: false, message: 'Service ticket not found' }, 404);
  }
  return c.json({ success: true, data: service });
});

// POST /v1/admin/services
servicesAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  const customerName = body.customerName || body.clientName || body.restaurantName;
  const productName = body.productName || body.equipmentModel;

  if (!customerName || !productName) {
    return c.json({ success: false, message: 'Customer name and product/equipment name are required' }, 400);
  }

  const id = body.id || `SR-${Math.floor(1000 + Math.random() * 9000)}`;
  const status = body.status || 'Open';
  const priority = body.priority || (body.isUrgent ? 'Urgent' : 'Normal');
  const isUrgent = Boolean(body.isUrgent || priority === 'Urgent');
  const initials = body.customerInitials || customerName.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) || 'KB';

  const newService = await setDocument('serviceTickets', id, {
    ...body,
    id,
    ticketId: id,
    customerName,
    clientName: customerName,
    restaurantName: customerName,
    customerInitials: initials,
    customerColor: body.customerColor || 'bg-primary/10 text-primary',
    customerAvatar: body.customerAvatar || '',
    productName,
    equipmentModel: productName,
    engineerName: body.engineerName || body.assignedEngineerName || 'Unassigned',
    assignedEngineerName: body.engineerName || body.assignedEngineerName || 'Unassigned',
    assignedEngineerId: body.assignedEngineerId || '',
    engineerColor: body.engineerColor || (body.engineerName ? 'bg-emerald-500' : 'bg-slate-400'),
    status,
    priority,
    isUrgent,
    issue: body.issue || body.description || '',
    description: body.description || body.issue || '',
    date: body.date || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, c.env);

  return c.json({ success: true, data: newService }, 201);
});

// PUT /v1/admin/services/:id
servicesAdminRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await getDocument('serviceTickets', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Service ticket not found' }, 404);
  }

  const body = await c.req.json();
  const customerName = body.customerName || body.clientName || body.restaurantName || existing.customerName;
  const productName = body.productName || body.equipmentModel || existing.productName;
  const status = body.status || existing.status;
  const priority = body.priority || (body.isUrgent !== undefined ? (body.isUrgent ? 'Urgent' : 'Normal') : existing.priority);
  const isUrgent = body.isUrgent !== undefined ? Boolean(body.isUrgent) : (priority === 'Urgent');

  const updated = await setDocument('serviceTickets', id, {
    ...existing,
    ...body,
    ...(customerName ? { customerName, clientName: customerName, restaurantName: customerName } : {}),
    ...(productName ? { productName, equipmentModel: productName } : {}),
    ...(body.engineerName || body.assignedEngineerName ? {
      engineerName: body.engineerName || body.assignedEngineerName,
      assignedEngineerName: body.engineerName || body.assignedEngineerName
    } : {}),
    status,
    priority,
    isUrgent,
    updatedAt: new Date().toISOString(),
    ...(status === 'Completed' || status === 'Resolved' ? { resolvedAt: existing.resolvedAt || new Date().toISOString() } : {})
  }, c.env);

  return c.json({ success: true, data: updated });
});

// PATCH /v1/admin/services/:id/status
servicesAdminRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  if (!body.status) {
    return c.json({ success: false, message: 'Status is required' }, 400);
  }

  const existing = await getDocument('serviceTickets', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Service ticket not found' }, 404);
  }

  const status = body.status;
  const updated = await setDocument('serviceTickets', id, {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
    ...(status === 'Completed' || status === 'Resolved' ? { resolvedAt: existing.resolvedAt || new Date().toISOString() } : {})
  }, c.env);

  return c.json({ success: true, data: updated });
});

// PATCH /v1/admin/services/:id/assignment
servicesAdminRouter.patch('/:id/assignment', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await getDocument('serviceTickets', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Service ticket not found' }, 404);
  }

  const engineerName = body.engineerName || body.assignedEngineerName || existing.engineerName;
  const assignedEngineerId = body.assignedEngineerId || existing.assignedEngineerId;
  const status = body.status || (existing.status === 'Open' ? 'Assigned' : existing.status);

  const updated = await setDocument('serviceTickets', id, {
    ...existing,
    engineerName,
    assignedEngineerName: engineerName,
    assignedEngineerId,
    engineerColor: body.engineerColor || 'bg-emerald-500',
    status,
    updatedAt: new Date().toISOString()
  }, c.env);

  return c.json({ success: true, data: updated });
});

// DELETE /v1/admin/services/:id
servicesAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('serviceTickets', id, c.env);
  if (!deleted) {
    return c.json({ success: false, message: 'Service ticket not found' }, 404);
  }
  return c.json({ success: true, message: 'Service ticket deleted' });
});
