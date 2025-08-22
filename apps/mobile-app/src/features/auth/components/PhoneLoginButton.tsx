import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

interface PhoneLoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  className?: string;
}

export const PhoneLoginButton: React.FC<PhoneLoginButtonProps> = ({
  onPress,
  loading = false,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        opacity: loading ? 0.7 : 1,
      }}
      className={className}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20, marginRight: 8 }}>📱</Text>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Telefon Numarası ile Devam Et
        </Text>
      </View>
    </TouchableOpacity>
  );
};
