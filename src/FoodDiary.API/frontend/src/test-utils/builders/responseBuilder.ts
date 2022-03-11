export interface TestResponseBuilder {
  please: () => Response;

  withJsonData: <TData>(data: TData) => TestResponseBuilder;
}

type ResponseBuilderProps = Partial<Pick<Response, 'json'>>;

export default function createResponseBuilder() {
  const props: ResponseBuilderProps = {};

  const builder: TestResponseBuilder = {
    please: (): Response => {
      return {
        ...new Response(),
        ...props,
      };
    },

    withJsonData: <TData>(data: TData): TestResponseBuilder => {
      props.json = jest.fn().mockResolvedValue(data);
      return builder;
    },
  };

  return builder;
}
