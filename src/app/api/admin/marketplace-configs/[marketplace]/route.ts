import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api.server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ marketplace: string }> },
) {
  try {
    const { marketplace } = await params;
    const body = await req.json();
    const data = await serverFetch(`/admin/marketplace-configs/${marketplace}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
