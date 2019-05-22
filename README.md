[![Build Status](https://travis-ci.org/yc-typescript/auth.svg?branch=master)](https://travis-ci.org/yc-typescript/auth.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/yc-typescript/auth/badge.svg?branch=master)](https://coveralls.io/github/yc-typescript/auth?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# @yca/auth

## Installation
```
 npm i -S @yct/auth
```

## Setup storage and decoder

```ts
import { Auth } from '@yct/auth';
import * as jwt from 'jsonwebtoken';

const auth = new Auth();
auth.setup({
  storage: {
    get: x => Promise.resolve(localStorage.getItem(x)),
    set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    delete: x => Promise.resolve(localStorage.removeItem(x)),
    clear: () => Promise.resolve(localStorage.clear()),
  },
  decoder: jwt.decode as any
});
```

## Methods and Properties
```ts
setup(ac: AuthConfig): Promise<void>;
ready() Promise<void>;
signJwt(jwt: string): Promise<void>;
signout(): Promise<void>;

hasRoles(...roles: string[]): boolean;

onSignjwt(fn: () => Promise<void>): void;
onSignout(fn: () => Promise<void>): void;
offSignjwt(fn: () => Promise<void>): void;
offSignout(fn: () => Promise<void>): void;

enableCheckExp(interval: number, fn?: () => Promise<void>): void;

get jwt(): string;
get isAuthenticated(): boolean;
get info(): AuthInfo | null;
```

## Interfaces and Types
```ts
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
}
```