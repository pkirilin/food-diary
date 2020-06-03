import { BadRequestResponse } from '../models';

/**
 * Represents type for bad request response received from server
 */
type BadRequestResponseObject = {
  [key: string]: string[];
};

/**
 * Converts bad request response object to BadRequestResponse model
 * @param responseObj Bad request response object
 */
function parseBadRequestResponseObject(responseObj: BadRequestResponseObject): BadRequestResponse {
  const errors = new Map<string, Array<string>>();

  if (responseObj) {
    Object.keys(responseObj).forEach(errorKey => {
      errors.set(errorKey, responseObj[errorKey]);
    });
  }

  return { errors };
}

/**
 * Converts all error messages in dictionary to array
 * @param badRequestErrors Bad request errors dictionary
 */
function getAllBadRequestErrorMessages(badRequestErrors: Map<string, Array<string>>): string[] {
  const allErrorMessages: string[] = [];
  badRequestErrors.forEach(errorMessages => {
    errorMessages.forEach(errorMessage => {
      allErrorMessages.push(errorMessage);
    });
  });
  return allErrorMessages;
}

/**
 * Asynchronously parses bad request response and converts all received error messages to string
 * @param response Bad request response
 */
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
