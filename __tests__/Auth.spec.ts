import * as jwt from 'jsonwebtoken';

import { Auth } from '../src';

describe('AuthModule', () => {
  let auth: Auth;

  beforeEach(async () => {
    auth = new Auth();
    auth.setup({
      storage: {
        get: x => Promise.resolve(localStorage.getItem(x)),
        set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
        delete: x => Promise.resolve(localStorage.removeItem(x)),
        clear: () => Promise.resolve(localStorage.clear())
      },
      decoder: jwt.decode as any
    });
    await auth.ready();
  });

  it('Should be defined', () => {
    expect(auth).toBeDefined();
  });

  it('Should be not authenticated', () => {
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.hasRoles('user')).toBe(false);
    expect(auth.info).toBe(null);
    expect(auth.jwt).toBeFalsy();
  });

  it('Should be authenticated', () => {
    const token = jwt.sign({
      username: 'tom',
      roles: ['admin', 'user']
    }, 'secret', { expiresIn: '1m' });
    auth.signJwt(token);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.info).toBeTruthy();
    expect(auth.jwt).toBeTruthy();
  });

  it('Should have role admin', () => {
    expect(auth.hasRoles('admin')).toBe(true);
  });

  it('Should not have role super', () => {
    expect(auth.hasRoles('super')).toBe(false);
  });

  it('Should be expired', () => {
    const token = jwt.sign({
      username: 'tom',
      roles: ['admin', 'user']
    }, 'secret', { expiresIn: '0s' });
    auth.signJwt(token);
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.info).toBe(null);
  });

  it('Should signout', async () => {
    const token = jwt.sign({
      username: 'tom',
      roles: ['admin', 'user']
    }, 'secret', { expiresIn: '1m' });
    auth.signJwt(token);
    await auth.signout();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.info).toBe(null);
    expect(auth.jwt).toBeFalsy();
  });

  it('Should exec event handler', async () => {
    const token = jwt.sign({
      username: 'tom',
      roles: ['admin', 'user']
    }, 'secret', { expiresIn: '1m' });
    let handleOnSignjwt = false;
    let handleOnSignout = false;
    auth.onSignjwt(async () => {
      handleOnSignjwt = true;
    });
    auth.onSignout(async () => {
      handleOnSignout = true;
    });
    auth.signJwt(token);
    await auth.signout();
    expect(handleOnSignjwt).toBe(true);
    expect(handleOnSignout).toBe(true);
  });

  it('Should not exec event handler', async () => {
    const token = jwt.sign({
      username: 'tom',
      roles: ['admin', 'user']
    }, 'secret', { expiresIn: '1m' });
    let handleOnSignjwt = false;
    let handleOnSignout = false;
    const fnOnSignjwt = async () => {
      handleOnSignjwt = true;
    };
    const fnOnSignout = async () => {
      handleOnSignout = true;
    };
    auth.onSignjwt(fnOnSignjwt);
    auth.onSignout(fnOnSignout);
    auth.offSignjwt(fnOnSignjwt);
    auth.offSignout(fnOnSignout);
    auth.offSignjwt(fnOnSignjwt);
    auth.offSignout(fnOnSignout);
    auth.signJwt(token);
    await auth.signout();
    expect(handleOnSignjwt).toBe(false);
    expect(handleOnSignout).toBe(false);
  });
});
