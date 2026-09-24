import { Lead } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export interface Quotation {
  id: string;
  leadId: string;
  value: number;
  status: 'Draft' | 'Sent' | 'Pending' | 'Approved' | 'Rejected';
  date: string;
  lastUpdated: string;
}

export interface CRMActivity {
  id: string;
  type: 'Assignment' | 'Proposal' | 'Meeting' | 'Conversion' | 'Enquiry' | 'Note';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface FollowUpTask {
  id: string;
  title: string;
  type: 'Call' | 'Meeting' | 'Deadline' | 'Reminder';
  date: string;
  time: string;
  leadId?: string;
  leadName?: string;
}

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'L-501',
    source: 'Contact Form',
    firstName: 'Vikram',
    lastName: 'Singh',
    companyName: 'Blue Door Cafe',
    email: 'vikram@bluedoorcafe.in',
    phone: '+91 98765 43210',
    equipmentNeeded: 'Smart Fryer Pro',
    quantity: 2,
    timeline: 'Immediate (2 weeks)',
    message: 'Looking for 2 units of automated commercial fryers with digital oil filtration.',
    status: 'New',
    score: 85,
    followUpDate: '2024-10-16',
    assignedTo: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      email: 'rohan.s@kitchenbots.com',
      phone: '+91 98111 22233',
      load: 4,
      status: 'Available',
    },
    notes: {
      sales: ['Inbound enquiry from website contact form'],
      admin: ['Verified restaurant location in Connaught Place'],
      followUp: ['Call scheduled for product demo discussion'],
    },
    createdAt: '2024-10-15T09:30:00.000Z',
  },
  {
    id: 'L-502',
    source: 'Bulk Enquiry',
    firstName: 'Anita',
    lastName: 'Desai',
    companyName: 'Cloud Kitchens India',
    email: 'anita@cloudkitchens.co.in',
    phone: '+91 98222 33445',
    equipmentNeeded: 'Auto-Wok 3000',
    quantity: 5,
    timeline: '1 month',
    message: 'Setting up 3 new cloud kitchen hubs in Bengaluru and NCR. Need robotic stir fry woks.',
    status: 'Proposal Sent',
    score: 95,
    followUpDate: '2024-10-17',
    assignedTo: {
      name: 'Priya Mehta',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      email: 'priya.m@kitchenbots.com',
      phone: '+91 98333 44556',
      load: 6,
      status: 'Busy',
    },
    notes: {
      sales: ['Commercial proposal sent with 5-unit tier pricing'],
      admin: ['High-value enterprise lead'],
      followUp: ['Reviewing proposal with their procurement team'],
    },
    createdAt: '2024-10-12T11:15:00.000Z',
  },
  {
    id: 'L-503',
    source: 'Referral',
    firstName: 'Rahul',
    lastName: 'Verma',
    companyName: 'Verma Sweets',
    email: 'rahul@vermasweets.com',
    phone: '+91 98444 55667',
    equipmentNeeded: 'Commercial Stand Mixer',
    quantity: 1,
    timeline: '3 weeks',
    message: 'Referred by Taj Hotels. Need heavy-duty dough mixer 20L capacity.',
    status: 'Contacted',
    score: 75,
    followUpDate: '2024-10-18',
    assignedTo: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      email: 'rohan.s@kitchenbots.com',
      phone: '+91 98111 22233',
      load: 4,
      status: 'Available',
    },
    notes: {
      sales: ['Initial discovery call completed'],
      admin: [],
      followUp: ['Send spec sheet for 20L mixer model'],
    },
    createdAt: '2024-10-14T14:20:00.000Z',
  },
  {
    id: 'L-504',
    source: 'Cold Call',
    firstName: 'Meera',
    lastName: 'Patel',
    companyName: 'Spice Route Hospitality',
    email: 'meera@spiceroute.org',
    phone: '+91 98555 66778',
    equipmentNeeded: 'Industrial Gas Range',
    quantity: 3,
    timeline: '2 months',
    message: 'Opening 2 fine-dining outlets. Need customized 4-burner natural gas ranges.',
    status: 'Requirement Gathering',
    score: 80,
    followUpDate: '2024-10-19',
    assignedTo: {
      name: 'Priya Mehta',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      email: 'priya.m@kitchenbots.com',
      phone: '+91 98333 44556',
      load: 6,
      status: 'Busy',
    },
    notes: {
      sales: ['Discussed kitchen layout dimensions and gas line specifications'],
      admin: [],
      followUp: ['Site inspection scheduled for Friday'],
    },
    createdAt: '2024-10-10T16:00:00.000Z',
  },
  {
    id: 'L-505',
    source: 'Bulk Enquiry',
    firstName: 'Arjun',
    lastName: 'Nair',
    companyName: 'Grand Palace Banquets',
    email: 'arjun@grandpalace.in',
    phone: '+91 98666 77889',
    equipmentNeeded: 'Auto-Wok 3000 & Gas Range',
    quantity: 4,
    timeline: '1 month',
    message: 'Banquet hall renovation project. Finalizing commercial terms.',
    status: 'Negotiation',
    score: 90,
    followUpDate: '2024-10-16',
    assignedTo: {
      name: 'Priya Mehta',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      email: 'priya.m@kitchenbots.com',
      phone: '+91 98333 44556',
      load: 6,
      status: 'Busy',
    },
    notes: {
      sales: ['Contract review in progress, discussing warranty extensions'],
      admin: ['Legal approval pending'],
      followUp: ['Follow up with procurement head on discount structure'],
    },
    createdAt: '2024-10-08T10:00:00.000Z',
  },
  {
    id: 'L-506',
    source: 'Referral',
    firstName: 'Sanjay',
    lastName: 'Gupta',
    companyName: 'Gupta Traders & Bakery',
    email: 'sanjay@guptatraders.com',
    phone: '+91 98777 88990',
    equipmentNeeded: 'SteamPro Commercial Oven',
    quantity: 1,
    timeline: 'Completed',
    message: 'Converted into active commercial account. Order placed.',
    status: 'Converted',
    score: 100,
    followUpDate: '2024-10-14',
    assignedTo: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      email: 'rohan.s@kitchenbots.com',
      phone: '+91 98111 22233',
      load: 4,
      status: 'Available',
    },
    notes: {
      sales: ['Order ORD-1028 placed for SteamPro Oven'],
      admin: ['Account transitioned to customer portal'],
      followUp: ['Installation handover scheduled with service team'],
    },
    createdAt: '2024-10-01T12:00:00.000Z',
  },
];

