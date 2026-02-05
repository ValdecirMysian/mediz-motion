import { NextRequest, NextResponse } from 'next/server';
import { renderQueue } from '@/lib/renderQueue';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });
    }

    const job = renderQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const estimatedTime = renderQueue.getEstimatedTime(jobId);

    return NextResponse.json({
      success: true,
      job,
      estimatedTime
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}