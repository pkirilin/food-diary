import { BadRequestResponse } from '../models';

type BadRequestResponseObject = {
  [key: string]: string[];
};

function parseBadRequestResponseObject(responseObj: BadRequestResponseObject): BadRequestResponse {
  const errors = new Map<string, Array<string>>();

  if (responseObj) {
    Object.keys(responseObj).forEach(errorKey => {
      errors.set(errorKey, responseObj[errorKey]);
    });
  }

  return { errors };
}

function getAllBadRequestErrorMessages(badRequestErrors: Map<string, Array<string>>): string[] {
  const allErrorMessages: string[] = [];
  badRequestErrors.forEach(errorMessages => {
    errorMessages.forEach(errorMessage => {
      allErrorMessages.push(errorMessage);
    });
  });
  return allErrorMessages;
}

export async function readBadRequestResponseAsync(response: Response): Promise<string> {
  const responseObj = await response.json();
  let badRequestResponse: BadRequestResponse;

  if (responseObj['errors']) {
    badRequestResponse = parseBadRequestResponseObject(responseObj['errors']);
  } else {
    badRequestResponse = parseBadRequestResponseObject(responseObj);
  }

  if (badRequestResponse.errors.size > 0) {
    const allErrorMessages = getAllBadRequestErrorMessages(badRequestResponse.errors);
    return allErrorMessages.join('. ');
  }

  return 'Wrong request data';
}
