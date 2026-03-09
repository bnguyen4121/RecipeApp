module.exports = {
    preset: "jest-expo",
    setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
    // Runs after the preset's setupFiles — overrides the __ExpoImportMetaRegistry
    // getter that expo installs, which tries to load import.meta (unsupported in Jest)
    setupFiles: ["<rootDir>/jest.setup.js"],
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-async-storage/.*|firebase|@firebase/.*)",
    ],
    moduleNameMapper: {
        // Catch all paths that resolve to src/services/firebase — including
        // the "./firebase" import inside recipeService.js itself
        "^(\\.\\.[\\/]services[\\/]firebase|\\.[\\/]firebase)$": "<rootDir>/src/__mocks__/firebase.js",
        // AsyncStorage uses native modules — redirect to the official jest mock
        "@react-native-async-storage/async-storage": require.resolve(
            "@react-native-async-storage/async-storage/jest/async-storage-mock",
        ),
    },
    maxWorkers: 1,
};
