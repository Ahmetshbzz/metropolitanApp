import React, { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthHeaderImage, PhoneLoginButton, LoginTypeSelector } from '../components';

interface WelcomeScreenProps {
  onPhoneLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPhoneLogin
}) => {
  const insets = useSafeAreaInsets();
  const { width: winWidth } = useWindowDimensions();
  const [loginType, setLoginType] = useState<'b2b' | 'b2c'>('b2c');

  // Responsive font sizes
  const titleFontSize = Math.max(24, Math.min(34, winWidth * 0.07));
  const subtitleFontSize = titleFontSize * 0.55;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <AuthHeaderImage />

      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 32 }}>
        {/* Welcome Text Section */}
        <View>
          <Text
            style={{ 
              fontSize: titleFontSize,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12,
              color: '#111827'
            }}
          >
            Metropolitana Hoş Geldiniz
          </Text>
          <Text
            style={{
              fontSize: subtitleFontSize,
              textAlign: 'center',
              color: '#6b7280',
              lineHeight: 24,
              maxWidth: '90%',
              alignSelf: 'center',
            }}
          >
            Kaliteli ürünler, kapınıza kadar gelsin.
          </Text>

          <LoginTypeSelector
            loginType={loginType}
            onLoginTypeChange={setLoginType}
          />
        </View>

        {/* Action Buttons Section */}
        <View
          style={{ 
            alignItems: 'center',
            paddingBottom: insets.bottom || 20 
          }}
        >
          <PhoneLoginButton
            onPress={onPhoneLogin}
            className="mb-6"
          />

          {/* Guest Login - Optional */}
          <Text style={{ color: '#6b7280', fontSize: 16 }}>
            Misafir olarak devam et
          </Text>
        </View>
      </View>
    </View>
  );
};
