import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Yükleniyor...',
  size = 'large',
  className = '',
}) => {
  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <ActivityIndicator size={size} color="#2563eb" />
      {message && (
        <Text className="text-gray-600 mt-4 text-base">
          {message}
        </Text>
      )}
    </View>
  );
};

