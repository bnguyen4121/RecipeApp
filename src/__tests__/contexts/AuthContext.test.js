import { auth, db } from "../../services/firebase";

async function signIn(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signUp(email, password, displayName) {
    try {
        const { user: newUser } = await auth.createUserWithEmailAndPassword(email, password);
        await newUser.updateProfile({ displayName });
        await db.collection("users").doc(newUser.uid).set({ displayName, email, dietaryPreferences: [] });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

beforeEach(() => jest.clearAllMocks());

describe("signIn", () => {
    it("returns success:true on valid credentials", async () => {
        auth.signInWithEmailAndPassword.mockResolvedValueOnce({});
        const result = await signIn("a@b.com", "pass");
        expect(result).toEqual({ success: true });
    });

    it("returns success:false with error on bad credentials", async () => {
        auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Wrong password"));
        const result = await signIn("a@b.com", "wrong");
        expect(result).toEqual({ success: false, error: "Wrong password" });
    });
});

describe("signUp", () => {
    it("returns success:true and writes Firestore doc", async () => {
        const mockUser = { uid: "uid1", updateProfile: jest.fn().mockResolvedValue() };
        auth.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
        db.collection().doc().set.mockResolvedValueOnce();
        const result = await signUp("new@b.com", "pass", "Alice");
        expect(db.collection().doc().set).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
    });

    it("returns success:false on Firebase error", async () => {
        auth.createUserWithEmailAndPassword.mockRejectedValueOnce(new Error("Email in use"));
        const result = await signUp("x@b.com", "pass", "Bob");
        expect(result).toEqual({ success: false, error: "Email in use" });
    });
});

describe("signOut", () => {
    it("returns success:true", async () => {
        auth.signOut.mockResolvedValueOnce();
        const result = await signOut();
        expect(result).toEqual({ success: true });
    });
});
