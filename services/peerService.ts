
import { Peer, DataConnection } from 'peerjs';

export interface DuelMessage {
  type: 'INIT_QUIZ' | 'NEXT_READY' | 'PROGRESS' | 'FINISH';
  payload?: any;
}

export class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private onMessageCallback: ((data: DuelMessage, peerId: string) => void) | null = null;
  private onConnectionCallback: ((peerId: string) => void) | null = null;

  static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  init(id: string, onOpen: (id: string) => void, onError: (err: any) => void) {
    this.peer = new Peer(id, {
      debug: 1
    });

    this.peer.on('open', onOpen);
    this.peer.on('error', (err) => {
      console.error("PeerJS Error:", err);
      onError(err);
    });

    this.peer.on('connection', (conn) => {
      this.setupConnection(conn);
      this.onConnectionCallback?.(conn.peer);
    });
  }

  connect(hostId: string, onOpen: () => void, onError: (err: any) => void) {
    if (!this.peer) {
      this.peer = new Peer();
    }
    
    const conn = this.peer.connect(hostId);
    
    conn.on('open', () => {
      this.setupConnection(conn);
      onOpen();
    });

    conn.on('error', onError);
  }

  private setupConnection(conn: DataConnection) {
    conn.on('data', (data: any) => {
      this.onMessageCallback?.(data as DuelMessage, conn.peer);
    });
    
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  onMessage(callback: (data: DuelMessage, peerId: string) => void) {
    this.onMessageCallback = callback;
  }

  onConnection(callback: (peerId: string) => void) {
    this.onConnectionCallback = callback;
  }

  send(message: DuelMessage) {
    this.connections.forEach(conn => {
      if (conn.open) conn.send(message);
    });
  }

  destroy() {
    this.peer?.destroy();
    this.peer = null;
    this.connections.clear();
  }

  get id() { return this.peer?.id; }
  get hasConnection() { return this.connections.size > 0; }
}
