import { fireEvent, render, screen } from "@testing-library/react-native";
import CategoryChip from "../../components/CategoryChip";
import { ThemeProvider } from "../../contexts/ThemeContext";

// Ionicons renders fine in tests but we stub it to avoid native module issues
jest.mock("@expo/vector-icons", () => ({
    Ionicons: ({ name, testID }) => {
        const { Text } = require("react-native");
        return <Text testID={testID || "icon"}>{name}</Text>;
    },
}));

const renderChip = (props) =>
    render(
        <ThemeProvider>
            <CategoryChip {...props} />
        </ThemeProvider>,
    );

describe("CategoryChip", () => {
    it("renders the label", () => {
        renderChip({ label: "Breakfast", icon: "sunny-outline", selected: false, onPress: jest.fn() });

        expect(screen.getByText("Breakfast")).toBeTruthy();
    });

    it("calls onPress when tapped", () => {
        const onPress = jest.fn();
        renderChip({ label: "Lunch", icon: "restaurant-outline", selected: false, onPress });

        fireEvent.press(screen.getByText("Lunch"));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("renders in selected state without crashing", () => {
        renderChip({ label: "Dinner", icon: "moon-outline", selected: true, onPress: jest.fn() });

        expect(screen.getByText("Dinner")).toBeTruthy();
    });
});
