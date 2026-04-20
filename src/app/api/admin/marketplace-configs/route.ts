import { NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api.server';

export async function GET() {
  try {
    const data = await serverFetch('/admin/marketplace-configs');
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ message }, { status: 401 });
  }
}
