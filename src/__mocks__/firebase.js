// Chainable doc ref — supports get/set/update/delete and subcollections
const docRef = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

// Chainable collection/query ref — all query methods return itself
const chain = {
    get: jest.fn(),
    add: jest.fn(),
    set: jest.fn(),
    where: jest.fn(() => chain),
    orderBy: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    startAfter: jest.fn(() => chain),
    onSnapshot: jest.fn(),
    doc: jest.fn(() => docRef),
};

// Allow subcollections off a doc ref
docRef.collection = jest.fn(() => chain);

const batchMock = {
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(),
};

export const auth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()),
};

export const db = {
    collection: jest.fn(() => chain),
    batch: jest.fn(() => batchMock),
    runTransaction: jest.fn(),
};

export const storage = {};

export const FieldValue = {
    serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
};
