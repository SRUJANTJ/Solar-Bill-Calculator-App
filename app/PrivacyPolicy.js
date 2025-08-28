import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.backText}></Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.text}>
          Our app does not collect or share any personal data.
          All information like Total Generation, Total Export, Total Import etc will be stored locally on your device using AsyncStorage.
          We respect your privacy and ensure no data is transmitted or sold.
        </Text>
        <Text style={styles.text}>
          By using this app, you agree to the terms outlined in this privacy policy.
        </Text>
        <Text style={styles.text}>
          If you have any concerns, please contact the developer.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  header: {
    marginTop: 40, // move header down from top
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
});

export default PrivacyPolicy;
