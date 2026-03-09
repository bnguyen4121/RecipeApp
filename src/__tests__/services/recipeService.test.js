/* @jest-environment node */
import { db } from "../../services/firebase";
import { deleteRecipe, getRecipeById, getRecipes, searchByIngredients, uploadRecipe } from "../../services/recipeService";

const makeSnapshot = (docs) => ({
    docs: docs.map((data, i) => ({
        id: `id${i}`,
        data: () => data,
        ref: { delete: jest.fn().mockResolvedValue() },
    })),
});

beforeEach(() => jest.clearAllMocks());

describe("getRecipes", () => {
    it("returns mapped recipe objects", async () => {
        db.collection().orderBy().limit().get.mockResolvedValueOnce(
            makeSnapshot([{ title: "Pasta" }, { title: "Salad" }]),
        );
        const results = await getRecipes();
        expect(results).toHaveLength(2);
        expect(results[0]).toMatchObject({ id: "id0", title: "Pasta" });
    });

    it("returns [] on error", async () => {
        db.collection().orderBy().limit().get.mockRejectedValueOnce(new Error("Network error"));
        const results = await getRecipes();
        expect(results).toEqual([]);
    });
});

describe("getRecipeById", () => {
    it("returns the recipe when it exists", async () => {
        db.collection().doc().get.mockResolvedValueOnce({
            exists: true,
            id: "abc",
            data: () => ({ title: "Tacos" }),
        });
        const result = await getRecipeById("abc");
        expect(result).toMatchObject({ id: "abc", title: "Tacos" });
    });

    it("returns null when the doc does not exist", async () => {
        db.collection().doc().get.mockResolvedValueOnce({ exists: false });
        const result = await getRecipeById("missing");
        expect(result).toBeNull();
    });
});

describe("uploadRecipe", () => {
    it("returns success with the new doc id", async () => {
        db.collection().add.mockResolvedValueOnce({ id: "newRecipe1" });
        const result = await uploadRecipe({ title: "New Recipe" });
        expect(result).toEqual({ success: true, id: "newRecipe1" });
    });

    it("returns success:false on error", async () => {
        db.collection().add.mockRejectedValueOnce(new Error("Upload failed"));
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
        db.collection().where().limit().get.mockResolvedValueOnce(
            makeSnapshot([
                { title: "Garlic Pasta", keywords: ["garlic", "pasta"], ingredients: [{ name: "garlic" }, { name: "pasta" }] },
                { title: "Garlic Bread", keywords: ["garlic", "bread"], ingredients: [{ name: "garlic" }, { name: "bread" }] },
            ]),
        );
        const results = await searchByIngredients(["garlic", "pasta"]);
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe("Garlic Pasta");
    });
});

describe("deleteRecipe", () => {
    it("returns success:true after deleting ratings and recipe", async () => {
        db.collection().doc().collection().get.mockResolvedValueOnce(
            makeSnapshot([{ score: 5 }]),
        );
        db.collection().doc().delete.mockResolvedValueOnce();
        const result = await deleteRecipe("recipe1");
        expect(result).toEqual({ success: true });
    });
});
