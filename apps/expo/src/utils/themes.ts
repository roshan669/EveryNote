// themes.ts (or wherever you define your colors/spacing)
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get("window");

export const colors = {
    background: '#0a0a0a',
    foreground: '#fafafa',
    mutedForeground: '#a1a1aa',
    white: '#fff',
    black: '#000',
    googleAuth: '#f6faff',
    appleAuth: '#1e1e1e',
};

// export const fontSizes = {
//     xs: 12,
//     sm: 14,
//     base: 16,
//     lg: 18,
//     xl: 20,
//     '2xl': 24,
//     '3xl': 30,
// };

export { screenWidth }; // Export screenWidth as well