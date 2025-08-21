/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, Text, useColorScheme, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import './global.css';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const splashFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo animasyonu başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 2.5 saniye sonra fade out başlat
    const timer = setTimeout(() => {
      Animated.timing(splashFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, splashFadeAnim]);

  // Splash screen göster
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Animated.View 
          className="flex-1 bg-white justify-center items-center"
          style={{ opacity: splashFadeAnim }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Image 
              source={require('./assets/splash_logo.png')} 
              className="w-36 h-36"
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </SafeAreaProvider>
    );
  }

  const handleSubmit = () => {
    // Basit doğrulama
    const ok = name.trim() && email.trim();
    if (!ok) return;
    // Basit demo: console.log (Alert yerine sessiz)
    console.log('Gönderildi:', { name, email, message });
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} className="flex-1">
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
            {/* Başlık */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900">Modern Form</Text>
              <Text className="text-base text-gray-600 mt-1">Temiz ve kullanışlı bir demo ekranı</Text>
            </View>

            {/* Form Kartı */}
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* İsim */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">İsim Soyisim</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Adınızı girin"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  style={{ textAlign: 'left', textAlignVertical: 'center', includeFontPadding: false }}
                />
              </View>

              {/* E-posta */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">E-posta</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={{ textAlign: 'left', textAlignVertical: 'center', includeFontPadding: false }}
                />
              </View>

              {/* Mesaj */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Mesaj</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Mesajınızı yazın"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  style={{ textAlign: 'left', textAlignVertical: 'top', includeFontPadding: false, minHeight: 100 }}
                />
              </View>

              {/* Butonlar */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-black rounded-xl py-4"
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                >
                  <Text className="text-white text-center text-base font-semibold">Gönder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-100 rounded-xl py-4 border border-gray-200"
                  activeOpacity={0.85}
                  onPress={handleReset}
                >
                  <Text className="text-gray-800 text-center text-base font-semibold">Temizle</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alt bilgi */}
            <View className="items-center mt-6">
              <Text className="text-xs text-gray-500">MetropolitanApp • Demo UI</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;

