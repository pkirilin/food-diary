import { type DbMcpConsentRequest, db } from '../db';

export const create = (consentRequest: Omit<DbMcpConsentRequest, 'id'>): string => {
  const id = crypto.randomUUID();
  db.mcpConsentRequest.create({ id, ...consentRequest });
  return id;
};

export const find = (id: string): DbMcpConsentRequest | null =>
  db.mcpConsentRequest.findFirst({
    where: { id: { equals: id } },
  });

export const redeem = (id: string): DbMcpConsentRequest | null =>
  db.mcpConsentRequest.delete({
    where: { id: { equals: id } },
  });
