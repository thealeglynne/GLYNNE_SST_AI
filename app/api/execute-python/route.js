import { NextResponse } from 'next/server';
import { spawnSync } from 'child_process';

export async function POST(req) {
  const { code } = await req.json();

  try {
    const result = spawnSync('python3', ['-c', code], {
      encoding: 'utf-8',
    });

    return NextResponse.json({
      output: result.stdout || result.stderr || 'Sin salida',
    });
  } catch (err) {
    return NextResponse.json({ output: err.message });
  }
}
