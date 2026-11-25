import { test } from 'node:test';
import assert from 'node:assert';
import { 
    validateUsernameAndPassword, 
    hashPassword, 
    comparePassword, 
    createToken 
} from '../auth.js';

// 1. בדיקות לוולידציה
test('validateUsernameAndPassword: returns username and password when valid', () => {
    const result = validateUsernameAndPassword({ 
        username: 'dana', 
        password: 'password123' 
    });
    assert.deepStrictEqual(result, { username: 'dana', password: 'password123' });
});

test('validateUsernameAndPassword: throws error if fields are missing', () => {
    assert.throws(
        () => validateUsernameAndPassword({ username: 'dana' }),
        { message: 'USERNAME_PASSWORD_REQUIRED' }
    );
});

test('validateUsernameAndPassword: throws error if password is too short', () => {
    assert.throws(
        () => validateUsernameAndPassword({ username: 'dana', password: '123' }),
        { message: 'PASSWORD_TOO_SHORT' }
    );
});

// 2. בדיקות להצפנה והשוואת סיסמה
test('hashPassword & comparePassword: hashes and verifies correctly', async () => {
    const plainPassword = 'mySecretPassword';
    const hashed = await hashPassword(plainPassword);

    assert.notStrictEqual(hashed, plainPassword);
    assert.strictEqual(await comparePassword(plainPassword, hashed), true);
    assert.strictEqual(await comparePassword('wrongPassword', hashed), false);
});

// 3. בדיקה ליצירת טוקן
test('createToken: creates a valid 3-part JWT string', () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'user' };
    const token = createToken(mockUser);

    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.split('.').length, 3);
});