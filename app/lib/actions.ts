'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// Invoice
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  // Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// Quote
const FormSchemaQuote = z.object({
  quoteID: z.string(),
  quoteCode: z.string(),
  effectiveDate: z.string(),
});
 
const CreateQuote = FormSchemaQuote.omit({});
 
export async function createQuote(formData: FormData) {
    const { quoteID, quoteCode, effectiveDate } = CreateQuote.parse({
      quoteID: formData.get('quoteID'),
      quoteCode: formData.get('quoteCode'),
      effectiveDate: formData.get('effectiveDate'),
    });

    try {
      await sql`
        INSERT INTO quotes (id, quoteCode, effectiveDate)
        VALUES (${quoteID}, ${quoteCode}, ${effectiveDate})
      `;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Quote.',
      };
    }

    revalidatePath('/dashboard/quotes');
    redirect('/dashboard/quotes');
  }

  // Use Zod to update the expected types
const UpdateQuote = FormSchemaQuote.omit({});
 
// ...
 
export async function updateQuote(id: string, formData: FormData) {
  console.log('id: ', id);
  console.log('formData: ', formData);
  const { quoteID, quoteCode, effectiveDate } = UpdateQuote.parse({
    quoteID: formData.get('quoteID'),
    quoteCode: formData.get('quoteCode'),
    effectiveDate: formData.get('effectiveDate'),
  });
  console.log('quoteID: ', quoteID);
  console.log('quoteCode: ', quoteCode);
  console.log('effectiveDate: ', effectiveDate);
  
  try {
    await sql`
        UPDATE quotes
        SET quotecode = ${quoteCode}, effectiveDate = ${effectiveDate}
        WHERE id = ${quoteID}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Quote.' };
  }
 
  revalidatePath('/dashboard/quotes');
  redirect('/dashboard/quotes?updated=1');
}

export async function deleteQuote(id: string) {
  try {
    await sql`DELETE FROM quotes WHERE id = ${id}`;
    revalidatePath('/dashboard/quotes');
    return { message: 'Deleted Quote.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Quote.' };
  }
}
