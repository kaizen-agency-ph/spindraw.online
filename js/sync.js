// Control panel ⇄ overlay messaging, no backend of our own.
// BroadcastChannel covers tabs/popups in the same browser. OBS browser sources run
// in their own process, so a PeerJS (WebRTC) relay carries the same messages there.

export class Channel {
  constructor(room, role, onMessage, onStatus = () => {}) {
    this.room = room;
    this.role = role;
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.id = Math.random().toString(36).slice(2);
    this.seq = 0;
    this.seen = new Map();
    this.conns = new Set();
    this.relay = 'off';
    try {
      this.bc = new BroadcastChannel(`spindraw:${room}`);
      this.bc.onmessage = e => this.receive(e.data);
    } catch { this.bc = null; }
    if (window.Peer && !new URLSearchParams(location.search).has('norelay')) this.startRelay();
    this.status();
  }

  send(type, data = {}) {
    const msg = { type, data, from: this.id, seq: ++this.seq };
    this.bc?.postMessage(msg);
    for (const c of this.conns) if (c.open) c.send(msg);
  }

  // Same message may arrive over both paths; keep the first.
  receive(msg) {
    if (!msg || msg.from === this.id) return;
    if (msg.seq <= (this.seen.get(msg.from) || 0)) return;
    this.seen.set(msg.from, msg.seq);
    this.onMessage(msg.type, msg.data, msg.from);
  }

  status() {
    this.onStatus({ local: !!this.bc, relay: this.relay, peers: this.conns.size });
  }

  startRelay() {
    const hostId = `spindraw-${this.room}`;
    this.relay = 'connecting';
    if (this.role === 'host') {
      const claim = () => {
        const peer = this.peer = new Peer(hostId);
        peer.on('open', () => { this.relay = 'online'; this.status(); });
        peer.on('connection', c => {
          c.on('open', () => { this.conns.add(c); this.status(); });
          c.on('data', m => this.receive(m));
          c.on('close', () => { this.conns.delete(c); this.status(); });
        });
        peer.on('disconnected', () => setTimeout(() => !peer.destroyed && peer.reconnect(), 2000));
        peer.on('error', e => {
          if (e.type === 'unavailable-id') {
            // Another control tab owns the room, or the server still holds the
            // id from before a refresh. Keep retrying so a refresh mid-stream recovers.
            this.relay = 'room in use';
            peer.destroy();
            setTimeout(claim, 5000);
          } else this.relay = 'offline';
          this.status();
        });
      };
      claim();
    } else {
      this.peer = new Peer();
      this.peer.on('open', () => this.connect(hostId));
      this.peer.on('error', e => {
        if (e.type === 'peer-unavailable') this.retry(hostId);
        else { this.relay = 'offline'; this.status(); }
      });
      this.peer.on('disconnected', () => setTimeout(() => !this.peer.destroyed && this.peer.reconnect(), 2000));
    }
  }

  connect(hostId) {
    const c = this.peer.connect(hostId, { reliable: true });
    c.on('open', () => {
      this.conns.clear();
      this.conns.add(c);
      this.relay = 'online';
      this.status();
      this.send('hello');
    });
    c.on('data', m => this.receive(m));
    c.on('close', () => { this.conns.delete(c); this.relay = 'connecting'; this.status(); this.retry(hostId); });
  }

  retry(hostId) {
    if (this.retrying) return;
    this.retrying = true;
    setTimeout(() => { this.retrying = false; if (this.peer.open) this.connect(hostId); }, 3000);
  }
}
