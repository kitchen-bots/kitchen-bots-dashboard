/**
 * Firestore Rules test matrix (Phase 01, Task 3).
 *
 * Runs against the Firebase Emulator Suite. Start the emulators first:
 *   firebase emulators:start --only firestore
 * then run:
 *   npm run test:rules
 *
 * The matrix proves default denial first, then each allow in the rules file,
 * then the explicit denial of client writes to protected fields.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

const RULES_PATH = join(__dirname, '../../firestore.rules');

function alice(uid: string) {
  return testEnv.authenticatedContext(uid, {
    email: 'alice@example.com',
    email_verified: true,
  });
}

function staff(uid: string, role: 'editor' | 'operations' | 'admin') {
  return testEnv.authenticatedContext(uid, { role, email: `${role}@example.com`, email_verified: true });
}

const RULES_PORT = Number(process.env.FIRESTORE_EMULATOR_PORT || 8080);

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'rules-test-kb',
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: RULES_PORT,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Seed a published product and an order via the admin context (simulating Worker writes).
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'products/prod-1'), { slug: 'kb-flip-bbq', publicationState: 'published', name: 'Flip BBQ' });
    await setDoc(doc(db, 'products/prod-2'), { slug: 'kb-draft', publicationState: 'draft', name: 'Draft' });
    await setDoc(doc(db, 'orders/order-1'), { customerUid: 'alice', status: 'pending', grandTotal: 1 });
    await setDoc(doc(db, 'users/alice'), { displayName: 'Alice', role: 'customer' });
    await setDoc(doc(db, 'enquiries/enq-1'), { email: 'alice@example.com', status: 'new' });
    await setDoc(doc(db, 'documents/doc-1'), { customerUid: 'alice', title: 'Manual' });
  });
});

describe('default denial', () => {
  it('blocks unauthenticated access to non-public data', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    // Draft products are not public.
    await assertFails(getDoc(doc(db, 'products/prod-2')));
    // Client-side writes are denied everywhere by default.
    await assertFails(setDoc(doc(db, 'orders/order-x'), { any: 'thing' }));
    await assertFails(getDoc(doc(db, 'auditEvents/audit-1')));
    await assertFails(getDoc(doc(db, 'mailOutbox/mail-1')));
    await assertFails(getDoc(doc(db, 'idempotencyKeys/key-1')));
  });

  it('blocks client access to Worker-only collections', async () => {
    const admin = staff('admin-1', 'admin').firestore();
    for (const col of ['auditEvents', 'mailOutbox', 'idempotencyKeys']) {
      await assertFails(getDocs(collection(admin, col)));
    }
  });
});

describe('catalog reads', () => {
  it('lets anyone read published products', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, 'products/prod-1')));
  });

  it('blocks unauthenticated reads of draft products', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'products/prod-2')));
  });

  it('lets staff read draft products', async () => {
    const db = staff('ed-1', 'editor').firestore();
    await assertSucceeds(getDoc(doc(db, 'products/prod-2')));
  });
});

describe('catalog writes', () => {
  it('lets editors create products without touching publicationState', async () => {
    const db = staff('ed-1', 'editor').firestore();
    await assertSucceeds(
      setDoc(doc(db, 'products/prod-new'), { slug: 'kb-new', name: 'New', publicationState: 'draft' }),
    );
  });

  it('blocks editors from publishing (Worker-only transition)', async () => {
    const db = staff('ed-1', 'editor').firestore();
    // prod-2 is a draft; flipping it to published is a real state change.
    await assertFails(updateDoc(doc(db, 'products/prod-2'), { publicationState: 'published' }));
    // Archiving a published product is likewise a protected transition.
    await assertFails(updateDoc(doc(db, 'products/prod-1'), { publicationState: 'archived' }));
  });

  it('blocks editors from deleting products', async () => {
    const db = staff('ed-1', 'editor').firestore();
    await assertFails(deleteDoc(doc(db, 'products/prod-1')));
  });

  it('lets admins delete products', async () => {
    const db = staff('admin-1', 'admin').firestore();
    await assertSucceeds(deleteDoc(doc(db, 'products/prod-2')));
  });
});

describe('orders ownership', () => {
  it('lets the owning customer read their order', async () => {
    const db = alice('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'orders/order-1')));
  });

  it('blocks other customers from reading the order', async () => {
    const db = alice('mallory').firestore();
    await assertFails(getDoc(doc(db, 'orders/order-1')));
  });

  it('blocks customers from creating orders directly (Worker-only)', async () => {
    const db = alice('alice').firestore();
    await assertFails(setDoc(doc(db, 'orders/order-2'), { customerUid: 'alice', status: 'pending' }));
  });

  it('blocks customers from changing order status', async () => {
    const db = alice('alice').firestore();
    await assertFails(updateDoc(doc(db, 'orders/order-1'), { status: 'delivered' }));
  });

  it('lets operations progress orders', async () => {
    const db = staff('ops-1', 'operations').firestore();
    await assertSucceeds(updateDoc(doc(db, 'orders/order-1'), { status: 'confirmed' }));
  });

  it('restricts customer order listing to their own uid', async () => {
    const db = alice('alice').firestore();
    await assertSucceeds(
      getDocs(query(collection(db, 'orders'), where('customerUid', '==', 'alice'))),
    );
    // A customer cannot list another user's orders.
    await assertFails(
      getDocs(query(collection(db, 'orders'), where('customerUid', '==', 'someone-else'))),
    );
  });
});

describe('users profile', () => {
  it('lets a user read their own profile and edit display fields only', async () => {
    const db = alice('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'users/alice')));
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { displayName: 'Alice B' }));
  });

  it('blocks a user from granting themselves a role', async () => {
    const db = alice('alice').firestore();
    await assertFails(updateDoc(doc(db, 'users/alice'), { role: 'admin' }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { status: 'suspended' }));
  });

  it('blocks reading other users profiles as a customer', async () => {
    const db = alice('mallory').firestore();
    await assertFails(getDoc(doc(db, 'users/alice')));
  });
});

describe('enquiries ownership', () => {
  it('lets the enquiry email owner read the enquiry after verification', async () => {
    const db = alice('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'enquiries/enq-1')));
  });

  it('blocks unverified or mismatched email reads', async () => {
    const ctx = testEnv.authenticatedContext('bob', {
      email: 'bob@example.com',
      email_verified: false,
    });
    await assertFails(getDoc(doc(ctx.firestore(), 'enquiries/enq-1')));
  });

  it('blocks customers from creating enquiries directly (Worker intake only)', async () => {
    const db = alice('alice').firestore();
    await assertFails(setDoc(doc(db, 'enquiries/enq-2'), { email: 'alice@example.com' }));
  });
});

describe('documents ownership', () => {
  it('lets the owning customer read the document record', async () => {
    const db = alice('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'documents/doc-1')));
  });

  it('blocks other customers from reading the document record', async () => {
    const db = alice('mallory').firestore();
    await assertFails(getDoc(doc(db, 'documents/doc-1')));
  });

  it('lets operations manage documents', async () => {
    const db = staff('ops-1', 'operations').firestore();
    await assertSucceeds(
      setDoc(doc(db, 'documents/doc-2'), { customerUid: 'alice', title: 'Warranty', objectKey: 'documents/2026/09/x.pdf' }),
    );
  });
});
