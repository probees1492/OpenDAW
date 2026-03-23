/**
 * Base class for all Actors in the audio engine.
 *
 * Implements the Actor pattern with:
 * - Mailbox-based message queue
 * - Sequential message processing
 * - Async message handling
 *
 * This ensures:
 * - No re-entrancy issues (messages processed one at a time)
 * - Thread-safe state mutations (only one handler runs at a time)
 * - Testable message-based interface
 */
export abstract class Actor<TMessage> {
  private mailbox: TMessage[] = [];
  private processing = false;
  private disposed = false;

  /**
   * Sends a message to this actor's mailbox.
   * Messages are processed sequentially in FIFO order.
   */
  send(message: TMessage): void {
    if (this.disposed) {
      console.warn(`${this.constructor.name}: Message sent to disposed actor`);
      return;
    }

    this.mailbox.push(message);
    this.processQueue();
  }

  /**
   * Processes messages in the mailbox sequentially.
   * Only one message is processed at a time.
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.mailbox.length === 0 || this.disposed) {
      return;
    }

    this.processing = true;

    try {
      while (this.mailbox.length > 0 && !this.disposed) {
        const message = this.mailbox.shift()!;
        await this.handle(message);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Handles a single message. Subclasses implement this.
   */
  protected abstract handle(message: TMessage): Promise<void> | void;

  /**
   * Disposes the actor, stopping message processing.
   */
  dispose(): void {
    this.disposed = true;
    this.mailbox = [];
  }

  /**
   * Returns true if the actor has been disposed.
   */
  isDisposed(): boolean {
    return this.disposed;
  }
}
