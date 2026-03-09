import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCOSV9jRrNALr5hMq9ujAzkYYvIfW_HXe4",
    authDomain: "recipe-app-ec18e.firebaseapp.com",
    projectId: "recipe-app-ec18e",
    storageBucket: "recipe-app-ec18e.firebasestorage.app",
    messagingSenderId: "122668164771",
    appId: "1:122668164771:web:702c52065c44eec36a4116",
    measurementId: "G-3YSPPG6FQM",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleRecipes = [
    {
        title: "Classic Pancakes",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
        category: "breakfast",
        cookingTime: 20,
        servings: 4,
        keywords: ["pancakes", "breakfast", "classic", "easy"],
        nutrition: { calories: 350, protein: 8, carbs: 45, fat: 14 },
        ingredients: [
            { name: "All-purpose flour", amount: "1.5", unit: "cups" },
            { name: "Milk", amount: "1.25", unit: "cups" },
            { name: "Egg", amount: "1", unit: "" },
            { name: "Butter (melted)", amount: "3", unit: "tbsp" },
            { name: "Sugar", amount: "2", unit: "tbsp" },
            { name: "Baking powder", amount: "2", unit: "tsp" },
            { name: "Salt", amount: "0.5", unit: "tsp" },
        ],
        instructions: [
            { step: 1, text: "Whisk flour, sugar, baking powder, and salt together in a large bowl." },
            { step: 2, text: "In a separate bowl, combine milk, melted butter, and egg." },
            {
                step: 3,
                text: "Pour wet ingredients into dry ingredients and stir until just combined. Do not overmix.",
            },
            { step: 4, text: "Heat a non-stick pan over medium heat. Pour about 1/4 cup batter per pancake." },
            {
                step: 5,
                text: "Cook until bubbles form on the surface (about 2 minutes), then flip and cook 1-2 more minutes.",
            },
            { step: 6, text: "Serve with maple syrup, fresh berries, or whipped cream." },
        ],
        averageRating: 0,
        totalRatings: 0,
        createdAt: serverTimestamp(),
    },
    {
        title: "Chicken Caesar Salad",
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
        category: "lunch",
        cookingTime: 25,
        servings: 2,
        keywords: ["chicken", "caesar", "salad", "lunch", "healthy"],
        nutrition: { calories: 420, protein: 35, carbs: 12, fat: 28 },
        ingredients: [
            { name: "Chicken breast", amount: "2", unit: "" },
            { name: "Romaine lettuce", amount: "1", unit: "head" },
            { name: "Parmesan cheese", amount: "0.5", unit: "cup" },
            { name: "Croutons", amount: "1", unit: "cup" },
            { name: "Caesar dressing", amount: "4", unit: "tbsp" },
            { name: "Lemon juice", amount: "1", unit: "tbsp" },
            { name: "Olive oil", amount: "2", unit: "tbsp" },
        ],
        instructions: [
            { step: 1, text: "Season chicken breasts with salt, pepper, and a drizzle of olive oil." },
            {
                step: 2,
                text: "Grill or pan-sear chicken over medium-high heat for 6-7 minutes per side until cooked through.",
            },
            { step: 3, text: "Let chicken rest for 5 minutes, then slice into strips." },
            { step: 4, text: "Chop romaine lettuce and place in a large bowl." },
            { step: 5, text: "Add croutons, parmesan, and Caesar dressing. Toss to combine." },
            { step: 6, text: "Top with sliced chicken and a squeeze of lemon juice." },
        ],
        averageRating: 0,
        totalRatings: 0,
        createdAt: serverTimestamp(),
    },
    {
        title: "Spaghetti Bolognese",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
        category: "dinner",
        cookingTime: 45,
        servings: 4,
        keywords: ["spaghetti", "bolognese", "pasta", "dinner", "italian", "meat"],
        nutrition: { calories: 580, protein: 28, carbs: 65, fat: 22 },
        ingredients: [
            { name: "Spaghetti", amount: "400", unit: "g" },
            { name: "Ground beef", amount: "500", unit: "g" },
            { name: "Onion (diced)", amount: "1", unit: "" },
            { name: "Garlic cloves (minced)", amount: "3", unit: "" },
            { name: "Crushed tomatoes", amount: "400", unit: "g" },
            { name: "Tomato paste", amount: "2", unit: "tbsp" },
            { name: "Olive oil", amount: "2", unit: "tbsp" },
            { name: "Dried oregano", amount: "1", unit: "tsp" },
            { name: "Salt and pepper", amount: "", unit: "to taste" },
        ],
        instructions: [
            { step: 1, text: "Heat olive oil in a large pan. Sauté onion until translucent, about 5 minutes." },
            { step: 2, text: "Add garlic and cook for 1 minute until fragrant." },
            { step: 3, text: "Add ground beef and cook until browned, breaking it apart with a spoon." },
            { step: 4, text: "Stir in crushed tomatoes, tomato paste, oregano, salt, and pepper." },
            { step: 5, text: "Simmer on low heat for 20 minutes, stirring occasionally." },
            { step: 6, text: "Meanwhile, cook spaghetti according to package directions. Drain." },
            { step: 7, text: "Serve sauce over spaghetti and top with parmesan cheese." },
        ],
        averageRating: 0,
        totalRatings: 0,
        createdAt: serverTimestamp(),
    },
    {
        title: "Chocolate Lava Cake",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600",
        category: "dessert",
        cookingTime: 30,
        servings: 2,
        keywords: ["chocolate", "cake", "lava", "dessert", "baking"],
        nutrition: { calories: 480, protein: 7, carbs: 42, fat: 32 },
        ingredients: [
            { name: "Dark chocolate", amount: "120", unit: "g" },
            { name: "Butter", amount: "100", unit: "g" },
            { name: "Eggs", amount: "2", unit: "" },
            { name: "Egg yolks", amount: "2", unit: "" },
            { name: "Sugar", amount: "50", unit: "g" },
            { name: "All-purpose flour", amount: "30", unit: "g" },
            { name: "Cocoa powder (for dusting)", amount: "1", unit: "tbsp" },
        ],
        instructions: [
            { step: 1, text: "Preheat oven to 425°F (220°C). Grease two ramekins and dust with cocoa powder." },
            { step: 2, text: "Melt chocolate and butter together in a double boiler or microwave. Stir until smooth." },
            { step: 3, text: "In a bowl, whisk eggs, egg yolks, and sugar until thick and pale." },
            { step: 4, text: "Fold the chocolate mixture into the egg mixture, then fold in the flour." },
            {
                step: 5,
                text: "Divide batter between ramekins. Bake for 12-14 minutes until edges are set but center jiggles.",
            },
            { step: 6, text: "Let cool for 1 minute, then invert onto plates. Serve immediately." },
        ],
        averageRating: 0,
        totalRatings: 0,
        createdAt: serverTimestamp(),
    },
];

async function seed() {
    console.log("Seeding recipes...");
    for (const recipe of sampleRecipes) {
        const ref = await addDoc(collection(db, "recipes"), recipe);
        console.log(`  Added: ${recipe.title} (${ref.id})`);
    }
    console.log(`Done! Seeded ${sampleRecipes.length} recipes.`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
