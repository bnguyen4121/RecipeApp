/* @jest-environment node */
import { addDoc, getDoc, getDocs } from "firebase/firestore";
import { deleteRecipe, getRecipeById, getRecipes, searchByIngredients, uploadRecipe } from "../../services/recipeService";

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(() => "MOCK_REF"),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(() => "MOCK_DOC_REF"),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    limit: jest.fn((n) => `limit(${n})`),
    orderBy: jest.fn(),
    query: jest.fn((...args) => args),
    runTransaction: jest.fn(),
    serverTimestamp: jest.fn(),
    startAfter: jest.fn(),
    where: jest.fn((f, op, v) => `where(${f}${op}${v})`),
}));

const makeSnapshot = (docs) => ({
    docs: docs.map((data, i) => ({ id: `id${i}`, data: () => data })),
});

beforeEach(() => jest.clearAllMocks());

describe("getRecipes", () => {
    it("returns mapped recipe objects", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([{ title: "Pasta" }, { title: "Salad" }]));
        const results = await getRecipes();
        expect(results).toHaveLength(2);
        expect(results[0]).toMatchObject({ id: "id0", title: "Pasta" });
    });

    it("returns [] on error", async () => {
        getDocs.mockRejectedValueOnce(new Error("Network error"));
        const results = await getRecipes();
        expect(results).toEqual([]);
    });
});

describe("getRecipeById", () => {
    it("returns the recipe when it exists", async () => {
        getDoc.mockResolvedValueOnce({ exists: () => true, id: "abc", data: () => ({ title: "Tacos" }) });
        const result = await getRecipeById("abc");
        expect(result).toMatchObject({ id: "abc", title: "Tacos" });
    });

    it("returns null when the doc does not exist", async () => {
        getDoc.mockResolvedValueOnce({ exists: () => false });
        const result = await getRecipeById("missing");
        expect(result).toBeNull();
    });
});

describe("uploadRecipe", () => {
    it("returns success with the new doc id", async () => {
        addDoc.mockResolvedValueOnce({ id: "newRecipe1" });
        const result = await uploadRecipe({ title: "New Recipe" });
        expect(result).toEqual({ success: true, id: "newRecipe1" });
    });

    it("returns success:false on error", async () => {
        addDoc.mockRejectedValueOnce(new Error("Upload failed"));
        const result = await uploadRecipe({ title: "Bad Recipe" });
        expect(result).toEqual({ success: false, error: "Upload failed" });
    });
});

describe("searchByIngredients", () => {
    it("returns [] for empty list", async () => {
        const results = await searchByIngredients([]);
        expect(results).toEqual([]);
    });

    it("filters to recipes containing all specified ingredients", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([
            { title: "Garlic Pasta", keywords: ["garlic", "pasta"], ingredients: [{ name: "garlic" }, { name: "pasta" }] },
            { title: "Garlic Bread", keywords: ["garlic", "bread"], ingredients: [{ name: "garlic" }, { name: "bread" }] },
        ]));
        const results = await searchByIngredients(["garlic", "pasta"]);
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe("Garlic Pasta");
    });
});

describe("deleteRecipe", () => {
    it("returns success:true after deleting ratings and recipe", async () => {
        getDocs.mockResolvedValueOnce({ docs: [{ ref: "RATING_REF" }] });
        const { deleteDoc } = require("firebase/firestore");
        deleteDoc.mockResolvedValue();
        const result = await deleteRecipe("recipe1");
        expect(result).toEqual({ success: true });
    });
});
