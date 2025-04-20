// Completely replacing NextAuth with Clerk
// Provide empty handlers to prevent errors

export async function GET() {
  return new Response('Authentication is handled by Clerk', { status: 200 });
}

export async function POST() {
  return new Response('Authentication is handled by Clerk', { status: 200 });
}