export const INITIAL_FOLLOW_UP_TASKS: FollowUpTask[] = [
  {
    id: 'fut-1',
    title: 'Call Vikram Singh - Demo Discussion',
    type: 'Call',
    date: 'Today',
    time: '02:00 PM',
    leadId: 'L-501',
    leadName: 'Blue Door Cafe',
  },
  {
    id: 'fut-2',
    title: 'Commercial Terms Review with Anita Desai',
    type: 'Meeting',
    date: 'Tomorrow',
    time: '11:30 AM',
    leadId: 'L-502',
    leadName: 'Cloud Kitchens India',
  },
  {
    id: 'fut-3',
    title: 'Site Kitchen Inspection with Meera Patel',
    type: 'Meeting',
    date: 'Oct 19',
    time: '04:00 PM',
    leadId: 'L-504',
    leadName: 'Spice Route Hospitality',
  },
];

export const INITIAL_CRM_ACTIVITIES: CRMActivity[] = [
  {
    id: 'act-1',
    type: 'Proposal',
    message: 'Proposal #QT-48291 sent to Cloud Kitchens India for 5x Auto-Wok 3000',
    timestamp: '25 mins ago',
    user: {
      name: 'Priya Mehta',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
  },
  {
    id: 'act-2',
    type: 'Note',
    message: 'Logged discovery call notes for Rahul Verma (Verma Sweets)',
    timestamp: '2 hours ago',
    user: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
  },
  {
    id: 'act-3',
    type: 'Enquiry',
    message: 'New lead enquiry received from Blue Door Cafe (Smart Fryer Pro)',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-4',
    type: 'Conversion',
    message: 'Gupta Traders converted into commercial customer with Order ORD-1028',
    timestamp: 'Yesterday',
    user: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
  },
];

export function mapFirestoreEnquiryToLead(raw: any): Lead {
  const firstName = raw.firstName || (raw.name ? raw.name.split(' ')[0] : 'Prospect');
  const lastName = raw.lastName || (raw.name && raw.name.split(' ').length > 1 ? raw.name.split(' ').slice(1).join(' ') : 'Customer');
  const companyName = raw.company || raw.companyName || (raw.organization ? raw.organization : 'Direct Enquiry');
  const email = raw.email || 'enquiry@kitchenbots.com';
  const phone = raw.phone || '+91 9490701421';

  let source: 'Bulk Enquiry' | 'Contact Form' | 'Cold Call' | 'Referral' = 'Contact Form';
  if (raw.source === 'bulk' || raw.source === 'Bulk Enquiry' || (raw.items && raw.items.length > 0)) {
    source = 'Bulk Enquiry';
  } else if (raw.source === 'Referral') {
    source = 'Referral';
  } else if (raw.source === 'Cold Call') {
    source = 'Cold Call';
  }

  let status: Lead['status'] = 'New';
  const rawStatus = (raw.status || '').toLowerCase();
  if (rawStatus === 'contacted') status = 'Contacted';
  else if (rawStatus === 'requirement gathering' || rawStatus === 'in_progress') status = 'Requirement Gathering';
  else if (rawStatus === 'proposal sent' || rawStatus === 'quoted') status = 'Proposal Sent';
  else if (rawStatus === 'negotiation') status = 'Negotiation';
  else if (rawStatus === 'converted' || rawStatus === 'won') status = 'Converted';
  else if (rawStatus === 'lost' || rawStatus === 'closed') status = 'Lost';
  else status = 'New';

  const equipmentNeeded = raw.equipmentNeeded || (raw.items && raw.items.length > 0
    ? raw.items.map((i: any) => `${i.productId || 'Equipment'} (${i.quantity || 1})`).join(', ')
    : raw.productName || raw.message || 'Commercial Kitchen Equipment');

  const quantity = Number(raw.quantity || (raw.items && raw.items.length > 0 ? raw.items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0) : 1));

  return {
    id: raw.id,
    source,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    equipmentNeeded,
    quantity,
    timeline: raw.timeline || 'Immediate',
    message: raw.message || 'Customer submitted enquiry via website.',
    status,
    score: Number(raw.score || (source === 'Bulk Enquiry' ? 90 : 75)),
    followUpDate: raw.followUpDate || raw.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    assignedTo: raw.assignedTo || {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      email: 'rohan.s@kitchenbots.com',
      phone: '+91 98111 22233',
      load: 4,
      status: 'Available',
    },
    notes: raw.notes || {
      sales: raw.message ? [raw.message] : ['Inbound enquiry from website'],
      admin: raw.reference ? [`Reference: ${raw.reference}`] : [],
      followUp: ['Initial customer outreach required'],
    },
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

let localLeads = [...INITIAL_LEADS];

export const leadsApi = {
  getLeads: async (params?: PaginationParams): Promise<PaginatedResponse<Lead>> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    let records: Lead[] = [];
    try {
      const res = await fetch(`${apiUrl}/v1/admin/enquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data: any[] };
        if (json.success && Array.isArray(json.data)) {
          const apiRecords = json.data.map(mapFirestoreEnquiryToLead);
          localLeads = [...apiRecords, ...INITIAL_LEADS.filter((il) => !apiRecords.some((r) => r.id === il.id))];
          records = [...localLeads];
        }
      }
    } catch (err) {
      console.warn('Failed to fetch leads from API, falling back to local CRM leads', err);
    }

    if (records.length === 0) {
      records = [...localLeads];
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(
        (l) =>
          l.firstName.toLowerCase().includes(q) ||
          l.lastName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.equipmentNeeded && l.equipmentNeeded.toLowerCase().includes(q))
      );
    }
    if (params?.status && params.status !== 'All') {
      records = records.filter((l) => l.status === params.status);
    }
    if (params?.source && params.source !== 'All') {
      records = records.filter((l) => l.source === params.source);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/enquiries/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data: any };
        if (json.success && json.data) {
          return mapFirestoreEnquiryToLead(json.data);
        }
      }
    } catch {
      // fallback
    }

    const lead = localLeads.find((l) => l.id === id) || INITIAL_LEADS.find((l) => l.id === id);
    if (!lead) throw new Error(`Lead ${id} not found`);
    return lead;
  },

  createLead: async (data: Omit<Lead, 'id'>): Promise<Lead> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/enquiries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data: any };
        if (json.success && json.data) {
          const mapped = mapFirestoreEnquiryToLead(json.data);
          localLeads.unshift(mapped);
          return mapped;
        }
      }
    } catch {
      // fallback
    }

    const newLead: Lead = {
      ...data,
      id: `enq-${Date.now()}`,
      notes: data.notes || { sales: [], admin: [], followUp: [] },
    };
    localLeads.unshift(newLead);
    return newLead;
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/enquiries/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data: any };
        if (json.success && json.data) {
          return mapFirestoreEnquiryToLead(json.data);
        }
      }
    } catch {
      // fallback
    }

    let index = localLeads.findIndex((l) => l.id === id);
    if (index === -1) {
      const initial = INITIAL_LEADS.find((l) => l.id === id);
      if (initial) {
        localLeads.push({ ...initial });
        index = localLeads.length - 1;
      }
    }
    if (index === -1) throw new Error(`Lead ${id} not found`);
    localLeads[index] = { ...localLeads[index], ...data };
    return localLeads[index];
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/enquiries/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const json = (await res.json()) as { success: boolean; data: any };
        if (json.success && json.data) {
          return mapFirestoreEnquiryToLead(json.data);
        }
      }
    } catch {
      // fallback
    }

    let index = localLeads.findIndex((l) => l.id === id);
    if (index === -1) {
      const initial = INITIAL_LEADS.find((l) => l.id === id);
      if (initial) {
        localLeads.push({ ...initial });
        index = localLeads.length - 1;
      }
    }
    if (index === -1) throw new Error(`Lead ${id} not found`);
    localLeads[index] = { ...localLeads[index], status };
    return localLeads[index];
  },

  getQuotationsByLead: async (leadId: string, _params?: PaginationParams): Promise<PaginatedResponse<Quotation>> => {
    if (leadId === 'L-502') {
      return {
        data: [
          {
            id: 'QT-48291',
            leadId: 'L-502',
            value: 925000,
            status: 'Sent',
            date: '2024-10-15',
            lastUpdated: '2024-10-15',
          },
        ],
        total: 1,
      };
    }
    return { data: [], total: 0 };
  },

  getCRMActivities: async (_params?: PaginationParams): Promise<PaginatedResponse<CRMActivity>> => {
    return { data: INITIAL_CRM_ACTIVITIES, total: INITIAL_CRM_ACTIVITIES.length };
  },

  getFollowUpTasks: async (_params?: PaginationParams): Promise<PaginatedResponse<FollowUpTask>> => {
    return { data: INITIAL_FOLLOW_UP_TASKS, total: INITIAL_FOLLOW_UP_TASKS.length };
  },
};

