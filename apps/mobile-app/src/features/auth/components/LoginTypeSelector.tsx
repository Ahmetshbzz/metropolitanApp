import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface LoginTypeSelectorProps {
  loginType: 'b2b' | 'b2c';
  onLoginTypeChange: (type: 'b2b' | 'b2c') => void;
}

export const LoginTypeSelector: React.FC<LoginTypeSelectorProps> = ({
  loginType,
  onLoginTypeChange,
}) => {
  // Buton animasyon değerleri
  const b2bScale = useSharedValue(loginType === 'b2b' ? 1.05 : 1);
  const b2cScale = useSharedValue(loginType === 'b2c' ? 1.05 : 1);

  // Buton animasyon stilleri
  const b2bAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: b2bScale.value }],
  }));

  const b2cAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: b2cScale.value }],
  }));

  const handleLoginTypeChange = (type: 'b2b' | 'b2c') => {
    onLoginTypeChange(type);

    // Buton animasyonları
    if (type === 'b2b') {
      b2bScale.value = withTiming(1.05, { duration: 200 });
      b2cScale.value = withTiming(1, { duration: 200 });
    } else {
      b2cScale.value = withTiming(1.05, { duration: 200 });
      b2bScale.value = withTiming(1, { duration: 200 });
    }
  };

  const tintColor = '#2563eb';

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 }}>
      {(['b2b', 'b2c'] as const).map((type) => {
        const isSelected = loginType === type;
        return (
          <Animated.View
            key={type}
            style={type === 'b2b' ? b2bAnimatedStyle : b2cAnimatedStyle}
          >
            <TouchableOpacity
              onPress={() => handleLoginTypeChange(type)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 24,
                borderRadius: 24,
                backgroundColor: isSelected ? tintColor : 'transparent',
                borderWidth: 1,
                borderColor: tintColor,
                shadowColor: isSelected ? tintColor : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.3 : 0,
                shadowRadius: 4,
                elevation: isSelected ? 4 : 0,
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#ffffff' : tintColor,
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                {type === 'b2b' ? 'Kurumsal' : 'Bireysel'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

