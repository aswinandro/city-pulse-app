// src/styles/backdrops.tsx

import React from "react"
import { View, ViewStyle } from "react-native"

export const BackdropWrapper = ({
  children,
  style = [],
}: {
  children: React.ReactNode
  style?: ViewStyle[] | ViewStyle
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          borderRadius: 16,
          padding: 16,
        },
        ...(Array.isArray(style) ? style : [style]),
      ]}
    >
      {children}
    </View>
  )
}
