import {
  Mountebank,
  Imposter,
  HttpMethod,
  Stub,
  EqualPredicate,
  Response,
} from '@anev/ts-mountebank';

const PORT = 2126;

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    Hello world!
</body>
</html>
`;

export class FakeAuthProvider {
  private readonly _mountebank = new Mountebank().withURL('http://localhost:2125');
  private readonly _imposter = new Imposter().withPort(PORT);

  public async setup(): Promise<void> {
    const authorizeStub = new Stub()
      .withPredicate(new EqualPredicate().withMethod(HttpMethod.GET).withPath('/authorize'))
      .withResponse(
        new Response().withStatusCode(200).withHeader('Content-Type', 'text/html').withBody(HTML),
      );

    await this._mountebank.createImposter(this._imposter.withStub(authorizeStub));
  }

  public async teardown(): Promise<void> {
    await this._mountebank.deleteImposter(PORT);
  }
}
