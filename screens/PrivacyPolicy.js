import React from 'react';
import {  Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.text}>
          Our app does not collect or share any personal data.
          All information Like Total Generation,Total Export, Total Import etc will stored locally on your device using AsyncStorage.
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
