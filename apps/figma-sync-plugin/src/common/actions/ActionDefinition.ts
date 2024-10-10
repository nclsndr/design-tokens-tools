export type ActionRequest<Event extends string, ReqPayload> = {
  id: string;
  action: Event;
  payload: ReqPayload;
};

export type ActionResponse<
  Event extends string,
  ResPayload extends [any, any]
> = {
  id: string;
  action: Event;
  payload: [ResPayload[0] | undefined, ResPayload[1] | undefined];
};
