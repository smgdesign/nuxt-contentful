// A little caching setup to reduce calls to contentful - extend with redis for better persistence
import { Cms } from "./ContentTypes";

export interface CacheItem<T> {
  stored: Date;
  expires: Date;
  value: T;
  expired: boolean;
}
export class Cache {
  protected CacheStore: Record<string, CacheItem<Cms>> = {};
  protected Regenerate: Date = new Date();
  protected Ttl: number = 120;

  private CalcTTL(now: Date): Date {
    now.setTime(now.getTime() + this.Ttl * 1000);
    return now;
  }

  SetTTL(ttl: number): void {
    this.Ttl = ttl;
  }

  Set<T>(key: string, value: T): CacheItem<T> {
    const stored = new Date();
    this.CacheStore[key] = {
      stored,
      expired: false,
      expires: this.CalcTTL(stored),
      value: Object.assign({}, value),
    };
    return this.CacheStore[key] as CacheItem<T>;
  }

  Get<T>(key: string): CacheItem<T> {
    if (!this.CacheStore[key]) {
      throw new Error(`Cache Not found for ${key}`);
    }
    this.CacheStore[key].expired =
      this.CacheStore[key].stored < this.Regenerate ||
      this.CacheStore[key].expires < new Date();
    if (this.CacheStore[key].expired) {
      delete this.CacheStore[key];
      throw new Error(`Cache Expired for ${key}`);
    }
    return this.CacheStore[key] as CacheItem<T>;
  }

  SetRegenerate(): void {
    this.Regenerate = new Date();
  }
}
