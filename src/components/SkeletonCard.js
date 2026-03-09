import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { BorderRadius, Spacing } from "../styles/theme";

const CARD_WIDTH = (Dimensions.get("window").width - Spacing.lg * 2 - Spacing.md) / 2;

const SkeletonCard = () => {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    const s = createStyles(colors);

    return (
        <View style={s.card}>
            <Animated.View style={[s.image, { opacity }]} />
            <View style={s.info}>
                <Animated.View style={[s.titleLine, { opacity }]} />
                <Animated.View style={[s.metaLine, { opacity }]} />
            </View>
        </View>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        card: {
            width: CARD_WIDTH,
            borderRadius: BorderRadius.md,
            overflow: "hidden",
            marginBottom: Spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
        },
        image: { width: "100%", height: CARD_WIDTH * 0.75, backgroundColor: colors.skeleton },
        info: { padding: Spacing.sm, gap: Spacing.sm },
        titleLine: { height: 14, width: "80%", borderRadius: 4, backgroundColor: colors.skeleton },
        metaLine: { height: 10, width: "50%", borderRadius: 4, backgroundColor: colors.skeleton },
    });

export default SkeletonCard;
