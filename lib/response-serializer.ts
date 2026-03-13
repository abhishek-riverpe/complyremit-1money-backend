export function sanitizeUserResponse(user: Record<string, unknown>): Record<string, unknown> {
  const { oneMoneyCustomerId, clerkUserId, ...rest } = user;

  if (Array.isArray(rest.associatedPersons)) {
    rest.associatedPersons = rest.associatedPersons.map(
      ({ docImageFrontUrl, docImageBackUrl, ...person }: Record<string, unknown>) => person,
    );
  }

  return rest;
}
