//  "HomeSlider.tsx"
//  metropolitan app
//  Created by Ahmet on 27.06.2025.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { BaseCard } from "@/components/base/BaseCard";
import { OptimizedImage } from "@/components/performance/OptimizedImage";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const sliderImages = [
  require("@/assets/images/yayla.webp"),
  require("@/assets/images/yayla.webp"),
];

const { width } = Dimensions.get("window");
// 16:9 görünüm oranı daha doğal bir hero hissi verir
const SLIDER_HEIGHT = Math.round(width * (9 / 16));

export function HomeSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const activeIndexRef = useRef<number>(0);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const scrollToIndex = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  }, []);

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) return;
    autoScrollTimerRef.current = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % sliderImages.length;
      scrollToIndex(nextIndex);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, 3500);
  }, [scrollToIndex]);

  const stopAutoScroll = useCallback(() => {
    if (!autoScrollTimerRef.current) return;
    clearInterval(autoScrollTimerRef.current);
    autoScrollTimerRef.current = null;
  }, []);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  };

  return (
    <BaseCard padding={0} style={{ height: SLIDER_HEIGHT }}>
      <View style={{ width: "100%", height: SLIDER_HEIGHT }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          onScrollBeginDrag={stopAutoScroll}
          onScrollEndDrag={startAutoScroll}
          scrollEventThrottle={16}
          style={{ width, height: SLIDER_HEIGHT }}
        >
          {sliderImages.map((image, index) => (
            <View
              key={index}
              className="justify-center items-center"
              style={{ width, height: SLIDER_HEIGHT }}
              accessible
              accessibilityRole="imagebutton"
              accessibilityLabel={`Ana sayfa görseli ${index + 1}`}
            >
              <OptimizedImage
                source={image}
                style={{ width, height: "100%" }}
                contentFit="cover"
                placeholder={"L4ADf400MIRI00?b~qIU00%M~q9F"}
                priority="high"
              />
            </View>
          ))}
        </ScrollView>

        <View className="absolute bottom-2 left-0 right-0 flex-row justify-center items-center">
          {sliderImages.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full mx-1"
              style={[
                {
                  width: 8,
                  backgroundColor:
                    activeIndex === index ? colors.tint : colors.mediumGray,
                  opacity: activeIndex === index ? 1 : 0.6,
                },
                activeIndex === index && { width: 22 },
              ]}
            />
          ))}
        </View>
      </View>
    </BaseCard>
  );
}
