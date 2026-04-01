import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  const pathParams = await params;
  const path = pathParams.path.join('/');
  const url = `${API_BASE_URL}/${path}`;
  const res = await fetch(url, {
    headers: Object.fromEntries(request.headers),
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: res.headers,
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  const pathParams = await params;
  const path = pathParams.path.join('/');
  const url = `${API_BASE_URL}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: Object.fromEntries(request.headers),
    body: await request.text(),
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: res.headers,
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  const pathParams = await params;
  const path = pathParams.path.join('/');
  const url = `${API_BASE_URL}/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: Object.fromEntries(request.headers),
    body: await request.text(),
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: res.headers,
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  const pathParams = await params;
  const path = pathParams.path.join('/');
  const url = `${API_BASE_URL}/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: Object.fromEntries(request.headers),
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: res.headers,
  });
}
