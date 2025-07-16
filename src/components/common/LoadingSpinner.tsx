import { View, ActivityIndicator } from "react-native"

interface LoadingSpinnerProps {
  readonly color?: string
  readonly size?: "small" | "large"
}

export default function LoadingSpinner({ color = "#3B82F6", size = "large" }: LoadingSpinnerProps) {
  return (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}
