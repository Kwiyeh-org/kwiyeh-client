import { Pressable, View, Text } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();

  function toggleColorScheme() {
    const newTheme = isDarkColorScheme ? 'light' : 'dark';
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
  }

  return (
    <Pressable
      onPress={toggleColorScheme}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'flex-1 aspect-square pt-0.5 justify-center items-center web:px-5',
            pressed && 'opacity-70'
          )}
        >
          {isDarkColorScheme ? (
            // Instead of <MoonStar />, we use a moon emoji
            <Text style={{ fontSize: 23 }}>🌙</Text>
          ) : (
            // Instead of <Sun />, we use a sun emoji
            <Text style={{ fontSize: 24 }}>☀️</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
