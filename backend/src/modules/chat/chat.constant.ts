export const CHAT_CONSTANR = {
  CACHE_USER: (mainkey: string) => `user:${mainkey}`,
  CACHE_MESSAGE_ROOM: (mainkey: string) => `message_room:${mainkey}`,
  NAME_SOCKET_ROOM: (clientId: string, supportId: string) =>
    `${clientId}-${supportId}`,
};
