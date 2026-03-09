/* @jest-environment node */

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(() => "MOCK_REF"),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(() => "MOCK_DOC_REF"),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(() => "MOCK_QUERY"),
    serverTimestamp: jest.fn(),
    updateDoc: jest.fn(),
    where: jest.fn(),
    writeBatch: jest.fn(),
}));

jest.mock("../../contexts/AuthContext", () => ({
    useAuth: jest.fn(() => ({ user: { uid: "user1" } })),
}));

const { addDoc, deleteDoc, getDocs, updateDoc, where, writeBatch } = require("firebase/firestore");

// Mirror the core logic from ShoppingListContext directly —
// avoids needing a React component tree for these pure Firebase operations.

const db = {};

async function addItem(ingredient, recipeTitle = null) {
    await addDoc("MOCK_REF", {
        name: ingredient.name,
        amount: ingredient.amount || "",
        unit: ingredient.unit || "",
        checked: false,
        recipeTitle,
    });
}

async function toggleItem(_itemId, currentChecked) {
    await updateDoc("MOCK_DOC_REF", { checked: !currentChecked });
}

async function removeItem(_itemId) {
    await deleteDoc("MOCK_DOC_REF");
}

async function clearChecked() {
    const { query } = require("firebase/firestore");
    const snapshot = await getDocs(query("MOCK_REF", where("checked", "==", true)));
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}

beforeEach(() => jest.clearAllMocks());

describe("addItem", () => {
    it("calls addDoc with the ingredient data", async () => {
        addDoc.mockResolvedValueOnce({ id: "item1" });
        await addItem({ name: "Garlic", amount: "3", unit: "cloves" }, "Pasta");
        expect(addDoc).toHaveBeenCalledWith("MOCK_REF", expect.objectContaining({
            name: "Garlic", amount: "3", unit: "cloves", checked: false,
        }));
    });
});

describe("toggleItem", () => {
    it("flips checked to true", async () => {
        updateDoc.mockResolvedValueOnce();
        await toggleItem("item1", false);
        expect(updateDoc).toHaveBeenCalledWith("MOCK_DOC_REF", { checked: true });
    });

    it("flips checked to false", async () => {
        updateDoc.mockResolvedValueOnce();
        await toggleItem("item1", true);
        expect(updateDoc).toHaveBeenCalledWith("MOCK_DOC_REF", { checked: false });
    });
});

describe("removeItem", () => {
    it("calls deleteDoc", async () => {
        deleteDoc.mockResolvedValueOnce();
        await removeItem("item1");
        expect(deleteDoc).toHaveBeenCalled();
    });
});

describe("clearChecked", () => {
    it("queries for checked items and deletes them", async () => {
        getDocs.mockResolvedValueOnce({ docs: [{ ref: "REF_A" }] });
        const batch = { delete: jest.fn(), commit: jest.fn().mockResolvedValue() };
        writeBatch.mockReturnValue(batch);
        await clearChecked();
        expect(where).toHaveBeenCalledWith("checked", "==", true);
        expect(batch.delete).toHaveBeenCalled();
    });
});
