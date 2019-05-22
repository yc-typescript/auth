export class Auth {
  public JWT_KEY = '__jwt';

  private __jwt?: string;
  private __as?: AuthStorage;
  private __decoder?: AuthDecoder;
  private __ready?: Promise<void>;
  private __onSignjwt: Array<() => Promise<void>> = [];
  private __onSignout: Array<() => Promise<void>> = [];
  private __interval = 0;


  public async setup(ac: AuthConfig) {
    this.__as = ac.storage;
    this.__decoder = ac.decoder;
    this.__ready = this.readStorage();
    await this.__ready;
  }

  public ready() {
    return this.__ready;
  }

  public async signJwt(jwt: string): Promise<any> {
    this.__jwt = jwt;
    const res = await this.__as!.set(this.JWT_KEY, jwt);
    for (const fn of this.__onSignjwt)
      await fn();
    return res;
  }

  public hasRoles(...roles: string[]): boolean {
    const info = this.info;
    if (!info) return false;
    for (const role of roles) {
      if (!info.roles.includes(role)) return false;
    }
    return true;
  }

  public async signout(): Promise<void> {
    delete this.__jwt;
    await this.__as!.delete(this.JWT_KEY);
    for (const fn of this.__onSignout)
      await fn();
  }

  public onSignjwt(fn: () => Promise<void>) {
    this.__onSignjwt.push(fn);
  }

  public onSignout(fn: () => Promise<void>) {
    this.__onSignout.push(fn);
  }

  public offSignjwt(fn: () => Promise<void>) {
    const i = this.__onSignjwt.indexOf(fn);
    if (~i) this.__onSignjwt.splice(i, 1);
  }

  public offSignout(fn: () => Promise<void>) {
    const i = this.__onSignout.indexOf(fn);
    if (~i) this.__onSignout.splice(i, 1);
  }

  public enableCheckExp(interval: number, fn?: () => Promise<void>) {
    this.__interval = interval;
    this.check(fn);
  }

  private async readStorage() {
    const jwt = await this.__as!.get(this.JWT_KEY);
    if (jwt && jwt !== 'null') {
      this.__jwt = jwt;
    }
  }

  private async check(fn?: () => Promise<void>) {
    if (!this.__interval) return;
    const cb = fn || (() => this.signout());
    if (this.__jwt && !this.info)
      await cb();
    setTimeout(() => {
      this.check(fn);
    }, this.__interval);
  }

  get jwt(): string {
    return this.__jwt!;
  }

  get isAuthenticated(): boolean {
    return !!this.info;
  }

  get info(): AuthInfo | null {
    if (!this.__jwt) return null;
    const decoded: any = this.__decoder!(this.__jwt);
    const now = new Date().getTime();
    if (now < decoded.exp * 1000) {
      return decoded;
    }
    return null;
  }
}

export interface AuthConfig {
  storage: AuthStorage;
  decoder: AuthDecoder;
}

export type AuthDecoder = (jwt: string) => AuthInfo;

export interface AuthStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<any>;
  delete(key: string): Promise<any>;
  clear(): Promise<any>;
}

export interface AuthInfo {
  _id: string;
  roles: string[];
  username: string;
  providers: Array<{
    name: string;
    openid: string;
  }>;
};