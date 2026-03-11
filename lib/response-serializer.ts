export function sanitizeUserResponse(user: Record<string, unknown>): Record<string, unknown> {
  const { oneMoneyCustomerId, clerkUserId, ...rest } = user;

  if (Array.isArray(rest.associatedPersons)) {
    rest.associatedPersons = rest.associatedPersons.map((person: Record<string, unknown>) => {
      if (Array.isArray(person.identifyingDocuments)) {
        return {
          ...person,
          identifyingDocuments: person.identifyingDocuments.map(
            ({ imageFrontUrl, imageBackUrl, ...doc }: Record<string, unknown>) => doc,
          ),
        };
      }
      return person;
    });
  }

  return rest;
}
