export class ChatState {
  constructor(id, user, readTimestamp, unreads, total) {
    this.id = id;
    this.user = user;
    this.readTimestamp = readTimestamp;

    this.msgTimestamps = [...unreads];
    this.total = total;
  }

  get unreadCount() {
    return this.msgTimestamps.length;
  }

  onSSEChatMessagePosted(payload) {
    this.total++;
    const messageTimestamp = new Date(payload.date).getTime();
    if (
      payload.user._id !== this.user._id &&
      messageTimestamp > this.readTimestamp
    ) {
      this.msgTimestamps.push(messageTimestamp);
    }
  }

  onSSEChatMessageLastSeenPointerUpdated(payload) {
    this.readTimestamp = Math.max(this.readTimestamp, payload.ts);
    this.msgTimestamps = this.msgTimestamps.filter((ts) => ts > payload.ts);
  }
}
