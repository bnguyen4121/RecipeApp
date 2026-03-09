jest.mock("firebase/auth", () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(() => "MOCK_DOC_REF"),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
    updateDoc: jest.fn(),
}));

const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut: firebaseSignOut,
    updateProfile,
} = require("firebase/auth");

const { setDoc } = require("firebase/firestore");

async function signIn(email, password) {
    try {
        await signInWithEmailAndPassword({}, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signUp(email, password, displayName) {
    try {
        const { user: newUser } = await createUserWithEmailAndPassword({}, email, password);
        await updateProfile(newUser, { displayName });
        await setDoc("MOCK_DOC_REF", { displayName, email, dietaryPreferences: [] });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        await firebaseSignOut({});
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

beforeEach(() => jest.clearAllMocks());

describe("signIn", () => {
    it("returns success:true on valid credentials", async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({});
        const result = await signIn("a@b.com", "pass");
        expect(result).toEqual({ success: true });
    });

    it("returns success:false with error on bad credentials", async () => {
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Wrong password"));
        const result = await signIn("a@b.com", "wrong");
        expect(result).toEqual({ success: false, error: "Wrong password" });
    });
});

describe("signUp", () => {
    it("returns success:true and writes Firestore doc", async () => {
        const mockUser = { uid: "uid1" };
        createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
        updateProfile.mockResolvedValueOnce();
        setDoc.mockResolvedValueOnce();
        const result = await signUp("new@b.com", "pass", "Alice");
        expect(setDoc).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
    });

    it("returns success:false on Firebase error", async () => {
        createUserWithEmailAndPassword.mockRejectedValueOnce(new Error("Email in use"));
        const result = await signUp("x@b.com", "pass", "Bob");
        expect(result).toEqual({ success: false, error: "Email in use" });
    });
});

describe("signOut", () => {
    it("returns success:true", async () => {
        firebaseSignOut.mockResolvedValueOnce();
        const result = await signOut();
        expect(result).toEqual({ success: true });
    });
});
