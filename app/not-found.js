import { Stack, useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Stack.Screen defines options for this screen */}
      <Stack.Screen options={{ title: 'Oops!' }} />

      <Text style={styles.title}>This screen does not exist.</Text>
      <Button title="Go to Home" onPress={() => router.push('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
});
