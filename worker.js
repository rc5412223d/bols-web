export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    return new Response("ChatRoom OK");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 測試 Durable Object
    if (url.pathname === "/chat-test") {
      const id = env.CHAT_ROOM.idFromName("main");
      const room = env.CHAT_ROOM.get(id);

      return room.fetch(request);
    }

    return new Response("無垠伺服器登入與聊天服務正常運作。");
  }
};
