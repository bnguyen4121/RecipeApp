/* @jest-environment node */

import { db } from "../../services/firebase";

const userId = "user1";

function getListRef() {
    return db.collection("users").doc(userId).collection("shoppingList");
}

async function addItem(ingredient, recipeTitle = null) {
    await getListRef().add({
        name: ingredient.name,
        amount: ingredient.amount || "",
        unit: ingredient.unit || "",
        checked: false,
        recipeTitle,
    });
}

async function toggleItem(itemId, currentChecked) {
    await db.collection("users").doc(userId).collection("shoppingList").doc(itemId).update({
        checked: !currentChecked,
    });
}

async function removeItem(itemId) {
    await db.collection("users").doc(userId).collection("shoppingList").doc(itemId).delete();
}

async function clearChecked() {
    const snapshot = await getListRef().where("checked", "==", true).get();
    const batch = db.batch();
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}

beforeEach(() => jest.clearAllMocks());

describe("addItem", () => {
    it("calls add with the ingredient data", async () => {
        db.collection().doc().collection().add.mockResolvedValueOnce({ id: "item1" });
        await addItem({ name: "Garlic", amount: "3", unit: "cloves" }, "Pasta");
        expect(db.collection().doc().collection().add).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Garlic", amount: "3", unit: "cloves", checked: false }),
        );
    });
});

describe("toggleItem", () => {
    it("flips checked to true", async () => {
        db.collection().doc().update.mockResolvedValueOnce();
        await toggleItem("item1", false);
        expect(db.collection().doc().update).toHaveBeenCalledWith({ checked: true });
    });

    it("flips checked to false", async () => {
        db.collection().doc().update.mockResolvedValueOnce();
        await toggleItem("item1", true);
        expect(db.collection().doc().update).toHaveBeenCalledWith({ checked: false });
    });
});

describe("removeItem", () => {
    it("calls delete on the item ref", async () => {
        db.collection().doc().delete.mockResolvedValueOnce();
        await removeItem("item1");
        expect(db.collection().doc().delete).toHaveBeenCalled();
    });
});

describe("clearChecked", () => {
    it("queries for checked items and deletes them via batch", async () => {
        const mockRef = { delete: jest.fn() };
        db.collection().doc().collection().where().get.mockResolvedValueOnce({
            docs: [{ ref: mockRef }],
        });
        await clearChecked();
        expect(db.collection().doc().collection().where).toHaveBeenCalledWith("checked", "==", true);
        expect(db.batch().delete).toHaveBeenCalled();
    });
});
