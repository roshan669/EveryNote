import { auth } from "@acme/auth";

export const runtime = 'nodejs';
const handler = auth.handler


export { handler as GET, handler as POST }
